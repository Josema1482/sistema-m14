// firebase.js

import { initializeApp } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-app.js";

import {
    getFirestore,
    collection,
    addDoc,
    getDocs,
    updateDoc,
    deleteDoc,
    doc,
    getDoc
} from "https://www.gstatic.com/firebasejs/11.9.1/firebase-firestore.js";

import {
    getStorage,
    ref,
    uploadBytes,
    getDownloadURL,
    deleteObject
} from "https://www.gstatic.com/firebasejs/11.9.1/firebase-storage.js";

const firebaseConfig = {

    apiKey: "AIzaSyCb5h56BXxzjDzpfh3O4_n1sTEUTYm1QZE",

    authDomain: "taskflowm14-5cecf.firebaseapp.com",

    projectId: "taskflowm14-5cecf",

    storageBucket: "taskflowm14-5cecf.firebasestorage.app",

    messagingSenderId: "130143335191",

    appId: "1:130143335191:web:e55db77324af5dcbb53d52"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);

export const storage = getStorage(app);

export {
    collection,
    addDoc,
    getDocs,
    updateDoc,
    deleteDoc,
    doc,
    getDoc,
    ref,
    uploadBytes,
    getDownloadURL,
    deleteObject
};