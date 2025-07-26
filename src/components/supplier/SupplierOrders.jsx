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
  CircularProgress
} from '@mui/material'
import {
  LocalShipping as ShippingIcon,
  CheckCircle as DeliveredIcon,
  Schedule as PendingIcon,
  Cancel as CancelledIcon,
  Visibility as ViewIcon
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
        return <CheckCircle color="info" />
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

  const handleStatusSubmit = () => {
    const updatedOrders = orders.map(order =>
      order.id === selectedOrder.id
        ? { ...order, status: statusUpdate }
        : order
    )
    setOrders(updatedOrders)
    setStatusDialog(false)
    toast.success('Order status updated successfully')
  }

  const handleAcceptOrder = (orderId) => {
    const updatedOrders = orders.map(order =>
      order.id === orderId
        ? { ...order, status: 'confirmed' }
        : order
    )
    setOrders(updatedOrders)
    toast.success('Order accepted successfully')
  }

  const handleRejectOrder = (orderId) => {
    const updatedOrders = orders.map(order =>
      order.id === orderId
        ? { ...order, status: 'cancelled' }
        : order
    )
    setOrders(updatedOrders)
    toast.success('Order rejected')
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
                        {order.vendor}
                      </Typography>
                      <Rating value={order.vendorRating} readOnly size="small" />
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {order.materials.length} items
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      ₹{order.totalAmount}
                    </Typography>
                  </TableCell>
                  <TableCell>{order.orderDate}</TableCell>
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
                      label={order.paymentStatus}
                      color={order.paymentStatus === 'paid' ? 'success' : 'warning'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() => handleViewOrder(order)}
                      sx={{ mr: 1 }}
                    >
                      View
                    </Button>
                    {order.status === 'pending' && (
                      <>
                        <Button
                          size="small"
                          variant="contained"
                          color="success"
                          onClick={() => handleAcceptOrder(order.id)}
                          sx={{ mr: 1 }}
                        >
                          Accept
                        </Button>
                        <Button
                          size="small"
                          variant="contained"
                          color="error"
                          onClick={() => handleRejectOrder(order.id)}
                        >
                          Reject
                        </Button>
                      </>
                    )}
                    {order.status !== 'pending' && order.status !== 'cancelled' && (
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() => handleUpdateStatus(order)}
                      >
                        Update Status
                      </Button>
                    )}
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
                        {selectedOrder.vendor}
                      </Typography>
                      <Rating value={selectedOrder.vendorRating} readOnly />
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        Phone: {selectedOrder.vendorPhone}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Location: {selectedOrder.vendorLocation}
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
                        Order Date: {selectedOrder.orderDate}
                      </Typography>
                      <Typography variant="body2">
                        Expected Delivery: {selectedOrder.deliveryDate}
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600, mt: 1 }}>
                        Total Amount: ₹{selectedOrder.totalAmount}
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
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setOrderDialog(false)}>Close</Button>
              {selectedOrder.status === 'pending' && (
                <>
                  <Button variant="contained" color="success" onClick={() => handleAcceptOrder(selectedOrder.id)}>
                    Accept Order
                  </Button>
                  <Button variant="contained" color="error" onClick={() => handleRejectOrder(selectedOrder.id)}>
                    Reject Order
                  </Button>
                </>
              )}
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
        <DialogTitle>
          Update Order Status
        </DialogTitle>
        <DialogContent>
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>New Status</InputLabel>
            <Select
              value={statusUpdate}
              label="New Status"
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
          <Button variant="contained" onClick={handleStatusSubmit}>
            Update Status
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default SupplierOrders 