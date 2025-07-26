# Firebase Setup Guide for StreetFood Connect

This guide will help you set up Firebase for the StreetFood Connect application with real data and authentication.

## 🚀 Quick Setup (5 minutes)

### Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click **"Create a project"**
3. Enter project name: `streetfood-connect`
4. Enable Google Analytics (optional)
5. Click **"Create project"**

### Step 2: Enable Authentication

1. In Firebase Console, go to **Authentication** → **Sign-in method**
2. Enable **Email/Password** authentication
3. Click **"Save"**

### Step 3: Set Up Firestore Database

1. Go to **Firestore Database** → **Create database**
2. Choose **"Start in test mode"** (for development)
3. Select a location close to your users (e.g., `asia-south1` for India)
4. Click **"Done"**

### Step 4: Get Firebase Configuration

1. Go to **Project Settings** (gear icon)
2. Scroll down to **"Your apps"**
3. Click **"Add app"** → **Web app**
4. Register app with name: `StreetFood Connect Web`
5. Copy the configuration object

### Step 5: Update Configuration

Replace the configuration in `src/config/firebase.js` with your actual values:

```javascript
const firebaseConfig = {
  apiKey: "your-actual-api-key",
  authDomain: "your-project-id.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project-id.appspot.com",
  messagingSenderId: "your-sender-id",
  appId: "your-app-id"
}
```

## 🔒 Security Rules (Optional but Recommended)

### Firestore Security Rules

Go to **Firestore Database** → **Rules** and replace with:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read/write their own profile
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }

    // Anyone can read verified suppliers
    match /users/{userId} {
      allow read: if resource.data.role == 'supplier' && resource.data.verified == true;
    }

    // Suppliers can manage their inventory
    match /inventory/{itemId} {
      allow read: if true;
      allow write: if request.auth != null &&
        request.auth.uid == resource.data.supplierId;
    }

    // Users can manage their orders
    match /orders/{orderId} {
      allow read, write: if request.auth != null &&
        (request.auth.uid == resource.data.vendorId ||
         request.auth.uid == resource.data.supplierId);
    }

    // Anyone can read reviews
    match /reviews/{reviewId} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

## 📊 Database Structure

The app will automatically create these collections:

### Users Collection
```javascript
{
  uid: "user-id",
  name: "User Name",
  email: "user@example.com",
  phone: "+91 98765 43210",
  location: "Mumbai, Maharashtra",
  role: "vendor" | "supplier",
  businessType: "Street Food Vendor" | "Wholesale Distributor",
  rating: 4.5,
  verified: true,
  specialties: ["Vegetables", "Fruits"],
  createdAt: timestamp
}
```

### Inventory Collection
```javascript
{
  id: "item-id",
  supplierId: "supplier-uid",
  name: "Fresh Tomatoes",
  category: "Vegetables",
  price: 45,
  unit: "kg",
  stock: 100,
  minStock: 20,
  quality: "Premium",
  description: "Fresh, ripe tomatoes from local farms",
  updatedAt: timestamp
}
```

### Orders Collection
```javascript
{
  id: "order-id",
  vendorId: "vendor-uid",
  supplierId: "supplier-uid",
  items: [
    {
      itemId: "item-id",
      name: "Fresh Tomatoes",
      quantity: 10,
      price: 45,
      unit: "kg"
    }
  ],
  totalAmount: 450,
  status: "pending" | "accepted" | "rejected" | "completed",
  createdAt: timestamp,
  updatedAt: timestamp
}
```

### Reviews Collection
```javascript
{
  id: "review-id",
  vendorId: "vendor-uid",
  supplierId: "supplier-uid",
  rating: 5,
  comment: "Great quality products!",
  createdAt: timestamp
}
```

## 🚀 Deploy to Firebase Hosting (Optional)

### Step 1: Install Firebase CLI
```bash
npm install -g firebase-tools
```

### Step 2: Login to Firebase
```bash
firebase login
```

### Step 3: Initialize Firebase in your project
```bash
firebase init hosting
```

### Step 4: Build and Deploy
```bash
npm run build
firebase deploy
```

## ✅ Verification

After setup, test the following:

1. **Registration**: Create a new vendor/supplier account
2. **Login**: Sign in with created credentials
3. **Data Persistence**: Check if data appears in Firestore
4. **Real-time Updates**: Verify changes sync across devices

## 🔧 Troubleshooting

### Common Issues:

1. **"Firebase App not initialized"**
   - Check if configuration is correct
   - Ensure all required fields are filled

2. **"Permission denied"**
   - Check Firestore security rules
   - Verify user authentication

3. **"Network error"**
   - Check internet connection
   - Verify Firebase project is active

### Support:
- [Firebase Documentation](https://firebase.google.com/docs)
- [Firebase Console](https://console.firebase.google.com/)

## 🎯 Next Steps

1. **Customize UI**: Modify colors, branding, and layout
2. **Add Features**: Implement payment integration, notifications
3. **Scale**: Add more suppliers, categories, and features
4. **Analytics**: Set up Firebase Analytics for insights

---

**Your StreetFood Connect app is now ready for production use! 🚀** 