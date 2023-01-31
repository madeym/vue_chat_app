import { initializeApp } from 'firebase/app';
import { getFirestore, collection, onSnapshot, addDoc, deleteDoc, doc, query, where, orderBy, updateDoc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBxKj0JIrVQHV5xr4qtZf030Qhq9BiqV2s",
  authDomain: "vue-chat-app-87e41.firebaseapp.com",
  projectId: "vue-chat-app-87e41",
  storageBucket: "vue-chat-app-87e41.appspot.com",
  messagingSenderId: "1097262698933",
  appId: "1:1097262698933:web:3527d42b466bf7a07a49fc"
};

initializeApp(firebaseConfig);

const db = getFirestore();

export const database = getFirestore();

export async function firebaseCreateData(colRef, data) {
    await addDoc(collection(db, colRef), data);
}

export function firebaseGetData(colRef, data) {
    onSnapshot(query(collection(db, colRef), orderBy('createdAt', 'asc')), (snapshot) => {
        data.length = 0;
        snapshot.docs.forEach((doc) => {
            data.push({ id: doc.id, ...doc.data(),  });
        });
    });
}

export function firebaseGetSingleData(colref, id, data) {
    onSnapshot(doc(db, colref, id), (snapshot) => {
        data = { id: snapshot.id, ...snapshot.data() };
    });
}

export async function firebaseUpdateSingleData(colref, id, data) {
    await updateDoc(doc(db, colref, id), data);
}

export async function firebaseDeleteData(colRef, id) {
    await deleteDoc(doc(db, colRef, id));
}

