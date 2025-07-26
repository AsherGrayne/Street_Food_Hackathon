# Firebase Indexes Setup Guide

## 🔥 **Firestore Index Error Fix**

The "Failed to load orders" error is caused by missing Firestore composite indexes. Here's how to fix it:

## 📋 **Required Indexes**

### **1. Orders Collection Indexes**

#### **For Vendor Orders:**
- **Collection**: `orders`
- **Fields**: 
  - `vendorId` (Ascending)
  - `createdAt` (Descending)

#### **For Supplier Orders:**
- **Collection**: `orders`
- **Fields**:
  - `supplierId` (Ascending)
  - `createdAt` (Descending)

### **2. Reviews Collection Index**
- **Collection**: `reviews`
- **Fields**:
  - `supplierId` (Ascending)
  - `createdAt` (Descending)

### **3. Inventory Collection Index**
- **Collection**: `inventory`
- **Fields**:
  - `supplierId` (Ascending)
  - `createdAt` (Descending)

## 🚀 **How to Create Indexes**

### **Method 1: Direct Link (Recommended)**
Click this link to create the vendor orders index:
```
https://console.firebase.google.com/v1/r/project/streetfood-connect-prod/firestore/indexes?create_composite=ClZwcm9qZWN0cy9zdHJlZXRmb29kLWNvbm5lY3QtcHJvZC9kYXRhYmFzZXMvKGRlZmF1bHQpL2NvbGxlY3Rpb25Hcm91cHMvb3JkZXJzL2luZGV4ZXMvXxABGgwKCHZlbmRvcklkEAEaDQoJY3JlYXRlZEF0EAIaDAoIX19uYW1lX18QAg
```

### **Method 2: Manual Creation**
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project: `streetfood-connect-prod`
3. Navigate to **Firestore Database** → **Indexes**
4. Click **Create Index**
5. Add the required fields as shown above

### **Method 3: Using Firebase CLI**
```bash
# Deploy indexes using firestore.indexes.json
firebase deploy --only firestore:indexes
```

## ⏱️ **Index Creation Time**
- **Small datasets**: 1-5 minutes
- **Large datasets**: 10-30 minutes
- **Status**: Check the "Indexes" tab in Firebase Console

## 🔧 **Temporary Workaround**

I've implemented a temporary fix that:
1. **Removes the `orderBy` clause** from queries
2. **Sorts data on the client side** instead
3. **Allows the app to work** while indexes are being created

### **Files Modified:**
- `src/services/firebaseService.js` - Modified `getVendorOrders` and `getSupplierOrders`

## 📊 **Index Status Check**

### **Check if indexes are ready:**
1. Go to Firebase Console → Firestore → Indexes
2. Look for indexes with status:
   - ✅ **Enabled** - Ready to use
   - 🔄 **Building** - Still being created
   - ❌ **Error** - Needs attention

### **Test the fix:**
1. Refresh your application
2. Go to Vendor Orders tab
3. Try loading orders again
4. Use "Create Sample Orders" button to test

## 🎯 **Next Steps**

### **After indexes are created:**
1. **Revert the temporary fix** by uncommenting `orderBy` clauses
2. **Test all queries** to ensure they work
3. **Monitor performance** for large datasets

### **To revert the temporary fix:**
```javascript
// In firebaseService.js, uncomment these lines:
orderBy('createdAt', 'desc')
```

## 🚨 **Common Issues**

### **Index still building:**
- Wait for the index to complete (check Firebase Console)
- Use the temporary workaround until ready

### **Permission denied:**
- Ensure you have admin access to the Firebase project
- Check Firebase project permissions

### **Wrong project:**
- Verify you're in the correct Firebase project
- Check `firebase.js` configuration

## 📞 **Support**

If you continue to have issues:
1. Check Firebase Console for error messages
2. Verify project configuration in `src/config/firebase.js`
3. Test with the temporary workaround
4. Contact Firebase support if needed

---

**Note**: The temporary workaround will work immediately, but for production use, create the proper indexes for better performance. 