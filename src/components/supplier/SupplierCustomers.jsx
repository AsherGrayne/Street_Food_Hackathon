import React, { useState, useEffect } from 'react'
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  Rating,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Alert,
  CircularProgress
} from '@mui/material'
import {
  Phone as PhoneIcon,
  Email as EmailIcon,
  LocationOn as LocationIcon,
  Star as StarIcon,
  ShoppingCart as OrderIcon,
  AttachMoney as MoneyIcon
} from '@mui/icons-material'
import { orderService, userService } from '../../services/firebaseService'
import { useAuth } from '../../contexts/AuthContext'
import toast from 'react-hot-toast'

const SupplierCustomers = () => {
  const { user } = useAuth()
  const [customers, setCustomers] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedCustomer, setSelectedCustomer] = useState(null)
  const [customerDialog, setCustomerDialog] = useState(false)

  useEffect(() => {
    loadCustomers()
  }, [user])

  const loadCustomers = async () => {
    if (!user) return
    
    try {
      setLoading(true)
      const orders = await orderService.getSupplierOrders(user.uid)
      
      // Get unique customers from orders
      const customerIds = [...new Set(orders.map(order => order.vendorId))]
      const customersData = []
      
      for (const customerId of customerIds) {
        try {
          const customerProfile = await userService.getUserProfile(customerId)
          if (customerProfile && customerProfile.role === 'vendor') {
            const customerOrders = orders.filter(order => order.vendorId === customerId)
            const totalSpent = customerOrders.reduce((sum, order) => sum + (order.totalAmount || 0), 0)
            
            customersData.push({
              ...customerProfile,
              totalOrders: customerOrders.length,
              totalSpent,
              lastOrder: customerOrders.length > 0 ? customerOrders[0].orderDate : null,
              recentOrders: customerOrders.slice(0, 3)
            })
          }
        } catch (error) {
          console.error('Error loading customer profile:', error)
        }
      }
      
      setCustomers(customersData)
    } catch (error) {
      console.error('Error loading customers:', error)
      toast.error('Failed to load customers')
    } finally {
      setLoading(false)
    }
  }

  const handleViewCustomer = (customer) => {
    setSelectedCustomer(customer)
    setCustomerDialog(true)
  }

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '300px' }}>
        <CircularProgress />
      </Box>
    )
  }

  if (customers.length === 0) {
    return (
      <Alert severity="info" sx={{ mt: 3 }}>
        No customers found yet.
      </Alert>
    )
  }

  return (
    <Box>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
          My Customers
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Manage relationships with street food vendors
        </Typography>
      </Paper>

      <Grid container spacing={3}>
        {customers.map((customer) => (
          <Grid item xs={12} md={6} lg={4} key={customer.uid}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                    {customer.name.charAt(0)}
                  </Avatar>
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      {customer.name}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Rating value={customer.rating} readOnly size="small" />
                      <Typography variant="body2" color="text.secondary">
                        {customer.rating}
                      </Typography>
                    </Box>
                  </Box>
                  <Chip 
                    label={customer.status} 
                    color="success" 
                    size="small"
                  />
                </Box>

                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    <LocationIcon fontSize="small" sx={{ mr: 1, verticalAlign: 'middle' }} />
                    {customer.location}
                  </Typography>
                </Box>

                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Preferences:
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {customer.preferences.map((pref, index) => (
                      <Chip 
                        key={index} 
                        label={pref} 
                        size="small" 
                        variant="outlined"
                      />
                    ))}
                  </Box>
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Total Orders
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      {customer.totalOrders}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Total Spent
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      ₹{customer.totalSpent}
                    </Typography>
                  </Box>
                </Box>

                <Typography variant="body2" color="text.secondary">
                  Last Order: {customer.lastOrder}
                </Typography>
              </CardContent>
              
              <CardActions>
                <Button
                  size="small"
                  variant="outlined"
                  onClick={() => handleViewCustomer(customer)}
                >
                  View Details
                </Button>
                <Button
                  size="small"
                  variant="contained"
                >
                  Contact
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Customer Details Dialog */}
      <Dialog
        open={customerDialog}
        onClose={() => setCustomerDialog(false)}
        maxWidth="md"
        fullWidth
      >
        {selectedCustomer && (
          <>
            <DialogTitle>
              Customer Details - {selectedCustomer.name}
            </DialogTitle>
            <DialogContent>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Avatar sx={{ bgcolor: 'primary.main', mr: 2, width: 64, height: 64 }}>
                      {selectedCustomer.name.charAt(0)}
                    </Avatar>
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        {selectedCustomer.name}
                      </Typography>
                      <Rating value={selectedCustomer.rating} readOnly />
                      <Typography variant="body2" color="text.secondary">
                        Customer since {selectedCustomer.joinedDate}
                      </Typography>
                    </Box>
                  </Box>
                  
                  <List dense>
                    <ListItem>
                      <ListItemAvatar>
                        <LocationIcon />
                      </ListItemAvatar>
                      <ListItemText 
                        primary="Location" 
                        secondary={selectedCustomer.location}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemAvatar>
                        <PhoneIcon />
                      </ListItemAvatar>
                      <ListItemText 
                        primary="Phone" 
                        secondary={selectedCustomer.phone}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemAvatar>
                        <EmailIcon />
                      </ListItemAvatar>
                      <ListItemText 
                        primary="Email" 
                        secondary={selectedCustomer.email}
                      />
                    </ListItem>
                  </List>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" gutterBottom>
                    Business Statistics
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Paper sx={{ p: 2, textAlign: 'center' }}>
                        <Typography variant="h4" color="primary" sx={{ fontWeight: 600 }}>
                          {selectedCustomer.totalOrders}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Total Orders
                        </Typography>
                      </Paper>
                    </Grid>
                    <Grid item xs={6}>
                      <Paper sx={{ p: 2, textAlign: 'center' }}>
                        <Typography variant="h4" color="primary" sx={{ fontWeight: 600 }}>
                          ₹{selectedCustomer.totalSpent}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Total Spent
                        </Typography>
                      </Paper>
                    </Grid>
                  </Grid>
                  
                  <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                    Preferences
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {selectedCustomer.preferences.map((pref, index) => (
                      <Chip 
                        key={index} 
                        label={pref} 
                        color="primary" 
                        variant="outlined"
                      />
                    ))}
                  </Box>
                </Grid>
                
                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom>
                    Recent Orders
                  </Typography>
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Order ID</TableCell>
                          <TableCell>Date</TableCell>
                          <TableCell>Amount</TableCell>
                          <TableCell>Status</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {selectedCustomer.recentOrders.map((order) => (
                          <TableRow key={order.id}>
                            <TableCell>{order.id}</TableCell>
                            <TableCell>{order.date}</TableCell>
                            <TableCell>₹{order.amount}</TableCell>
                            <TableCell>
                              <Chip 
                                label={order.status} 
                                color={order.status === 'delivered' ? 'success' : 'primary'}
                                size="small"
                              />
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setCustomerDialog(false)}>Close</Button>
              <Button variant="contained">Send Message</Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  )
}

export default SupplierCustomers 