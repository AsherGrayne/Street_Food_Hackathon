import { 
  collection, 
  getDocs, 
  deleteDoc, 
  doc,
  addDoc,
  setDoc,
  query,
  where
} from 'firebase/firestore'
import { db } from '../config/firebase'
import toast from 'react-hot-toast'

// Sample Vendors Data
const sampleVendors = [
  {
    name: 'Rajesh Kumar',
    email: 'rajesh.chaat@test.com',
    password: 'test123456',
    phone: '9876543210',
    location: 'Andheri West, Mumbai',
    businessType: 'Street Food Stall',
    specialties: ['Pani Puri', 'Bhel Puri', 'Dahi Puri'],
    role: 'vendor',
    rating: 4.2,
    verified: true,
    joinedDate: new Date('2024-01-15')
  },
  {
    name: 'Lakshmi Devi',
    email: 'lakshmi.dosa@test.com',
    password: 'test123456',
    phone: '9876543211',
    location: 'Koramangala, Bangalore',
    businessType: 'Food Stall',
    specialties: ['Dosas', 'Idlis', 'Vadas'],
    role: 'vendor',
    rating: 4.5,
    verified: true,
    joinedDate: new Date('2024-02-01')
  },
  {
    name: 'Ahmed Khan',
    email: 'ahmed.biryani@test.com',
    password: 'test123456',
    phone: '9876543212',
    location: 'Old Delhi',
    businessType: 'Food Stall',
    specialties: ['Chicken Biryani', 'Mutton Biryani'],
    role: 'vendor',
    rating: 4.8,
    verified: true,
    joinedDate: new Date('2024-01-20')
  },
  {
    name: 'Priya Sharma',
    email: 'priya.juice@test.com',
    password: 'test123456',
    phone: '9876543213',
    location: 'Bandra, Mumbai',
    businessType: 'Juice Stall',
    specialties: ['Fresh Fruit Juices', 'Smoothies'],
    role: 'vendor',
    rating: 4.3,
    verified: true,
    joinedDate: new Date('2024-02-10')
  },
  {
    name: 'Sanjay Patel',
    email: 'sanjay.vadapav@test.com',
    password: 'test123456',
    phone: '9876543214',
    location: 'Dadar, Mumbai',
    businessType: 'Street Food Stall',
    specialties: ['Vada Pav', 'Samosa Pav'],
    role: 'vendor',
    rating: 4.1,
    verified: true,
    joinedDate: new Date('2024-01-25')
  },
  {
    name: 'Meera Gupta',
    email: 'meera.sweets@test.com',
    password: 'test123456',
    phone: '9876543215',
    location: 'Chandni Chowk, Delhi',
    businessType: 'Sweet Stall',
    specialties: ['Gulab Jamun', 'Jalebi', 'Rasgulla'],
    role: 'vendor',
    rating: 4.6,
    verified: true,
    joinedDate: new Date('2024-02-05')
  },
  {
    name: 'Ramesh Singh',
    email: 'ramesh.tea@test.com',
    password: 'test123456',
    phone: '9876543216',
    location: 'Marine Drive, Mumbai',
    businessType: 'Tea Stall',
    specialties: ['Masala Chai', 'Coffee', 'Snacks'],
    role: 'vendor',
    rating: 4.0,
    verified: true,
    joinedDate: new Date('2024-01-30')
  },
  {
    name: 'Fatima Begum',
    email: 'fatima.kebab@test.com',
    password: 'test123456',
    phone: '9876543217',
    location: 'Jama Masjid, Delhi',
    businessType: 'Food Stall',
    specialties: ['Seekh Kebab', 'Chicken Kebab'],
    role: 'vendor',
    rating: 4.7,
    verified: true,
    joinedDate: new Date('2024-02-15')
  }
]

// Sample Suppliers Data
const sampleSuppliers = [
  {
    name: 'Fresh Vegetables Co.',
    email: 'fresh.veggies@test.com',
    password: 'test123456',
    phone: '9876543220',
    location: 'APMC Market, Mumbai',
    businessType: 'Wholesale Supplier',
    specialties: ['Vegetables', 'Fruits'],
    role: 'supplier',
    rating: 4.4,
    verified: true,
    joinedDate: new Date('2024-01-10'),
    description: 'Premium quality fresh vegetables and fruits supplier'
  },
  {
    name: 'Spice Paradise',
    email: 'spice.paradise@test.com',
    password: 'test123456',
    phone: '9876543221',
    location: 'Khari Baoli, Delhi',
    businessType: 'Spice Supplier',
    specialties: ['Spices', 'Dry Fruits'],
    role: 'supplier',
    rating: 4.6,
    verified: true,
    joinedDate: new Date('2024-01-12'),
    description: 'Authentic spices and premium dry fruits supplier'
  },
  {
    name: 'Dairy Fresh',
    email: 'dairy.fresh@test.com',
    password: 'test123456',
    phone: '9876543222',
    location: 'Anand, Gujarat',
    businessType: 'Dairy Supplier',
    specialties: ['Milk', 'Yogurt', 'Cheese'],
    role: 'supplier',
    rating: 4.3,
    verified: true,
    joinedDate: new Date('2024-01-18'),
    description: 'Fresh dairy products from Gujarat'
  },
  {
    name: 'Grain Masters',
    email: 'grain.masters@test.com',
    password: 'test123456',
    phone: '9876543223',
    location: 'Mandi, Punjab',
    businessType: 'Grain Supplier',
    specialties: ['Rice', 'Wheat', 'Pulses'],
    role: 'supplier',
    rating: 4.5,
    verified: true,
    joinedDate: new Date('2024-01-22'),
    description: 'Premium quality grains and pulses supplier'
  },
  {
    name: 'Meat & Poultry Co.',
    email: 'meat.poultry@test.com',
    password: 'test123456',
    phone: '9876543224',
    location: 'Deonar, Mumbai',
    businessType: 'Meat Supplier',
    specialties: ['Chicken', 'Mutton', 'Fish'],
    role: 'supplier',
    rating: 4.2,
    verified: true,
    joinedDate: new Date('2024-01-28'),
    description: 'Fresh meat and poultry supplier'
  }
]

// Sample Inventory Items
const sampleInventory = [
  // Fresh Vegetables Co. Inventory
  {
    name: 'Fresh Tomatoes',
    category: 'Vegetables',
    price: 40,
    unit: 'kg',
    stock: 100,
    minStock: 10,
    quality: 'Premium',
    description: 'Fresh red tomatoes, perfect for cooking',
    supplierId: 'fresh_veggies_id'
  },
  {
    name: 'Onions',
    category: 'Vegetables',
    price: 30,
    unit: 'kg',
    stock: 150,
    minStock: 20,
    quality: 'Standard',
    description: 'Fresh onions, good for daily cooking',
    supplierId: 'fresh_veggies_id'
  },
  {
    name: 'Potatoes',
    category: 'Vegetables',
    price: 25,
    unit: 'kg',
    stock: 200,
    minStock: 30,
    quality: 'Standard',
    description: 'Fresh potatoes, suitable for all dishes',
    supplierId: 'fresh_veggies_id'
  },
  {
    name: 'Carrots',
    category: 'Vegetables',
    price: 35,
    unit: 'kg',
    stock: 80,
    minStock: 15,
    quality: 'Premium',
    description: 'Fresh carrots, rich in vitamins',
    supplierId: 'fresh_veggies_id'
  },
  {
    name: 'Capsicum',
    category: 'Vegetables',
    price: 60,
    unit: 'kg',
    stock: 60,
    minStock: 10,
    quality: 'Premium',
    description: 'Fresh green capsicum',
    supplierId: 'fresh_veggies_id'
  },

  // Spice Paradise Inventory
  {
    name: 'Red Chilli Powder',
    category: 'Spices',
    price: 200,
    unit: 'kg',
    stock: 25,
    minStock: 2,
    quality: 'Premium',
    description: 'Hot and spicy red chilli powder',
    supplierId: 'spice_paradise_id'
  },
  {
    name: 'Turmeric Powder',
    category: 'Spices',
    price: 150,
    unit: 'kg',
    stock: 30,
    minStock: 3,
    quality: 'Premium',
    description: 'Pure turmeric powder',
    supplierId: 'spice_paradise_id'
  },
  {
    name: 'Coriander Powder',
    category: 'Spices',
    price: 180,
    unit: 'kg',
    stock: 20,
    minStock: 2,
    quality: 'Premium',
    description: 'Aromatic coriander powder',
    supplierId: 'spice_paradise_id'
  },
  {
    name: 'Garam Masala',
    category: 'Spices',
    price: 300,
    unit: 'kg',
    stock: 15,
    minStock: 1,
    quality: 'Premium',
    description: 'Traditional garam masala blend',
    supplierId: 'spice_paradise_id'
  },
  {
    name: 'Almonds',
    category: 'Dry Fruits',
    price: 800,
    unit: 'kg',
    stock: 10,
    minStock: 1,
    quality: 'Premium',
    description: 'Premium quality almonds',
    supplierId: 'spice_paradise_id'
  },

  // Dairy Fresh Inventory
  {
    name: 'Fresh Milk',
    category: 'Dairy',
    price: 60,
    unit: 'liter',
    stock: 50,
    minStock: 5,
    quality: 'Premium',
    description: 'Fresh cow milk',
    supplierId: 'dairy_fresh_id'
  },
  {
    name: 'Curd',
    category: 'Dairy',
    price: 80,
    unit: 'kg',
    stock: 30,
    minStock: 3,
    quality: 'Premium',
    description: 'Fresh homemade curd',
    supplierId: 'dairy_fresh_id'
  },
  {
    name: 'Paneer',
    category: 'Dairy',
    price: 200,
    unit: 'kg',
    stock: 20,
    minStock: 2,
    quality: 'Premium',
    description: 'Fresh homemade paneer',
    supplierId: 'dairy_fresh_id'
  },
  {
    name: 'Butter',
    category: 'Dairy',
    price: 400,
    unit: 'kg',
    stock: 15,
    minStock: 2,
    quality: 'Premium',
    description: 'Pure butter',
    supplierId: 'dairy_fresh_id'
  },

  // Grain Masters Inventory
  {
    name: 'Basmati Rice',
    category: 'Grains',
    price: 80,
    unit: 'kg',
    stock: 50,
    minStock: 5,
    quality: 'Premium',
    description: 'Premium quality basmati rice',
    supplierId: 'grain_masters_id'
  },
  {
    name: 'Wheat Flour',
    category: 'Grains',
    price: 35,
    unit: 'kg',
    stock: 100,
    minStock: 10,
    quality: 'Standard',
    description: 'Fine wheat flour',
    supplierId: 'grain_masters_id'
  },
  {
    name: 'Toor Dal',
    category: 'Pulses',
    price: 120,
    unit: 'kg',
    stock: 40,
    minStock: 5,
    quality: 'Premium',
    description: 'Yellow toor dal',
    supplierId: 'grain_masters_id'
  },
  {
    name: 'Moong Dal',
    category: 'Pulses',
    price: 100,
    unit: 'kg',
    stock: 35,
    minStock: 5,
    quality: 'Premium',
    description: 'Green moong dal',
    supplierId: 'grain_masters_id'
  },

  // Meat & Poultry Co. Inventory
  {
    name: 'Chicken',
    category: 'Meat',
    price: 180,
    unit: 'kg',
    stock: 30,
    minStock: 5,
    quality: 'Fresh',
    description: 'Fresh chicken meat',
    supplierId: 'meat_poultry_id'
  },
  {
    name: 'Mutton',
    category: 'Meat',
    price: 600,
    unit: 'kg',
    stock: 15,
    minStock: 2,
    quality: 'Fresh',
    description: 'Fresh mutton meat',
    supplierId: 'meat_poultry_id'
  },
  {
    name: 'Fish',
    category: 'Seafood',
    price: 300,
    unit: 'kg',
    stock: 20,
    minStock: 3,
    quality: 'Fresh',
    description: 'Fresh fish',
    supplierId: 'meat_poultry_id'
  }
]

// Sample Orders Data
const sampleOrders = [
  {
    vendorId: 'rajesh_chaat_id',
    vendorName: 'Rajesh Kumar',
    supplierId: 'fresh_veggies_id',
    supplierName: 'Fresh Vegetables Co.',
    materials: [
      {
        id: 'mat1',
        name: 'Fresh Tomatoes',
        quantity: 10,
        unit: 'kg',
        price: 40,
        total: 400
      },
      {
        id: 'mat2',
        name: 'Onions',
        quantity: 5,
        unit: 'kg',
        price: 30,
        total: 150
      }
    ],
    totalAmount: 550,
    status: 'confirmed',
    orderDate: new Date('2024-03-01').toLocaleDateString(),
    deliveryDate: new Date('2024-03-04').toLocaleDateString(),
    trackingId: 'TRK20240301001',
    supplierRating: 4.4,
    paymentStatus: 'completed'
  },
  {
    vendorId: 'lakshmi_dosa_id',
    vendorName: 'Lakshmi Devi',
    supplierId: 'grain_masters_id',
    supplierName: 'Grain Masters',
    materials: [
      {
        id: 'mat3',
        name: 'Basmati Rice',
        quantity: 20,
        unit: 'kg',
        price: 80,
        total: 1600
      }
    ],
    totalAmount: 1600,
    status: 'delivered',
    orderDate: new Date('2024-02-25').toLocaleDateString(),
    deliveryDate: new Date('2024-02-28').toLocaleDateString(),
    trackingId: 'TRK20240225001',
    supplierRating: 4.5,
    paymentStatus: 'completed'
  },
  {
    vendorId: 'ahmed_biryani_id',
    vendorName: 'Ahmed Khan',
    supplierId: 'spice_paradise_id',
    supplierName: 'Spice Paradise',
    materials: [
      {
        id: 'mat4',
        name: 'Garam Masala',
        quantity: 2,
        unit: 'kg',
        price: 300,
        total: 600
      },
      {
        id: 'mat5',
        name: 'Red Chilli Powder',
        quantity: 3,
        unit: 'kg',
        price: 200,
        total: 600
      }
    ],
    totalAmount: 1200,
    status: 'in_transit',
    orderDate: new Date('2024-03-02').toLocaleDateString(),
    deliveryDate: new Date('2024-03-05').toLocaleDateString(),
    trackingId: 'TRK20240302001',
    supplierRating: 4.6,
    paymentStatus: 'completed'
  },
  {
    vendorId: 'priya_juice_id',
    vendorName: 'Priya Sharma',
    supplierId: 'fresh_veggies_id',
    supplierName: 'Fresh Vegetables Co.',
    materials: [
      {
        id: 'mat6',
        name: 'Carrots',
        quantity: 8,
        unit: 'kg',
        price: 35,
        total: 280
      },
      {
        id: 'mat7',
        name: 'Capsicum',
        quantity: 3,
        unit: 'kg',
        price: 60,
        total: 180
      }
    ],
    totalAmount: 460,
    status: 'pending',
    orderDate: new Date('2024-03-03').toLocaleDateString(),
    deliveryDate: new Date('2024-03-06').toLocaleDateString(),
    trackingId: 'TRK20240303001',
    supplierRating: 4.4,
    paymentStatus: 'pending'
  }
]

// Sample Reviews Data
const sampleReviews = [
  {
    vendorId: 'rajesh_chaat_id',
    vendorName: 'Rajesh Kumar',
    supplierId: 'fresh_veggies_id',
    supplierName: 'Fresh Vegetables Co.',
    rating: 5,
    comment: 'Excellent quality vegetables, very fresh and delivered on time!',
    createdAt: new Date('2024-03-05')
  },
  {
    vendorId: 'lakshmi_dosa_id',
    vendorName: 'Lakshmi Devi',
    supplierId: 'grain_masters_id',
    supplierName: 'Grain Masters',
    rating: 4,
    comment: 'Good quality rice, reasonable prices. Will order again.',
    createdAt: new Date('2024-03-01')
  },
  {
    vendorId: 'ahmed_biryani_id',
    vendorName: 'Ahmed Khan',
    supplierId: 'spice_paradise_id',
    supplierName: 'Spice Paradise',
    rating: 5,
    comment: 'Best spices in the market! Very authentic taste.',
    createdAt: new Date('2024-03-03')
  },
  {
    vendorId: 'meera_sweets_id',
    vendorName: 'Meera Gupta',
    supplierId: 'dairy_fresh_id',
    supplierName: 'Dairy Fresh',
    rating: 4,
    comment: 'Fresh dairy products, good for making sweets.',
    createdAt: new Date('2024-02-28')
  }
]

// Function to clear all data from collections
export const clearAllData = async () => {
  try {
    console.log('Starting to clear all data...')
    
    const collections = ['users', 'orders', 'inventory', 'reviews']
    
    for (const collectionName of collections) {
      console.log(`Clearing ${collectionName} collection...`)
      const querySnapshot = await getDocs(collection(db, collectionName))
      
      const deletePromises = querySnapshot.docs.map(doc => deleteDoc(doc.ref))
      await Promise.all(deletePromises)
      
      console.log(`Cleared ${querySnapshot.docs.length} documents from ${collectionName}`)
    }
    
    console.log('All data cleared successfully!')
    return true
  } catch (error) {
    console.error('Error clearing data:', error)
    throw error
  }
}

// Function to populate users (vendors and suppliers)
export const populateUsers = async () => {
  try {
    console.log('Creating sample users...')
    
    const allUsers = [...sampleVendors, ...sampleSuppliers]
    const createdUsers = []
    
    for (const userData of allUsers) {
      const userDoc = await addDoc(collection(db, 'users'), {
        ...userData,
        createdAt: new Date(),
        uid: userData.email.replace('@test.com', '_id') // Generate a simple ID
      })
      
      createdUsers.push({
        ...userData,
        id: userDoc.id,
        uid: userData.email.replace('@test.com', '_id')
      })
      
      console.log(`Created user: ${userData.name} (${userData.role})`)
    }
    
    console.log(`Created ${createdUsers.length} users successfully!`)
    return createdUsers
  } catch (error) {
    console.error('Error creating users:', error)
    throw error
  }
}

// Function to populate inventory
export const populateInventory = async (suppliers) => {
  try {
    console.log('Creating sample inventory...')
    
    const createdInventory = []
    
    for (const item of sampleInventory) {
      // Find the supplier ID based on the supplier name
      const supplier = suppliers.find(s => s.name === item.supplierId.replace('_id', '').replace(/_/g, ' '))
      
      if (supplier) {
        const inventoryDoc = await addDoc(collection(db, 'inventory'), {
          ...item,
          supplierId: supplier.id,
          createdAt: new Date()
        })
        
        createdInventory.push({
          ...item,
          id: inventoryDoc.id,
          supplierId: supplier.id
        })
        
        console.log(`Created inventory item: ${item.name} for ${supplier.name}`)
      }
    }
    
    console.log(`Created ${createdInventory.length} inventory items successfully!`)
    return createdInventory
  } catch (error) {
    console.error('Error creating inventory:', error)
    throw error
  }
}

// Function to populate orders
export const populateOrders = async (vendors, suppliers) => {
  try {
    console.log('Creating sample orders...')
    
    const createdOrders = []
    
    for (const orderData of sampleOrders) {
      // Find vendor and supplier IDs
      const vendor = vendors.find(v => v.name === orderData.vendorName)
      const supplier = suppliers.find(s => s.name === orderData.supplierName)
      
      if (vendor && supplier) {
        const orderDoc = await addDoc(collection(db, 'orders'), {
          ...orderData,
          vendorId: vendor.id,
          supplierId: supplier.id,
          createdAt: new Date()
        })
        
        createdOrders.push({
          ...orderData,
          id: orderDoc.id,
          vendorId: vendor.id,
          supplierId: supplier.id
        })
        
        console.log(`Created order: ${orderData.trackingId} from ${vendor.name} to ${supplier.name}`)
      }
    }
    
    console.log(`Created ${createdOrders.length} orders successfully!`)
    return createdOrders
  } catch (error) {
    console.error('Error creating orders:', error)
    throw error
  }
}

// Function to populate reviews
export const populateReviews = async (vendors, suppliers) => {
  try {
    console.log('Creating sample reviews...')
    
    const createdReviews = []
    
    for (const reviewData of sampleReviews) {
      // Find vendor and supplier IDs
      const vendor = vendors.find(v => v.name === reviewData.vendorName)
      const supplier = suppliers.find(s => s.name === reviewData.supplierName)
      
      if (vendor && supplier) {
        const reviewDoc = await addDoc(collection(db, 'reviews'), {
          ...reviewData,
          vendorId: vendor.id,
          supplierId: supplier.id,
          createdAt: new Date()
        })
        
        createdReviews.push({
          ...reviewData,
          id: reviewDoc.id,
          vendorId: vendor.id,
          supplierId: supplier.id
        })
        
        console.log(`Created review from ${vendor.name} for ${supplier.name}`)
      }
    }
    
    console.log(`Created ${createdReviews.length} reviews successfully!`)
    return createdReviews
  } catch (error) {
    console.error('Error creating reviews:', error)
    throw error
  }
}

// Main function to populate all data
export const populateDatabase = async () => {
  try {
    console.log('Starting database population...')
    
    // Step 1: Clear existing data
    await clearAllData()
    
    // Step 2: Create users (vendors and suppliers)
    const createdUsers = await populateUsers()
    const vendors = createdUsers.filter(user => user.role === 'vendor')
    const suppliers = createdUsers.filter(user => user.role === 'supplier')
    
    // Step 3: Create inventory
    await populateInventory(suppliers)
    
    // Step 4: Create orders
    await populateOrders(vendors, suppliers)
    
    // Step 5: Create reviews
    await populateReviews(vendors, suppliers)
    
    console.log('Database population completed successfully!')
    
    return {
      users: createdUsers.length,
      vendors: vendors.length,
      suppliers: suppliers.length,
      inventory: sampleInventory.length,
      orders: sampleOrders.length,
      reviews: sampleReviews.length
    }
  } catch (error) {
    console.error('Error populating database:', error)
    throw error
  }
}

// Function to get database statistics
export const getDatabaseStats = async () => {
  try {
    const collections = ['users', 'orders', 'inventory', 'reviews']
    const stats = {}
    
    for (const collectionName of collections) {
      const querySnapshot = await getDocs(collection(db, collectionName))
      stats[collectionName] = querySnapshot.docs.length
    }
    
    return stats
  } catch (error) {
    console.error('Error getting database stats:', error)
    throw error
  }
} 