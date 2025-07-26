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
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  DialogContentText
} from '@mui/material'
import {
  LocalShipping as ShippingIcon,
  CheckCircle as DeliveredIcon,
  Schedule as PendingIcon,
  Cancel as CancelledIcon,
  Visibility as ViewIcon,
  CheckCircle as AcceptIcon,
  Cancel as RejectIcon
} from '@mui/icons-material'
import { orderService } from '../../services/firebaseService'
import { useAuth } from '../../contexts/AuthContext'
import toast from 'react-hot-toast'

const SupplierOrders = () => {
  const { user } = useAuth()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [orderDialog, setOrderDialog] = useState(false)
  const [statusDialog, setStatusDialog] = useState(false)
  const [statusUpdate, setStatusUpdate] = useState('')
  const [confirmDialog, setConfirmDialog] = useState(false)
  const [actionType, setActionType] = useState('')
  const [processingOrder, setProcessingOrder] = useState(null)

  useEffect(() => {
    loadOrders()
  }, [user])

  const loadOrders = async () => {
    if (!user) return
    
    try {
      setLoading(true)
      const ordersData = await orderService.getSupplierOrders(user.uid)
      setOrders(ordersData)
    } catch (error) {
      console.error('Error loading orders:', error)
      toast.error('Failed to load orders')
    } finally {
      setLoading(false)
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'delivered':
        return <DeliveredIcon color="success" />
      case 'in_transit':
        return <ShippingIcon color="primary" />
      case 'confirmed':
        return <DeliveredIcon color="info" />
      case 'pending':
        return <PendingIcon color="warning" />
      case 'cancelled':
        return <CancelledIcon color="error" />
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
      case 'confirmed':
        return 'info'
      case 'pending':
        return 'warning'
      case 'cancelled':
        return 'error'
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
      case 'confirmed':
        return 'Confirmed'
      case 'pending':
        return 'Pending'
      case 'cancelled':
        return 'Cancelled'
      default:
        return 'Unknown'
    }
  }

  const handleViewOrder = (order) => {
    setSelectedOrder(order)
    setOrderDialog(true)
  }

  const handleUpdateStatus = (order) => {
    setSelectedOrder(order)
    setStatusUpdate(order.status)
    setStatusDialog(true)
  }

  const handleStatusSubmit = async () => {
    if (!selectedOrder) return
    
    try {
      setProcessingOrder(selectedOrder.id)
      await orderService.updateOrderStatus(selectedOrder.id, statusUpdate)
      
      // Update local state
      const updatedOrders = orders.map(order =>
        order.id === selectedOrder.id
          ? { ...order, status: statusUpdate }
          : order
      )
      setOrders(updatedOrders)
      setStatusDialog(false)
      toast.success('Order status updated successfully')
    } catch (error) {
      console.error('Error updating order status:', error)
      toast.error('Failed to update order status')
    } finally {
      setProcessingOrder(null)
    }
  }

  const handleAcceptOrder = (order) => {
    setSelectedOrder(order)
    setActionType('accept')
    setConfirmDialog(true)
  }

  const handleRejectOrder = (order) => {
    setSelectedOrder(order)
    setActionType('reject')
    setConfirmDialog(true)
  }

  const handleConfirmAction = async () => {
    if (!selectedOrder) return
    
    try {
      setProcessingOrder(selectedOrder.id)
      const newStatus = actionType === 'accept' ? 'confirmed' : 'cancelled'
      
      // Update order status in Firebase
      await orderService.updateOrderStatus(selectedOrder.id, newStatus)
      
      // Update local state
      const updatedOrders = orders.map(order =>
        order.id === selectedOrder.id
          ? { ...order, status: newStatus }
          : order
      )
      setOrders(updatedOrders)
      
      // Show success message
      const message = actionType === 'accept' ? 'Order accepted successfully' : 'Order rejected successfully'
      toast.success(message)
      
      setConfirmDialog(false)
    } catch (error) {
      console.error(`Error ${actionType}ing order:`, error)
      toast.error(`Failed to ${actionType} order`)
    } finally {
      setProcessingOrder(null)
    }
  }

  const handleCancelAction = () => {
    setConfirmDialog(false)
    setSelectedOrder(null)
    setActionType('')
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
          Incoming Orders
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Manage and process orders from street food vendors
        </Typography>
      </Paper>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      ) : orders.length === 0 ? (
        <Alert severity="info">
          No incoming orders found. Orders will appear here when vendors place them.
        </Alert>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Order ID</TableCell>
                <TableCell>Vendor</TableCell>
                <TableCell>Materials</TableCell>
                <TableCell>Total Amount</TableCell>
                <TableCell>Order Date</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Payment</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {orders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell>{order.id}</TableCell>
                  <TableCell>
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {order.vendorName || order.vendor || 'Unknown Vendor'}
                      </Typography>
                      <Rating value={order.vendorRating || 0} readOnly size="small" />
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
                    <Chip
                      label={order.paymentStatus || 'pending'}
                      color={order.paymentStatus === 'completed' ? 'success' : 'warning'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<ViewIcon />}
                        onClick={() => handleViewOrder(order)}
                        fullWidth
                      >
                        VIEW
                      </Button>
                      {order.status === 'pending' && (
                        <>
                          <Button
                            size="small"
                            variant="contained"
                            color="success"
                            startIcon={<AcceptIcon />}
                            onClick={() => handleAcceptOrder(order)}
                            disabled={processingOrder === order.id}
                            fullWidth
                          >
                            {processingOrder === order.id ? 'Processing...' : 'ACCEPT'}
                          </Button>
                          <Button
                            size="small"
                            variant="contained"
                            color="error"
                            startIcon={<RejectIcon />}
                            onClick={() => handleRejectOrder(order)}
                            disabled={processingOrder === order.id}
                            fullWidth
                          >
                            {processingOrder === order.id ? 'Processing...' : 'REJECT'}
                          </Button>
                        </>
                      )}
                      {order.status !== 'pending' && order.status !== 'cancelled' && (
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() => handleUpdateStatus(order)}
                          disabled={processingOrder === order.id}
                          fullWidth
                        >
                          Update Status
                        </Button>
                      )}
                    </Box>
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
              Order Details - {selectedOrder.id}
            </DialogTitle>
            <DialogContent>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Vendor Information
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        {selectedOrder.vendorName || selectedOrder.vendor || 'Unknown Vendor'}
                      </Typography>
                      <Rating value={selectedOrder.vendorRating || 0} readOnly />
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        Order ID: {selectedOrder.trackingId || selectedOrder.id}
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
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Status Update Dialog */}
      <Dialog
        open={statusDialog}
        onClose={() => setStatusDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Update Order Status</DialogTitle>
        <DialogContent>
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>Status</InputLabel>
            <Select
              value={statusUpdate}
              label="Status"
              onChange={(e) => setStatusUpdate(e.target.value)}
            >
              <MenuItem value="confirmed">Confirmed</MenuItem>
              <MenuItem value="in_transit">In Transit</MenuItem>
              <MenuItem value="delivered">Delivered</MenuItem>
              <MenuItem value="cancelled">Cancelled</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setStatusDialog(false)}>Cancel</Button>
          <Button 
            onClick={handleStatusSubmit} 
            variant="contained"
            disabled={processingOrder === selectedOrder?.id}
          >
            {processingOrder === selectedOrder?.id ? 'Updating...' : 'Update'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Confirmation Dialog */}
      <Dialog
        open={confirmDialog}
        onClose={handleCancelAction}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {actionType === 'accept' ? 'Accept Order' : 'Reject Order'}
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to {actionType} this order?
            {actionType === 'accept' 
              ? ' This will confirm the order and notify the vendor.'
              : ' This will cancel the order and notify the vendor.'
            }
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelAction}>Cancel</Button>
          <Button 
            onClick={handleConfirmAction} 
            variant="contained"
            color={actionType === 'accept' ? 'success' : 'error'}
            disabled={processingOrder === selectedOrder?.id}
          >
            {processingOrder === selectedOrder?.id ? 'Processing...' : actionType === 'accept' ? 'Accept' : 'Reject'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default SupplierOrders 