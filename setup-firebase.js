#!/usr/bin/env node

/**
 * Firebase Setup Script for StreetFood Connect
 * This script helps you set up Firebase with real configuration
 */

const fs = require('fs');
const path = require('path');

console.log('🚀 StreetFood Connect - Firebase Setup');
console.log('=====================================\n');

// Instructions for setting up Firebase
const instructions = `
📋 STEP-BY-STEP FIREBASE SETUP:

1. 🌐 Go to Firebase Console:
   https://console.firebase.google.com/

2. 🔥 Create New Project:
   - Click "Create a project"
   - Name: "streetfood-connect-prod"
   - Enable Google Analytics (optional)
   - Click "Create project"

3. 🔐 Enable Authentication:
   - Go to Authentication → Sign-in method
   - Enable "Email/Password"
   - Click "Save"

4. 🗄️ Create Firestore Database:
   - Go to Firestore Database → Create database
   - Choose "Start in test mode"
   - Select location: "asia-south1" (Mumbai)
   - Click "Done"

5. ⚙️ Get Web App Configuration:
   - Go to Project Settings (gear icon)
   - Scroll to "Your apps"
   - Click "Add app" → Web app
   - Register app: "StreetFood Connect Web"
   - Copy the configuration

6. 📝 Update Configuration:
   - Replace the config in src/config/firebase.js
   - Use your actual Firebase values

7. 🔒 Set Security Rules (Optional):
   - Go to Firestore Database → Rules
   - Replace with rules from FIREBASE_SETUP.md

8. ✅ Test the Setup:
   - Run: npm run dev
   - Try registering a new account
   - Check Firebase Console for data

🎯 Your app will be fully functional with real data!
`;

console.log(instructions);

// Check if firebase config exists
const firebaseConfigPath = path.join(__dirname, 'src', 'config', 'firebase.js');
const firebaseConfigExists = fs.existsSync(firebaseConfigPath);

if (firebaseConfigExists) {
  console.log('✅ Firebase config file found');
  
  // Read current config
  const configContent = fs.readFileSync(firebaseConfigPath, 'utf8');
  
  // Check if it has placeholder values
  if (configContent.includes('AIzaSyC2X8K9L1M4N5O6P7Q8R9S0T1U2V3W4X5Y6Z')) {
    console.log('⚠️  Current config has placeholder values');
    console.log('📝 Please replace with your actual Firebase configuration\n');
  } else {
    console.log('✅ Firebase config appears to be set up correctly\n');
  }
} else {
  console.log('❌ Firebase config file not found');
  console.log('📝 Please create src/config/firebase.js\n');
}

// Test script
console.log('🧪 TESTING FIREBASE CONNECTION:');
console.log('1. Start the app: npm run dev');
console.log('2. Go to: http://localhost:3000');
console.log('3. Try registering a new account');
console.log('4. Check Firebase Console for new user');

console.log('\n📚 Additional Resources:');
console.log('- Firebase Setup Guide: FIREBASE_SETUP.md');
console.log('- Firebase Documentation: https://firebase.google.com/docs');
console.log('- Firebase Console: https://console.firebase.google.com/');

console.log('\n🎉 Happy coding! Your StreetFood Connect app is ready to go live!'); 