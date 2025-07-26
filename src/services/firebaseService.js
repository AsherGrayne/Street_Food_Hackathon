import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  updateProfile,
  onAuthStateChanged
} from 'firebase/auth'
import { 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit,
  onSnapshot
} from 'firebase/firestore'
import { auth, db } from '../config/firebase'

// Authentication Services
export const authService = {
  // Register new user
  async register(email, password, userData) {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      const user = userCredential.user
      
      // Update user profile
      await updateProfile(user, {
        displayName: userData.name
      })
      
      // Save additional user data to Firestore
      await setDoc(doc(db, 'users', user.uid), {
        ...userData,
        uid: user.uid,
        email: user.email,
        createdAt: new Date(),
        rating: 0,
        verified: false
      })
      
      return user
    } catch (error) {
      throw error
    }
  },

  // Login user
  async login(email, password) {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password)
      return userCredential.user
    } catch (error) {
      throw error
    }
  },

  // Logout user
  async logout() {
    try {
      await signOut(auth)
    } catch (error) {
      throw error
    }
  },

  // Get current user
  getCurrentUser() {
    return auth.currentUser
  },

  // Listen to auth state changes
  onAuthStateChanged(callback) {
    return onAuthStateChanged(auth, callback)
  }
}

// User Services
export const userService = {
  // Get user profile
  async getUserProfile(uid) {
    try {
      const userDoc = await getDoc(doc(db, 'users', uid))
      if (userDoc.exists()) {
        return { id: userDoc.id, ...userDoc.data() }
      }
      return null
    } catch (error) {
      throw error
    }
  },

  // Update user profile
  async updateUserProfile(uid, updates) {
    try {
      await updateDoc(doc(db, 'users', uid), updates)
    } catch (error) {
      throw error
    }
  }
}

// Supplier Services
export const supplierService = {
  // Get all suppliers
  async getSuppliers() {
    try {
      const suppliersQuery = query(
        collection(db, 'users'),
        where('role', '==', 'supplier')
      )
      const snapshot = await getDocs(suppliersQuery)
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
    } catch (error) {
      throw error
    }
  },

  // Get supplier by ID
  async getSupplierById(supplierId) {
    try {
      const supplierDoc = await getDoc(doc(db, 'users', supplierId))
      if (supplierDoc.exists()) {
        return { id: supplierDoc.id, ...supplierDoc.data() }
      }
      return null
    } catch (error) {
      throw error
    }
  },

  // Listen to suppliers (real-time)
  onSuppliersChange(callback) {
    const suppliersQuery = query(
      collection(db, 'users'),
      where('role', '==', 'supplier')
    )
    return onSnapshot(suppliersQuery, (snapshot) => {
      const suppliers = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
      callback(suppliers)
    })
  }
}

// Inventory Services
export const inventoryService = {
  // Get supplier inventory
  async getSupplierInventory(supplierId) {
    try {
      const inventoryQuery = query(
        collection(db, 'inventory'),
        where('supplierId', '==', supplierId)
      )
      const snapshot = await getDocs(inventoryQuery)
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
    } catch (error) {
      throw error
    }
  },

  // Add inventory item
  async addInventoryItem(item) {
    try {
      const docRef = await addDoc(collection(db, 'inventory'), {
        ...item,
        createdAt: new Date()
      })
      return docRef.id
    } catch (error) {
      throw error
    }
  },

  // Update inventory item
  async updateInventoryItem(itemId, updates) {
    try {
      await updateDoc(doc(db, 'inventory', itemId), updates)
    } catch (error) {
      throw error
    }
  },

  // Delete inventory item
  async deleteInventoryItem(itemId) {
    try {
      await deleteDoc(doc(db, 'inventory', itemId))
    } catch (error) {
      throw error
    }
  },

  // Listen to inventory changes (real-time)
  onInventoryChange(supplierId, callback) {
    const inventoryQuery = query(
      collection(db, 'inventory'),
      where('supplierId', '==', supplierId)
    )
    return onSnapshot(inventoryQuery, (snapshot) => {
      const inventory = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
      callback(inventory)
    })
  }
}

// Order Services
export const orderService = {
  // Create new order
  async createOrder(orderData) {
    try {
      const docRef = await addDoc(collection(db, 'orders'), {
        ...orderData,
        createdAt: new Date(),
        status: 'pending'
      })
      return docRef.id
    } catch (error) {
      throw error
    }
  },

  // Get vendor orders
  async getVendorOrders(vendorId) {
    try {
      const ordersQuery = query(
        collection(db, 'orders'),
        where('vendorId', '==', vendorId),
        orderBy('createdAt', 'desc')
      )
      const snapshot = await getDocs(ordersQuery)
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
    } catch (error) {
      throw error
    }
  },

  // Get supplier orders
  async getSupplierOrders(supplierId) {
    try {
      const ordersQuery = query(
        collection(db, 'orders'),
        where('supplierId', '==', supplierId),
        orderBy('createdAt', 'desc')
      )
      const snapshot = await getDocs(ordersQuery)
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
    } catch (error) {
      throw error
    }
  },

  // Update order status
  async updateOrderStatus(orderId, status) {
    try {
      await updateDoc(doc(db, 'orders', orderId), {
        status,
        updatedAt: new Date()
      })
    } catch (error) {
      throw error
    }
  },

  // Listen to orders (real-time)
  onOrdersChange(userId, userRole, callback) {
    const field = userRole === 'vendor' ? 'vendorId' : 'supplierId'
    const ordersQuery = query(
      collection(db, 'orders'),
      where(field, '==', userId),
      orderBy('createdAt', 'desc')
    )
    return onSnapshot(ordersQuery, (snapshot) => {
      const orders = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
      callback(orders)
    })
  }
}

// Review Services
export const reviewService = {
  // Add review
  async addReview(reviewData) {
    try {
      const docRef = await addDoc(collection(db, 'reviews'), {
        ...reviewData,
        createdAt: new Date()
      })
      return docRef.id
    } catch (error) {
      throw error
    }
  },

  // Get reviews for supplier
  async getSupplierReviews(supplierId) {
    try {
      const reviewsQuery = query(
        collection(db, 'reviews'),
        where('supplierId', '==', supplierId),
        orderBy('createdAt', 'desc')
      )
      const snapshot = await getDocs(reviewsQuery)
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
    } catch (error) {
      throw error
    }
  }
} 