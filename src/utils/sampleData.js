import { orderService, supplierService, reviewService } from '../services/firebaseService'

// Sample order data for testing
export const createSampleOrders = async (vendorId, vendorName) => {
  try {
    // Get some suppliers to create orders with
    const suppliers = await supplierService.getSuppliers()
    
    if (suppliers.length === 0) {
      console.log('No suppliers found. Please create suppliers first.')
      return
    }

    const sampleOrders = [
      {
        vendorId: vendorId,
        vendorName: vendorName,
        supplierId: suppliers[0].id,
        supplierName: suppliers[0].name,
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
        orderDate: new Date().toLocaleDateString(),
        deliveryDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toLocaleDateString(),
        trackingId: `TRK${Date.now()}`,
        supplierRating: suppliers[0].rating || 4
      },
      {
        vendorId: vendorId,
        vendorName: vendorName,
        supplierId: suppliers[0].id,
        supplierName: suppliers[0].name,
        materials: [
          {
            id: 'mat3',
            name: 'Potatoes',
            quantity: 8,
            unit: 'kg',
            price: 25,
            total: 200
          }
        ],
        totalAmount: 200,
        status: 'delivered',
        orderDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toLocaleDateString(),
        deliveryDate: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toLocaleDateString(),
        trackingId: `TRK${Date.now() - 1000000}`,
        supplierRating: suppliers[0].rating || 4
      }
    ]

    // Create sample orders
    for (const orderData of sampleOrders) {
      await orderService.createOrder(orderData)
      console.log('Created sample order:', orderData.trackingId)
    }

    console.log('Sample orders created successfully!')
    return true
  } catch (error) {
    console.error('Error creating sample orders:', error)
    return false
  }
}

// Sample inventory data for suppliers
export const createSampleInventory = async (supplierId) => {
  try {
    const sampleInventory = [
      {
        supplierId: supplierId,
        name: 'Fresh Tomatoes',
        category: 'Vegetables',
        price: 40,
        unit: 'kg',
        stock: 100,
        minStock: 10,
        quality: 'Premium',
        description: 'Fresh red tomatoes, perfect for cooking'
      },
      {
        supplierId: supplierId,
        name: 'Onions',
        category: 'Vegetables',
        price: 30,
        unit: 'kg',
        stock: 150,
        minStock: 20,
        quality: 'Standard',
        description: 'Fresh onions, good for daily cooking'
      },
      {
        supplierId: supplierId,
        name: 'Potatoes',
        category: 'Vegetables',
        price: 25,
        unit: 'kg',
        stock: 200,
        minStock: 30,
        quality: 'Standard',
        description: 'Fresh potatoes, suitable for all dishes'
      },
      {
        supplierId: supplierId,
        name: 'Basmati Rice',
        category: 'Grains',
        price: 80,
        unit: 'kg',
        stock: 50,
        minStock: 5,
        quality: 'Premium',
        description: 'Premium quality basmati rice'
      },
      {
        supplierId: supplierId,
        name: 'Red Chilli Powder',
        category: 'Spices',
        price: 200,
        unit: 'kg',
        stock: 25,
        minStock: 2,
        quality: 'Premium',
        description: 'Hot and spicy red chilli powder'
      }
    ]

    // Import inventoryService here to avoid circular dependency
    const { inventoryService } = await import('../services/firebaseService')

    for (const item of sampleInventory) {
      await inventoryService.addInventoryItem(item)
      console.log('Created sample inventory item:', item.name)
    }

    console.log('Sample inventory created successfully!')
    return true
  } catch (error) {
    console.error('Error creating sample inventory:', error)
    return false
  }
}

// Function to initialize sample data for testing
export const initializeSampleData = async (user) => {
  try {
    console.log('Initializing sample data for user:', user.email)
    
    if (user.role === 'vendor') {
      // Create sample orders for vendor
      await createSampleOrders(user.uid, user.displayName || user.email)
    } else if (user.role === 'supplier') {
      // Create sample inventory for supplier
      await createSampleInventory(user.uid)
    }
    
    console.log('Sample data initialization completed!')
  } catch (error) {
    console.error('Error initializing sample data:', error)
  }
} 

// Create sample reviews for testing rating system
export const createSampleReviews = async (vendorId, vendorName) => {
  try {
    console.log('Creating sample reviews...')
    
    // Get all suppliers
    const suppliers = await supplierService.getSuppliers()
    if (suppliers.length === 0) {
      console.log('No suppliers found to create reviews for')
      return false
    }
    
    const sampleReviews = [
      {
        vendorId: vendorId,
        vendorName: vendorName,
        supplierId: suppliers[0].id,
        supplierName: suppliers[0].name,
        rating: 5,
        comment: 'Excellent quality vegetables, very fresh and delivered on time!',
        createdAt: new Date()
      },
      {
        vendorId: vendorId,
        vendorName: vendorName,
        supplierId: suppliers[0].id,
        supplierName: suppliers[0].name,
        rating: 4,
        comment: 'Good quality products, reasonable prices.',
        createdAt: new Date()
      }
    ]
    
    // Add reviews
    for (const reviewData of sampleReviews) {
      await reviewService.addReview(reviewData)
      console.log(`Created review for ${reviewData.supplierName}`)
    }
    
    console.log('Sample reviews created successfully!')
    return true
  } catch (error) {
    console.error('Error creating sample reviews:', error)
    return false
  }
} 