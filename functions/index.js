const { onRequest } = require('firebase-functions/v2/https');
const { logger } = require('firebase-functions');
const admin = require('firebase-admin');
const cors = require('cors');
const express = require('express');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const multer = require('multer');
const sharp = require('sharp');
const crypto = require('crypto');
const { v1: { TranscoderServiceClient } } = require('@google-cloud/video-transcoder');

admin.initializeApp();
const db = admin.firestore();
const bucket = admin.storage().bucket();
const app = express();
const SAFE_COLLECTIONS = new Set(['services', 'stylists', 'gallery', 'media', 'comments', 'settings', 'bookings']);
const SAFE_SETTING_IDS = new Set(['pageSettings', 'businessSettings']);
const BOOKING_STATUSES = new Set(['Confirmed', 'Pending', 'Completed', 'Cancelled', 'Verified', 'Refunded']);
const ID_PATTERN = /^[A-Za-z0-9_-]{1,128}$/;
const allowedEmails = () => new Set((process.env.ADMIN_ALLOWED_EMAILS || '').split(',').map((email) => email.trim().toLowerCase()).filter(Boolean));
const allowedUids = () => new Set((process.env.ADMIN_ALLOWED_UIDS || '').split(',').map((uid) => uid.trim()).filter((uid) => ID_PATTERN.test(uid)));
const trustedOrigins = () => new Set((process.env.ADMIN_ORIGIN || 'https://tressesbykay-7fb99.web.app,https://tressesbykay-7fb99.firebaseapp.com').split(',').map((origin) => origin.trim().replace(/\/$/, '')).filter(Boolean));

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 45 * 1024 * 1024, files: 1 },
  fileFilter: (_request, file, done) => done(null, ['image/jpeg', 'image/png', 'image/webp', 'video/mp4', 'video/webm'].includes(file.mimetype)),
});

app.disable('x-powered-by');
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' }, contentSecurityPolicy: false }));
app.use(cors({ origin: (origin, done) => !origin || trustedOrigins().has(origin.replace(/\/$/, '')) ? done(null, true) : done(new Error('Origin not allowed')), credentials: true, methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'] }));
app.use(express.json({ limit: '32kb', strict: true }));
app.use('/public', rateLimit({ windowMs: 15 * 60_000, limit: 40, standardHeaders: 'draft-8', legacyHeaders: false }));
app.use('/session', rateLimit({ windowMs: 15 * 60_000, limit: 10, standardHeaders: 'draft-8', legacyHeaders: false }));

function plainText(value, maxLength, required = false) {
  if (typeof value !== 'string') return required ? null : '';
  const clean = value.trim().replace(/[\u0000-\u001F\u007F]/g, ' ');
  return clean && clean.length <= maxLength ? clean : required ? null : '';
}

function validId(value) { return typeof value === 'string' && ID_PATTERN.test(value); }
function isAdmin(decoded) {
  return Boolean(decoded && ((decoded.email && allowedEmails().has(decoded.email.toLowerCase())) || allowedUids().has(decoded.uid)));
}
function publicAssetUrl(path) { return `https://storage.googleapis.com/${bucket.name}/${encodeURIComponent(path).replace(/%2F/g, '/')}`; }
function sessionCookie(request) {
  const match = (request.get('cookie') || '').match(/(?:^|;\s*)__session=([^;]+)/);
  return match ? decodeURIComponent(match[1]) : null;
}
function requireTrustedOrigin(request, response, next) {
  const origin = request.get('origin');
  if (!origin || !trustedOrigins().has(origin.replace(/\/$/, ''))) return response.status(403).json({ error: 'Untrusted request origin.' });
  return next();
}
async function authAdmin(request, response, next) {
  try {
    const bearer = request.get('authorization') || '';
    const token = bearer.startsWith('Bearer ') ? bearer.slice(7) : null;
    const session = sessionCookie(request);
    const decoded = session ? await admin.auth().verifySessionCookie(session, true) : token ? await admin.auth().verifyIdToken(token, true) : null;
    if (!isAdmin(decoded)) return response.status(403).json({ error: 'Admin access is required.' });
    request.admin = { uid: decoded.uid, email: decoded.email?.toLowerCase() || decoded.uid };
    return next();
  } catch { return response.status(401).json({ error: 'Your admin session has expired.' }); }
}
async function rateLimitUpload(uid) {
  const ref = db.collection('_uploadLimits').doc(`${uid}_${Math.floor(Date.now() / 60_000)}`);
  await db.runTransaction(async (transaction) => {
    const current = await transaction.get(ref);
    const count = current.exists ? current.data().count : 0;
    if (count >= 3) throw new Error('RATE_LIMIT');
    transaction.set(ref, { count: count + 1, expiresAt: admin.firestore.Timestamp.fromMillis(Date.now() + 120_000) }, { merge: true });
  });
}
function toDocument(document) { return { id: document.id, ...document.data() }; }
function audit(action, request, target) { return db.collection('_auditLogs').add({ action, target, actor: request.admin.email, uid: request.admin.uid, at: admin.firestore.FieldValue.serverTimestamp() }); }

app.get('/session', authAdmin, (request, response) => response.json({ email: request.admin.email }));
app.post('/session', requireTrustedOrigin, async (request, response) => {
  try {
    const idToken = request.body?.idToken;
    if (typeof idToken !== 'string' || idToken.length > 4096) return response.status(400).json({ error: 'An ID token is required.' });
    const decoded = await admin.auth().verifyIdToken(idToken, true);
    if (!isAdmin(decoded)) return response.status(403).json({ error: 'This account is not an administrator.' });
    const session = await admin.auth().createSessionCookie(idToken, { expiresIn: 8 * 60 * 60 * 1000 });
    response.cookie('__session', session, { httpOnly: true, secure: true, sameSite: 'strict', maxAge: 8 * 60 * 60 * 1000, path: '/api' });
    return response.status(204).end();
  } catch { return response.status(401).json({ error: 'Unable to create an admin session.' }); }
});
app.delete('/session', requireTrustedOrigin, (_request, response) => { response.clearCookie('__session', { path: '/api', secure: true, sameSite: 'strict' }); response.status(204).end(); });

// Public data is intentionally constrained to published catalog content only.
app.get('/public/comments', async (_request, response) => {
  const snapshot = await db.collection('comments').where('adminReply', '!=', '').limit(100).get();
  response.json(snapshot.docs.map(toDocument));
});
app.get('/public/reviews', async (_request, response) => {
  const snapshot = await db.collection('reviews').where('verified', '==', true).limit(100).get();
  response.json(snapshot.docs.map(toDocument));
});
app.post('/public/inquiries', async (request, response) => {
  const clientName = plainText(request.body?.clientName, 80, true);
  const clientPhone = plainText(request.body?.clientPhone, 32, true);
  const message = plainText(request.body?.message, 1000) || 'Requested callback / consultation.';
  if (!clientName || !clientPhone || !/^[+0-9 ()-]{7,32}$/.test(clientPhone)) return response.status(400).json({ error: 'Enter a valid name and phone number.' });
  await db.collection('comments').add({ bookingId: 'General Inquiry', clientName, clientPhone, message, date: new Date().toISOString().slice(0, 10), createdAt: admin.firestore.FieldValue.serverTimestamp() });
  response.status(201).json({ ok: true });
});
app.post('/public/reviews', async (request, response) => {
  const clientName = plainText(request.body?.clientName, 80, true);
  const serviceBooked = plainText(request.body?.serviceBooked, 100, true);
  const quote = plainText(request.body?.quote, 1000, true);
  const rating = Number(request.body?.rating);
  if (!clientName || !serviceBooked || !quote || !Number.isInteger(rating) || rating < 1 || rating > 5) return response.status(400).json({ error: 'Invalid review.' });
  await db.collection('reviews').add({ clientName, serviceBooked, quote, rating, date: new Date().toISOString().slice(0, 10), verified: false, createdAt: admin.firestore.FieldValue.serverTimestamp() });
  response.status(201).json({ ok: true });
});
app.post('/public/bookings', async (request, response) => {
  const serviceId = plainText(request.body?.serviceId, 128, true);
  const clientName = plainText(request.body?.clientName, 80, true);
  const clientPhone = plainText(request.body?.clientPhone, 32, true);
  const date = plainText(request.body?.date, 10, true);
  const timeSlot = plainText(request.body?.timeSlot, 32, true);
  const locationType = request.body?.locationType === 'housecall' ? 'housecall' : 'studio';
  if (!validId(serviceId) || !clientName || !clientPhone || !/^\d{4}-\d{2}-\d{2}$/.test(date) || !timeSlot || !/^[+0-9 ()-]{7,32}$/.test(clientPhone)) return response.status(400).json({ error: 'Invalid booking details.' });
  if (date < new Date().toISOString().slice(0, 10)) return response.status(400).json({ error: 'Choose a future appointment date.' });
  const serviceDocument = await db.collection('services').doc(serviceId).get();
  if (!serviceDocument.exists) return response.status(400).json({ error: 'The selected service is unavailable.' });
  const service = serviceDocument.data();
  const totalPrice = Number(service.price) + (locationType === 'housecall' ? 1500 : 0);
  const housecall = request.body?.housecallDetails || {};
  const booking = {
    service: { id: serviceDocument.id, name: service.name, category: service.category, price: Number(service.price), durationMinutes: Number(service.durationMinutes) || 60, durationLabel: plainText(service.durationLabel, 32) || '1 hr' },
    locationType, housecallDetails: locationType === 'housecall' ? { estate: plainText(housecall.estate, 100, true), address: plainText(housecall.address, 160), landmark: plainText(housecall.landmark, 100) } : null,
    date, timeSlot, depositPaid: 0, totalPrice, balanceDue: totalPrice, status: 'Pending', clientName, clientPhone,
    notes: plainText(request.body?.notes, 1000), requestedStylistName: plainText(request.body?.requestedStylistName, 80) || 'None', durationMinutes: Number(service.durationMinutes) || 60,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  };
  if (locationType === 'housecall' && !booking.housecallDetails.estate) return response.status(400).json({ error: 'Enter the housecall estate.' });
  const document = await db.collection('bookings').add(booking);
  response.status(201).json({ id: document.id });
});

app.get('/admin/:collection', authAdmin, async (request, response) => {
  const collectionName = request.params.collection;
  if (!SAFE_COLLECTIONS.has(collectionName)) return response.status(404).json({ error: 'Unknown collection.' });
  const snapshot = await db.collection(collectionName).limit(1000).get();
  response.json(snapshot.docs.map(toDocument));
});
app.put('/admin/:collection/:id', authAdmin, requireTrustedOrigin, async (request, response) => {
  const { collection: collectionName, id } = request.params;
  if (!SAFE_COLLECTIONS.has(collectionName) || !validId(id) || (collectionName === 'settings' && !SAFE_SETTING_IDS.has(id))) return response.status(400).json({ error: 'Invalid document target.' });
  if (!request.body || typeof request.body !== 'object' || Array.isArray(request.body)) return response.status(400).json({ error: 'Invalid document.' });
  await db.collection(collectionName).doc(id).set({ ...request.body, updatedAt: admin.firestore.FieldValue.serverTimestamp() }, { merge: false });
  await audit('write', request, `${collectionName}/${id}`);
  response.status(204).end();
});
app.delete('/admin/:collection/:id', authAdmin, requireTrustedOrigin, async (request, response) => {
  const { collection: collectionName, id } = request.params;
  if (!SAFE_COLLECTIONS.has(collectionName) || !validId(id) || collectionName === 'settings') return response.status(400).json({ error: 'Invalid document target.' });
  await db.collection(collectionName).doc(id).delete(); await audit('delete', request, `${collectionName}/${id}`); response.status(204).end();
});
app.get('/admin/bookings', authAdmin, async (_request, response) => { const snapshot = await db.collection('bookings').orderBy('date', 'asc').get(); response.json(snapshot.docs.map(toDocument)); });
app.patch('/admin/bookings/:id', authAdmin, requireTrustedOrigin, async (request, response) => {
  if (!validId(request.params.id) || !request.body || typeof request.body !== 'object') return response.status(400).json({ error: 'Invalid booking.' });
  const updates = {};
  if (request.body.status !== undefined) { if (!BOOKING_STATUSES.has(request.body.status)) return response.status(400).json({ error: 'Invalid booking status.' }); updates.status = request.body.status; }
  for (const key of ['depositPaid', 'refundAmount']) if (request.body[key] !== undefined && Number.isFinite(request.body[key]) && request.body[key] >= 0) updates[key] = Math.round(request.body[key]);
  for (const key of ['adminComment', 'verifiedAt']) if (request.body[key] !== undefined) { const value = plainText(request.body[key], key === 'adminComment' ? 1000 : 40); if (value !== null) updates[key] = value; }
  if (!Object.keys(updates).length) return response.status(400).json({ error: 'No valid booking changes.' });
  updates.updatedAt = admin.firestore.FieldValue.serverTimestamp();
  await db.collection('bookings').doc(request.params.id).update(updates); await audit('booking-update', request, request.params.id); response.status(204).end();
});
app.delete('/admin/bookings/:id', authAdmin, requireTrustedOrigin, async (request, response) => { if (!validId(request.params.id)) return response.status(400).json({ error: 'Invalid booking.' }); await db.collection('bookings').doc(request.params.id).delete(); await audit('booking-delete', request, request.params.id); response.status(204).end(); });
app.post('/admin/seed', authAdmin, requireTrustedOrigin, async (request, response) => {
  const { services = [], stylists = [], gallery = [], pageSettings } = request.body || {};
  if (!Array.isArray(services) || !Array.isArray(stylists) || !Array.isArray(gallery) || !pageSettings) return response.status(400).json({ error: 'Invalid seed payload.' });
  const batch = db.batch();
  for (const item of services) if (validId(item.id)) batch.set(db.collection('services').doc(item.id), item);
  for (const item of stylists) if (validId(item.id)) batch.set(db.collection('stylists').doc(item.id), item);
  for (const item of gallery) if (validId(item.id)) batch.set(db.collection('gallery').doc(item.id), item);
  batch.set(db.collection('settings').doc('pageSettings'), pageSettings); await batch.commit(); await audit('seed', request, 'catalog'); response.status(204).end();
});
app.post('/admin/assets', authAdmin, requireTrustedOrigin, upload.single('asset'), async (request, response) => {
  try {
    if (!request.file) return response.status(400).json({ error: 'Upload one supported image or video.' });
    await rateLimitUpload(request.admin.uid); const id = crypto.randomUUID();
    if (request.file.mimetype.startsWith('image/')) {
      const webp = await sharp(request.file.buffer).rotate().resize({ width: 1600, height: 1600, fit: 'inside', withoutEnlargement: true }).webp({ quality: 82 }).toBuffer();
      const path = `public/assets/images/${id}.webp`;
      await bucket.file(path).save(webp, { contentType: 'image/webp', resumable: false, metadata: { cacheControl: 'public,max-age=31536000,immutable' } });
      await db.collection('media').doc(id).set({ name: request.file.originalname, url: publicAssetUrl(path), type: 'image', size: webp.length, uploadedAt: new Date().toISOString(), createdBy: request.admin.uid });
      await audit('asset-upload', request, id); return response.status(201).json({ id, kind: 'image', url: publicAssetUrl(path), bytes: webp.length });
    }
    const originalPath = `private/uploads/${id}.${request.file.mimetype === 'video/webm' ? 'webm' : 'mp4'}`;
    await bucket.file(originalPath).save(request.file.buffer, { contentType: request.file.mimetype, resumable: false, metadata: { cacheControl: 'private,no-store' } });
    const location = process.env.TRANSCODER_LOCATION || 'us-central1'; const projectId = process.env.GCLOUD_PROJECT; const outputPrefix = `public/assets/videos/${id}/`;
    const [job] = await new TranscoderServiceClient().createJob({ parent: `projects/${projectId}/locations/${location}`, job: { inputUri: `gs://${bucket.name}/${originalPath}`, outputUri: `gs://${bucket.name}/${outputPrefix}`, templateId: 'preset/web-hd' } });
    await db.collection('mediaJobs').doc(id).set({ status: 'transcoding', job: job.name, originalPath, outputPrefix, createdAt: admin.firestore.FieldValue.serverTimestamp(), createdBy: request.admin.uid }); await audit('video-upload', request, id);
    return response.status(202).json({ id, kind: 'video', status: 'transcoding' });
  } catch (error) { if (error.message === 'RATE_LIMIT') return response.status(429).json({ error: 'Upload limit reached. Try again in one minute.' }); logger.error('Media upload failed', error); return response.status(500).json({ error: 'The media processor could not accept this upload.' }); }
});
app.use((error, _request, response, _next) => { if (error instanceof multer.MulterError) return response.status(413).json({ error: 'The upload is larger than the 45 MB limit.' }); logger.warn('Rejected API request', { message: error.message }); return response.status(400).json({ error: 'Invalid request.' }); });

exports.api = onRequest({ region: 'us-central1', timeoutSeconds: 120, memory: '1GiB', maxInstances: 10 }, app);
