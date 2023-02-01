import { initializeApp } from 'firebase/app';
import { getFirestore, collection, onSnapshot, addDoc, deleteDoc, doc, query, where, orderBy, updateDoc } from 'firebase/firestore';
import { createUserWithEmailAndPassword, getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged, updateProfile } from 'firebase/auth';
import { useAuthStore } from './stores/auth';

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
const auth = getAuth();
let user_id = '';
let userData = {};

export const database = getFirestore();

export async function firebaseCreateData(colRef, data) {
    data.user_id = user_id;
    data.user_name = userData.displayName;
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

export async function firebaseSignInBasic(email, password) {
    return await signInWithEmailAndPassword(auth, email, password);
}

export async function firebaseSignUpBasic(displayName, email, password) {
    let cred = await createUserWithEmailAndPassword(auth, email, password);
    updateProfile(auth.currentUser, {
        displayName: displayName
    });
    return cred;
}

export async function firebaseSignOut() {
    try {
        await signOut(auth);
        console.log('user logout');
    } catch (error) {
        console.log(error.message);
    }
}

export {user_id};

onAuthStateChanged(auth, (user) => {
    if(user) {
        userData = user;
        console.log(user);
        user_id = user.uid;
        localStorage.setItem('isAuth', true);
    }else {
        userData = {};
        user_id = '';
        
        localStorage.setItem('isAuth', false);
    }
});