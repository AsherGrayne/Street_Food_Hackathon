import React, { useState, useEffect } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Chip,
  List,
  ListItem,
  ListItemText,
  TextField,
  IconButton,
  Alert,
  Divider
} from '@mui/material'
import {
  Close as CloseIcon,
  ShoppingCart as BuyIcon,
  Payment as PaymentIcon
} from '@mui/icons-material'
import { inventoryService, orderService } from '../../services/firebaseService'
import { useAuth } from '../../contexts/AuthContext'
import UPIPaymentDialog from '../payment/UPIPaymentDialog'
import toast from 'react-hot-toast'

const SharedBuyDialog = ({ 
  open, 
  onClose, 
  supplier, 
  onOrderPlaced 
}) => {
  const { user } = useAuth()
  const [supplierInventory, setSupplierInventory] = useState([])
  const [cart, setCart] = useState([])
  const [loading, setLoading] = useState(false)
  const [showPaymentDialog, setShowPaymentDialog] = useState(false)
  const [orderData, setOrderData] = useState(null)

  useEffect(() => {
    if (open && supplier) {
      loadSupplierInventory()
    }
  }, [open, supplier])

  const loadSupplierInventory = async () => {
    if (!supplier) return
    
    try {
      setLoading(true)
      const inventory = await inventoryService.getSupplierInventory(supplier.id)
      setSupplierInventory(inventory)
      setCart([])
    } catch (error) {
      console.error('Error loading supplier inventory:', error)
      toast.error('Failed to load supplier inventory')
    } finally {
      setLoading(false)
    }
  }

  const handleAddToCart = (item) => {
    const existingItem = cart.find(cartItem => cartItem.id === item.id)
    if (existingItem) {
      setCart(cart.map(cartItem => 
        cartItem.id === item.id 
          ? { ...cartItem, quantity: cartItem.quantity + 1 }
          : cartItem
      ))
    } else {
      setCart([...cart, { ...item, quantity: 1 }])
    }
    toast.success(`${item.name} added to cart`)
  }

  const handleRemoveFromCart = (itemId) => {
    setCart(cart.filter(item => item.id !== itemId))
  }

  const handleUpdateQuantity = (itemId, quantity) => {
    if (quantity <= 0) {
      handleRemoveFromCart(itemId)
    } else {
      setCart(cart.map(item => 
        item.id === itemId ? { ...item, quantity } : item
      ))
    }
  }

  const handleProceedToPayment = () => {
    if (cart.length === 0) {
      toast.error('Please add items to cart before proceeding')
      return
    }

    // Prepare order data for payment
    const orderDataForPayment = {
      vendorId: user.uid,
      vendorName: user.displayName || user.email,
      supplierId: supplier.id,
      supplierName: supplier.name,
      materials: cart.map(item => ({
        id: item.id,
        name: item.name,
        quantity: item.quantity,
        unit: item.unit,
        price: item.price,
        total: item.price * item.quantity
      })),
      totalAmount: cart.reduce((total, item) => total + (item.price * item.quantity), 0),
      status: 'pending',
      orderDate: new Date().toLocaleDateString(),
      deliveryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString(), // 7 days from now
      trackingId: `TRK${Date.now()}`,
      supplierRating: supplier.rating || 0
    }

    setOrderData(orderDataForPayment)
    setShowPaymentDialog(true)
  }

  const handlePaymentSuccess = async (paymentDetails) => {
    try {
      // Add payment details to order data
      const finalOrderData = {
        ...orderData,
        paymentDetails,
        status: 'confirmed',
        paymentStatus: 'completed'
      }

      // Create the order in Firebase
      await orderService.createOrder(finalOrderData)
      
      toast.success('Order placed successfully!')
      
      // Reset state
      setCart([])
      setShowPaymentDialog(false)
      setOrderData(null)
      onClose()
      
      // Notify parent component that order was placed
      if (onOrderPlaced) {
        onOrderPlaced()
      }
    } catch (error) {
      console.error('Error placing order:', error)
      toast.error('Failed to place order')
    }
  }

  const handlePaymentFailure = (paymentDetails) => {
    console.log('Payment failed:', paymentDetails)
    setShowPaymentDialog(false)
    setOrderData(null)
    // Don't close the buy dialog, let user try again
  }

  const handleClose = () => {
    setCart([])
    setShowPaymentDialog(false)
    setOrderData(null)
    onClose()
  }

  if (!supplier) return null

  return (
    <>
      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">Buy from {supplier.name}</Typography>
            <IconButton onClick={handleClose}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={3}>
            <Grid item xs={12} md={8}>
              <Typography variant="h6" gutterBottom>Available Products</Typography>
              {loading ? (
                <Alert severity="info">Loading products...</Alert>
              ) : supplierInventory.length === 0 ? (
                <Alert severity="info">No products available from this supplier.</Alert>
              ) : (
                <Grid container spacing={2}>
                  {supplierInventory.map((item) => (
                    <Grid item xs={12} sm={6} key={item.id}>
                      <Card>
                        <CardContent>
                          <Typography variant="h6" gutterBottom>
                            {item.name}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" gutterBottom>
                            {item.description}
                          </Typography>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                            <Typography variant="h6" color="primary">
                              ₹{item.price}/{item.unit}
                            </Typography>
                            <Chip label={item.quality} color="primary" size="small" />
                          </Box>
                          <Typography variant="body2" color="text.secondary">
                            Stock: {item.stock} {item.unit}
                          </Typography>
                          <Button
                            fullWidth
                            variant="outlined"
                            onClick={() => handleAddToCart(item)}
                            disabled={item.stock <= 0}
                            sx={{ mt: 1 }}
                          >
                            Add to Cart
                          </Button>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              )}
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>Shopping Cart</Typography>
                  {cart.length === 0 ? (
                    <Typography variant="body2" color="text.secondary">
                      Your cart is empty
                    </Typography>
                  ) : (
                    <>
                      <List>
                        {cart.map((item) => (
                          <ListItem key={item.id} sx={{ px: 0 }}>
                            <ListItemText
                              primary={item.name}
                              secondary={`₹${item.price}/${item.unit}`}
                            />
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <TextField
                                type="number"
                                size="small"
                                value={item.quantity}
                                onChange={(e) => handleUpdateQuantity(item.id, parseInt(e.target.value) || 0)}
                                inputProps={{ min: 1, max: item.stock }}
                                sx={{ width: 60 }}
                              />
                              <IconButton
                                size="small"
                                onClick={() => handleRemoveFromCart(item.id)}
                              >
                                <CloseIcon />
                              </IconButton>
                            </Box>
                          </ListItem>
                        ))}
                      </List>
                      <Divider sx={{ my: 2 }} />
                      <Typography variant="h6" gutterBottom>
                        Total: ₹{cart.reduce((total, item) => total + (item.price * item.quantity), 0).toLocaleString()}
                      </Typography>
                      <Button
                        fullWidth
                        variant="contained"
                        onClick={handleProceedToPayment}
                        disabled={cart.length === 0}
                        startIcon={<PaymentIcon />}
                      >
                        Proceed to Payment
                      </Button>
                    </>
                  )}
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </DialogContent>
      </Dialog>

      {/* UPI Payment Dialog */}
      <UPIPaymentDialog
        open={showPaymentDialog}
        onClose={() => setShowPaymentDialog(false)}
        orderData={orderData}
        onPaymentSuccess={handlePaymentSuccess}
        onPaymentFailure={handlePaymentFailure}
      />
    </>
  )
}

export default SharedBuyDialog 