import { getApp, getApps, initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyDBhdXf3RwhVItg4-q7996EqdGfZLvGec",
  authDomain: "sos-reparo-12345.firebaseapp.com",
  databaseURL: "https://sos-reparo-12345-default-rtdb.firebaseio.com",
  projectId: "sos-reparo-12345",
  storageBucket: "sos-reparo-12345.firebasestorage.app",
  messagingSenderId: "551225330549",
  appId: "1:551225330549:web:508a4f1424ad5ae996e13c",
  measurementId: "G-NM11GS23SP",
};

const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const database = getDatabase(app);
export const storage = getStorage(app);
export default app;
