
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    projectId: "casa-marquito-9d8a5",
    appId: "1:176703291465:web:8c685cd45d65637be7bf98",
    storageBucket: "casa-marquito-9d8a5.firebasestorage.app",
    apiKey: "AIzaSyDzSIIGO8LzsvWX1F2GEIAr573s9JqENRE",
    authDomain: "casa-marquito-9d8a5.firebaseapp.com",
    messagingSenderId: "176703291465",
    projectNumber: "176703291465"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;
