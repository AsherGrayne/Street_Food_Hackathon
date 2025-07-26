// Simple script to populate the database with sample data
// Run this with: node populate-db.js

const { initializeApp } = require('firebase/app');
const { 
  getFirestore, 
  collection, 
  getDocs, 
  deleteDoc, 
  addDoc,
  doc 
} = require('firebase/firestore');

// Firebase configuration (replace with your actual config)
const firebaseConfig = {
  apiKey: "AIzaSyBXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  authDomain: "streetfood-connect-prod.firebaseapp.com",
  projectId: "streetfood-connect-prod",
  storageBucket: "streetfood-connect-prod.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdefghijklmnop"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Sample data (simplified version)
const sampleVendors = [
  {
    name: 'Rajesh Kumar',
    email: 'rajesh.chaat@test.com',
    phone: '9876543210',
    location: 'Andheri West, Mumbai',
    businessType: 'Street Food Stall',
    specialties: ['Pani Puri', 'Bhel Puri', 'Dahi Puri'],
    role: 'vendor',
    rating: 4.2,
    verified: true,
    createdAt: new Date()
  },
  {
    name: 'Lakshmi Devi',
    email: 'lakshmi.dosa@test.com',
    phone: '9876543211',
    location: 'Koramangala, Bangalore',
    businessType: 'Food Stall',
    specialties: ['Dosas', 'Idlis', 'Vadas'],
    role: 'vendor',
    rating: 4.5,
    verified: true,
    createdAt: new Date()
  },
  {
    name: 'Ahmed Khan',
    email: 'ahmed.biryani@test.com',
    phone: '9876543212',
    location: 'Old Delhi',
    businessType: 'Food Stall',
    specialties: ['Chicken Biryani', 'Mutton Biryani'],
    role: 'vendor',
    rating: 4.8,
    verified: true,
    createdAt: new Date()
  }
];

const sampleSuppliers = [
  {
    name: 'Fresh Vegetables Co.',
    email: 'fresh.veggies@test.com',
    phone: '9876543220',
    location: 'APMC Market, Mumbai',
    businessType: 'Wholesale Supplier',
    specialties: ['Vegetables', 'Fruits'],
    role: 'supplier',
    rating: 4.4,
    verified: true,
    createdAt: new Date()
  },
  {
    name: 'Spice Paradise',
    email: 'spice.paradise@test.com',
    phone: '9876543221',
    location: 'Khari Baoli, Delhi',
    businessType: 'Spice Supplier',
    specialties: ['Spices', 'Dry Fruits'],
    role: 'supplier',
    rating: 4.6,
    verified: true,
    createdAt: new Date()
  }
];

const sampleInventory = [
  {
    name: 'Fresh Tomatoes',
    category: 'Vegetables',
    price: 40,
    unit: 'kg',
    stock: 100,
    minStock: 10,
    quality: 'Premium',
    description: 'Fresh red tomatoes, perfect for cooking',
    createdAt: new Date()
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
    createdAt: new Date()
  },
  {
    name: 'Red Chilli Powder',
    category: 'Spices',
    price: 200,
    unit: 'kg',
    stock: 25,
    minStock: 2,
    quality: 'Premium',
    description: 'Hot and spicy red chilli powder',
    createdAt: new Date()
  }
];

// Function to clear all data
async function clearAllData() {
  console.log('Clearing existing data...');
  
  const collections = ['users', 'orders', 'inventory', 'reviews'];
  
  for (const collectionName of collections) {
    try {
      const querySnapshot = await getDocs(collection(db, collectionName));
      const deletePromises = querySnapshot.docs.map(doc => deleteDoc(doc.ref));
      await Promise.all(deletePromises);
      console.log(`Cleared ${querySnapshot.docs.length} documents from ${collectionName}`);
    } catch (error) {
      console.error(`Error clearing ${collectionName}:`, error);
    }
  }
}

// Function to populate users
async function populateUsers() {
  console.log('Creating sample users...');
  
  const allUsers = [...sampleVendors, ...sampleSuppliers];
  const createdUsers = [];
  
  for (const userData of allUsers) {
    try {
      const userDoc = await addDoc(collection(db, 'users'), userData);
      createdUsers.push({ ...userData, id: userDoc.id });
      console.log(`Created user: ${userData.name} (${userData.role})`);
    } catch (error) {
      console.error(`Error creating user ${userData.name}:`, error);
    }
  }
  
  return createdUsers;
}

// Function to populate inventory
async function populateInventory(suppliers) {
  console.log('Creating sample inventory...');
  
  const createdInventory = [];
  
  for (const item of sampleInventory) {
    try {
      // Assign to first supplier for simplicity
      const supplier = suppliers[0];
      const inventoryDoc = await addDoc(collection(db, 'inventory'), {
        ...item,
        supplierId: supplier.id,
        createdAt: new Date()
      });
      
      createdInventory.push({ ...item, id: inventoryDoc.id, supplierId: supplier.id });
      console.log(`Created inventory item: ${item.name}`);
    } catch (error) {
      console.error(`Error creating inventory item ${item.name}:`, error);
    }
  }
  
  return createdInventory;
}

// Main function
async function populateDatabase() {
  try {
    console.log('Starting database population...');
    
    // Step 1: Clear existing data
    await clearAllData();
    
    // Step 2: Create users
    const createdUsers = await populateUsers();
    const vendors = createdUsers.filter(user => user.role === 'vendor');
    const suppliers = createdUsers.filter(user => user.role === 'supplier');
    
    // Step 3: Create inventory
    await populateInventory(suppliers);
    
    console.log('Database population completed successfully!');
    console.log(`Created ${createdUsers.length} users (${vendors.length} vendors, ${suppliers.length} suppliers)`);
    console.log(`Created ${sampleInventory.length} inventory items`);
    
  } catch (error) {
    console.error('Error populating database:', error);
  }
}

// Run the script
if (require.main === module) {
  populateDatabase().then(() => {
    console.log('Script completed!');
    process.exit(0);
  }).catch((error) => {
    console.error('Script failed:', error);
    process.exit(1);
  });
}

module.exports = { populateDatabase, clearAllData }; 