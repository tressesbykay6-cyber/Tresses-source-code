import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyDId4nHz3gznIN7OneypEIQfCBajZaKs44",
  authDomain: "tressesbykay-7fb99.firebaseapp.com",
  projectId: "tressesbykay-7fb99",
  storageBucket: "tressesbykay-7fb99.firebasestorage.app",
  messagingSenderId: "582667344693",
  appId: "1:582667344693:web:fb88bfe89b995b3c4bca7c",
  measurementId: "G-4E8V001KQX",
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);
export default app;
