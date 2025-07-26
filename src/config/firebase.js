import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'
import { getAnalytics } from 'firebase/analytics'

// Real Firebase configuration for StreetFood Connect
const firebaseConfig = {
  apiKey: "AIzaSyBlCOAYXoRoTx8VbpfDYz1okF7MLeYkn6U",
  authDomain: "streetfood-connect-prod.firebaseapp.com",
  projectId: "streetfood-connect-prod",
  storageBucket: "streetfood-connect-prod.firebasestorage.app",
  messagingSenderId: "1093672898022",
  appId: "1:1093672898022:web:bf7674e924d7c2c471da27",
  measurementId: "G-ZW0KRXLEVQ"
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)

// Initialize Firebase services
export const auth = getAuth(app)
export const db = getFirestore(app)
export const storage = getStorage(app)
export const analytics = getAnalytics(app)

export default app 