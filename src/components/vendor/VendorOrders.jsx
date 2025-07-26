import React, { useState, useEffect } from 'react'
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Card,
  CardContent,
  Rating,
  Alert,
  CircularProgress
} from '@mui/material'
import {
  LocalShipping as ShippingIcon,
  CheckCircle as DeliveredIcon,
  Schedule as PendingIcon,
  Cancel as CancelledIcon,
  Add as AddIcon
} from '@mui/icons-material'
import { orderService } from '../../services/firebaseService'
import { useAuth } from '../../contexts/AuthContext'
import { createSampleOrders } from '../../utils/sampleData'
import toast from 'react-hot-toast'

const VendorOrders = () => {
  const { user } = useAuth()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [orderDialog, setOrderDialog] = useState(false)
  const [creatingSample, setCreatingSample] = useState(false)

  useEffect(() => {
    if (user) {
      loadOrders()
    }
  }, [user])

  const loadOrders = async () => {
    if (!user) {
      setError('No user logged in')
      setLoading(false)
      return
    }
    
    try {
      setLoading(true)
      setError(null)
      console.log('Loading orders for user:', user.uid)
      
      const ordersData = await orderService.getVendorOrders(user.uid)
      console.log('Orders loaded:', ordersData)
      
      setOrders(ordersData || [])
    } catch (error) {
      console.error('Error loading orders:', error)
      setError(error.message || 'Failed to load orders')
      toast.error('Failed to load orders: ' + (error.message || 'Unknown error'))
    } finally {
      setLoading(false)
    }
  }

  const handleCreateSampleOrders = async () => {
    try {
      setCreatingSample(true)
      const success = await createSampleOrders(user.uid, user.displayName || user.email)
      
      if (success) {
        toast.success('Sample orders created successfully!')
        await loadOrders() // Reload orders
      } else {
        toast.error('Failed to create sample orders. Please create suppliers first.')
      }
    } catch (error) {
      console.error('Error creating sample orders:', error)
      toast.error('Failed to create sample orders')
    } finally {
      setCreatingSample(false)
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'delivered':
        return <DeliveredIcon color="success" />
      case 'in_transit':
        return <ShippingIcon color="primary" />
      case 'pending':
        return <PendingIcon color="warning" />
      case 'cancelled':
        return <CancelledIcon color="error" />
      case 'confirmed':
        return <PendingIcon color="info" />
      default:
        return <PendingIcon />
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'delivered':
        return 'success'
      case 'in_transit':
        return 'primary'
      case 'pending':
        return 'warning'
      case 'cancelled':
        return 'error'
      case 'confirmed':
        return 'info'
      default:
        return 'default'
    }
  }

  const getStatusText = (status) => {
    switch (status) {
      case 'delivered':
        return 'Delivered'
      case 'in_transit':
        return 'In Transit'
      case 'pending':
        return 'Pending'
      case 'cancelled':
        return 'Cancelled'
      case 'confirmed':
        return 'Confirmed'
      default:
        return 'Unknown'
    }
  }

  const handleViewOrder = (order) => {
    setSelectedOrder(order)
    setOrderDialog(true)
  }

  const formatDate = (date) => {
    if (!date) return 'N/A'
    
    try {
      if (date.toDate) {
        return date.toDate().toLocaleDateString()
      } else if (typeof date === 'string') {
        return new Date(date).toLocaleDateString()
      } else {
        return new Date(date).toLocaleDateString()
      }
    } catch (error) {
      return 'Invalid Date'
    }
  }

  return (
    <Box>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
          My Orders
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Track your raw material purchases and delivery status
        </Typography>
      </Paper>

      {loading ? (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error" sx={{ mx: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Error Loading Orders
          </Typography>
          <Typography variant="body2" gutterBottom>
            {error}
          </Typography>
          <Button 
            variant="outlined" 
            onClick={loadOrders}
            sx={{ mt: 1 }}
          >
            Retry
          </Button>
        </Alert>
      ) : orders.length === 0 ? (
        <Alert severity="info" sx={{ mx: 3 }}>
          <Typography variant="h6" gutterBottom>
            No Orders Found
          </Typography>
          <Typography variant="body2" gutterBottom>
            You haven't placed any orders yet. Start by searching for suppliers and placing your first order!
          </Typography>
          <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
            <Button 
              variant="contained" 
              onClick={() => window.location.href = '/vendor'}
            >
              Search Suppliers
            </Button>
            <Button 
              variant="outlined"
              startIcon={<AddIcon />}
              onClick={handleCreateSampleOrders}
              disabled={creatingSample}
            >
              {creatingSample ? 'Creating...' : 'Create Sample Orders'}
            </Button>
          </Box>
        </Alert>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Order ID</TableCell>
                <TableCell>Supplier</TableCell>
                <TableCell>Materials</TableCell>
                <TableCell>Total Amount</TableCell>
                <TableCell>Order Date</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {orders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell>{order.trackingId || order.id}</TableCell>
                  <TableCell>
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {order.supplierName || 'Unknown Supplier'}
                      </Typography>
                      <Rating value={order.supplierRating || 0} readOnly size="small" />
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {order.materials?.length || 0} items
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      ₹{order.totalAmount?.toLocaleString() || '0'}
                    </Typography>
                  </TableCell>
                  <TableCell>{formatDate(order.orderDate || order.createdAt)}</TableCell>
                  <TableCell>
                    <Chip
                      icon={getStatusIcon(order.status)}
                      label={getStatusText(order.status)}
                      color={getStatusColor(order.status)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() => handleViewOrder(order)}
                    >
                      View Details
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Order Details Dialog */}
      <Dialog
        open={orderDialog}
        onClose={() => setOrderDialog(false)}
        maxWidth="md"
        fullWidth
      >
        {selectedOrder && (
          <>
            <DialogTitle>
              Order Details - {selectedOrder.trackingId || selectedOrder.id}
            </DialogTitle>
            <DialogContent>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Supplier Information
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        {selectedOrder.supplierName || 'Unknown Supplier'}
                      </Typography>
                      <Rating value={selectedOrder.supplierRating || 0} readOnly />
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        Tracking ID: {selectedOrder.trackingId || 'N/A'}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Order Summary
                      </Typography>
                      <Typography variant="body2">
                        Order Date: {formatDate(selectedOrder.orderDate || selectedOrder.createdAt)}
                      </Typography>
                      <Typography variant="body2">
                        Expected Delivery: {formatDate(selectedOrder.deliveryDate)}
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600, mt: 1 }}>
                        Total Amount: ₹{selectedOrder.totalAmount?.toLocaleString() || '0'}
                      </Typography>
                      <Chip
                        icon={getStatusIcon(selectedOrder.status)}
                        label={getStatusText(selectedOrder.status)}
                        color={getStatusColor(selectedOrder.status)}
                        sx={{ mt: 1 }}
                      />
                    </CardContent>
                  </Card>
                </Grid>
                
                <Grid item xs={12}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Ordered Materials
                      </Typography>
                      {selectedOrder.materials && selectedOrder.materials.length > 0 ? (
                        <Table size="small">
                          <TableHead>
                            <TableRow>
                              <TableCell>Material</TableCell>
                              <TableCell>Quantity</TableCell>
                              <TableCell>Unit Price</TableCell>
                              <TableCell>Total</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {selectedOrder.materials.map((material, index) => (
                              <TableRow key={index}>
                                <TableCell>{material.name}</TableCell>
                                <TableCell>{material.quantity} {material.unit}</TableCell>
                                <TableCell>₹{material.price}</TableCell>
                                <TableCell>₹{material.total}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          No materials found for this order.
                        </Typography>
                      )}
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setOrderDialog(false)}>Close</Button>
              <Button variant="contained">Track Delivery</Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  )
}

export default VendorOrders 