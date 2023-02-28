import { initializeApp } from 'firebase/app';
import { getFirestore, collection, onSnapshot, addDoc, deleteDoc, doc, query, where, orderBy, updateDoc, setDoc, getDoc, getDocs } from 'firebase/firestore';
import { createUserWithEmailAndPassword, getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged, updateProfile } from 'firebase/auth';
import { SendNotification } from './assets/js/helpers.js';

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

export const database = getFirestore();

export async function firebaseCreateData(colRef, data) {
    return await addDoc(collection(db, colRef), data);
}

export function firebaseGetData(colRef, data) {
    onSnapshot(query(collection(db, colRef), orderBy('createdAt', 'asc')), (snapshot) => {
        data.length = 0;
        snapshot.docs.forEach((doc) => {
            data.push({ id: doc.id, ...doc.data(), });
        });
    });
}

export async function firebaseGetSingleData(colref, id, data, isSubscribe) {
    if (isSubscribe) {
        onSnapshot(doc(db, colref, id), (snapshot) => {
            Object.assign(data, { id: snapshot.id, ...snapshot.data() });
        });
    } else {
        let obj = await getDoc(doc(db, colref, id));
        Object.assign(data, { id: obj.id, ...obj.data() });
    }
}

export async function firebaseGetDataByWhere(colref, col, operator, keyword, data, isSubscribe) {
    if (isSubscribe) {
        try {
            onSnapshot(query(collection(db, colref), where(col, operator, keyword), orderBy('created_at')), (snapshot) => {
                data.length = 0;
                if (snapshot.docs.length > 0) {
                    snapshot.docs.forEach((doc) => {
                        data.push({ id: doc.id, ...doc.data() });
                    });
                } else {
                    if (colref == 'messages') {
                        data.push({});
                    }
                }
            });
        } catch (error) {
            SendNotification(error.message, 500);
        }
    } else {
        try {
            let obj = await getDocs(query(collection(db, colref), where(col, operator, keyword)));
            let arr = [];
            data.length = 0;
            if (obj.docs.length > 0) {
                obj.docs.forEach((doc) => {
                    arr.push({ id: doc.id, ...doc.data() });
                });
                Object.assign(data, arr);
            } else {
                if (colref == 'messages') {
                    data.push({});
                }
            }
        } catch (error) {
            SendNotification(error.message, 500);
        }
    }
}

export async function firebaseUpdateSingleData(colref, id, data) {
    return await updateDoc(doc(db, colref, id), data);
}

export async function firebaseDeleteData(colRef, id) {
    await deleteDoc(doc(db, colRef, id));
}

export async function firebaseSignInBasic(email, password) {
    return await signInWithEmailAndPassword(auth, email, password);
}

export async function firebaseSignUpBasic(displayName, email, password) {
    let cred = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(auth.currentUser, {
        displayName: displayName
    });
    await setDoc(doc(db, 'users', cred.user.uid), {
        displayName: displayName,
        email: email,
    });
    return cred;
}

export async function firebaseSignOut() {
    await signOut(auth);
    localStorage.setItem('isAuth', false);
    localStorage.setItem('userData', '');
}

export { user_id };

onAuthStateChanged(auth, async (user) => {
    if (user) {
        user_id = user.uid;
        localStorage.setItem('isAuth', true);
        localStorage.setItem('userData', JSON.stringify(user));
    } else {
        user_id = '';
        localStorage.setItem('isAuth', false);
        localStorage.setItem('userData', '');
    }
});