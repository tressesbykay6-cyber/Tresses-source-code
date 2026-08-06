const { onRequest } = require('firebase-functions/v2/https');
const { logger } = require('firebase-functions');
const admin = require('firebase-admin');
const cors = require('cors');
const express = require('express');
const multer = require('multer');
const sharp = require('sharp');
const crypto = require('crypto');
const { v1: { TranscoderServiceClient } } = require('@google-cloud/video-transcoder');

admin.initializeApp();
const db = admin.firestore();
const bucket = admin.storage().bucket();
const app = express();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 45 * 1024 * 1024, files: 1 },
  fileFilter: (_request, file, done) => done(null, ['image/jpeg', 'image/png', 'image/webp', 'video/mp4', 'video/webm'].includes(file.mimetype)),
});
const allowedEmails = () => new Set((process.env.ADMIN_ALLOWED_EMAILS || '').split(',').map((email) => email.trim().toLowerCase()).filter(Boolean));

app.use(cors({ origin: process.env.ADMIN_ORIGIN || false, credentials: true, methods: ['GET', 'POST', 'PUT', 'DELETE'] }));
app.use(express.json({ limit: '250kb' }));

function publicAssetUrl(path) {
  return `https://storage.googleapis.com/${bucket.name}/${encodeURIComponent(path).replace(/%2F/g, '/')}`;
}

function sessionCookie(request) {
  const cookie = request.get('cookie') || '';
  const match = cookie.match(/(?:^|;\s*)__session=([^;]+)/);
  return match ? decodeURIComponent(match[1]) : null;
}

async function authAdmin(request, response, next) {
  try {
    const bearer = request.get('authorization') || '';
    const token = bearer.startsWith('Bearer ') ? bearer.slice(7) : null;
    const session = sessionCookie(request);
    const decoded = session
      ? await admin.auth().verifySessionCookie(session, true)
      : token ? await admin.auth().verifyIdToken(token, true) : null;
    if (!decoded || !decoded.email || !allowedEmails().has(decoded.email.toLowerCase())) return response.status(403).json({ error: 'Admin access is required.' });
    request.admin = { uid: decoded.uid, email: decoded.email.toLowerCase() };
    return next();
  } catch {
    return response.status(401).json({ error: 'Your admin session has expired.' });
  }
}

async function rateLimitUpload(uid) {
  const key = `${uid}_${Math.floor(Date.now() / 60_000)}`;
  const ref = db.collection('_uploadLimits').doc(key);
  await db.runTransaction(async (transaction) => {
    const current = await transaction.get(ref);
    const count = current.exists ? current.data().count : 0;
    if (count >= 3) throw new Error('RATE_LIMIT');
    transaction.set(ref, { count: count + 1, expiresAt: admin.firestore.Timestamp.fromMillis(Date.now() + 120_000) }, { merge: true });
  });
}

app.get('/session', authAdmin, (request, response) => response.json({ email: request.admin.email }));

app.post('/session', async (request, response) => {
  try {
    const idToken = request.body?.idToken;
    if (!idToken) return response.status(400).json({ error: 'An ID token is required.' });
    const decoded = await admin.auth().verifyIdToken(idToken, true);
    if (!decoded.email || !allowedEmails().has(decoded.email.toLowerCase())) return response.status(403).json({ error: 'This account is not an administrator.' });
    const sessionCookie = await admin.auth().createSessionCookie(idToken, { expiresIn: 5 * 24 * 60 * 60 * 1000 });
    response.cookie('__session', sessionCookie, { httpOnly: true, secure: true, sameSite: 'strict', maxAge: 5 * 24 * 60 * 60 * 1000, path: '/api' });
    return response.status(204).end();
  } catch {
    return response.status(401).json({ error: 'Unable to create an admin session.' });
  }
});

app.delete('/session', (_request, response) => {
  response.clearCookie('__session', { path: '/api', secure: true, sameSite: 'strict' });
  response.status(204).end();
});

app.get('/admin/services', authAdmin, async (_request, response) => {
  const snapshot = await db.collection('services').orderBy('name').get();
  response.json(snapshot.docs.map((document) => ({ id: document.id, ...document.data() })));
});

app.post('/admin/services', authAdmin, async (request, response) => {
  const payload = request.body;
  if (!payload?.name || !payload?.category || !Number.isFinite(payload?.price)) return response.status(400).json({ error: 'Invalid service.' });
  const document = await db.collection('services').add({ ...payload, createdAt: admin.firestore.FieldValue.serverTimestamp(), updatedAt: admin.firestore.FieldValue.serverTimestamp() });
  response.status(201).json({ id: document.id });
});

app.put('/admin/services/:id', authAdmin, async (request, response) => {
  await db.collection('services').doc(request.params.id).set({ ...request.body, updatedAt: admin.firestore.FieldValue.serverTimestamp() }, { merge: true });
  response.status(204).end();
});

app.delete('/admin/services/:id', authAdmin, async (request, response) => {
  await db.collection('services').doc(request.params.id).delete();
  response.status(204).end();
});

app.get('/admin/bookings', authAdmin, async (_request, response) => {
  const snapshot = await db.collection('bookings').orderBy('date', 'asc').get();
  response.json(snapshot.docs.map((document) => ({ id: document.id, ...document.data() })));
});

app.patch('/admin/bookings/:id', authAdmin, async (request, response) => {
  const status = request.body?.status;
  if (!['Confirmed', 'Pending', 'Completed', 'Cancelled'].includes(status)) return response.status(400).json({ error: 'Invalid booking status.' });
  await db.collection('bookings').doc(request.params.id).update({ status, updatedAt: admin.firestore.FieldValue.serverTimestamp() });
  response.status(204).end();
});

app.post('/admin/assets', authAdmin, upload.single('asset'), async (request, response) => {
  try {
    if (!request.file) return response.status(400).json({ error: 'Upload one supported image or video.' });
    await rateLimitUpload(request.admin.uid);
    const id = crypto.randomUUID();
    if (request.file.mimetype.startsWith('image/')) {
      const webp = await sharp(request.file.buffer).rotate().resize({ width: 1600, height: 1600, fit: 'inside', withoutEnlargement: true }).webp({ quality: 82 }).toBuffer();
      const path = `public/assets/images/${id}.webp`;
      await bucket.file(path).save(webp, { contentType: 'image/webp', resumable: false, metadata: { cacheControl: 'public,max-age=31536000,immutable' } });
      return response.status(201).json({ id, kind: 'image', url: publicAssetUrl(path), bytes: webp.length });
    }

    const originalPath = `private/uploads/${id}.${request.file.mimetype === 'video/webm' ? 'webm' : 'mp4'}`;
    await bucket.file(originalPath).save(request.file.buffer, { contentType: request.file.mimetype, resumable: false, metadata: { cacheControl: 'private,no-store' } });
    const location = process.env.TRANSCODER_LOCATION || 'us-central1';
    const projectId = process.env.GCLOUD_PROJECT;
    const outputPrefix = `public/assets/videos/${id}/`;
    const transcoder = new TranscoderServiceClient();
    const [job] = await transcoder.createJob({ parent: `projects/${projectId}/locations/${location}`, job: { inputUri: `gs://${bucket.name}/${originalPath}`, outputUri: `gs://${bucket.name}/${outputPrefix}`, templateId: 'preset/web-hd' } });
    await db.collection('mediaJobs').doc(id).set({ status: 'transcoding', job: job.name, originalPath, outputPrefix, createdAt: admin.firestore.FieldValue.serverTimestamp(), createdBy: request.admin.uid });
    return response.status(202).json({ id, kind: 'video', status: 'transcoding' });
  } catch (error) {
    if (error.message === 'RATE_LIMIT') return response.status(429).json({ error: 'Upload limit reached. Try again in one minute.' });
    logger.error('Media upload failed', error);
    return response.status(500).json({ error: 'The media processor could not accept this upload.' });
  }
});

app.use((error, _request, response, _next) => {
  if (error instanceof multer.MulterError) return response.status(413).json({ error: 'The upload is larger than the 45 MB limit.' });
  return response.status(400).json({ error: 'Invalid request.' });
});

exports.api = onRequest({ region: 'us-central1', timeoutSeconds: 120, memory: '1GiB', maxInstances: 10 }, app);
