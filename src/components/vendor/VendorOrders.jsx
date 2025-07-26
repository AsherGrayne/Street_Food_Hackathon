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
  Cancel as CancelledIcon
} from '@mui/icons-material'
import { orderService } from '../../services/firebaseService'
import { useAuth } from '../../contexts/AuthContext'
import toast from 'react-hot-toast'

const VendorOrders = () => {
  const { user } = useAuth()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [orderDialog, setOrderDialog] = useState(false)

  useEffect(() => {
    loadOrders()
  }, [user])

  const loadOrders = async () => {
    if (!user) return
    
    try {
      setLoading(true)
      const ordersData = await orderService.getVendorOrders(user.uid)
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
      ) : orders.length === 0 ? (
        <Alert severity="info" sx={{ mx: 3 }}>
          No orders found.
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
                  <TableCell>{order.id}</TableCell>
                  <TableCell>
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {order.supplier}
                      </Typography>
                      <Rating value={order.supplierRating} readOnly size="small" />
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
              Order Details - {selectedOrder.id}
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
                        {selectedOrder.supplier}
                      </Typography>
                      <Rating value={selectedOrder.supplierRating} readOnly />
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        Tracking ID: {selectedOrder.trackingId}
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
              <Button variant="contained">Track Delivery</Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  )
}

export default VendorOrders 