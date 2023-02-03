import { initializeApp } from 'firebase/app';
import { getFirestore, collection, onSnapshot, addDoc, deleteDoc, doc, query, where, orderBy, updateDoc, setDoc, getDoc, getDocs } from 'firebase/firestore';
import { createUserWithEmailAndPassword, getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged, updateProfile } from 'firebase/auth';

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

export async function firebaseGetDataByWhere(colref, keyword, data, isSubscribe) {
    if (isSubscribe) {

    } else {
        try {
            let obj = await getDocs(query(collection(db, colref), where('email', '==', keyword)));
            Object.assign(data, {});
            Object.assign(data, { id: obj.docs[0].id, ...obj.docs[0].data() });
        } catch (error) {
            console.log(error.message);
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
    try {
        await signOut(auth);
    } catch (error) {
        console.log(error.message);
    }
}

export { user_id };

onAuthStateChanged(auth, async (user) => {
    if (user) {
        user_id = user.uid;
        await firebaseGetSingleData('users', user_id, userData);
        localStorage.setItem('isAuth', true);
        localStorage.setItem('userData', JSON.stringify(userData));
    } else {
        userData = {};
        user_id = '';
        localStorage.setItem('isAuth', false);
        localStorage.setItem('userData', '');
    }
});