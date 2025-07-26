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
  CircularProgress,
  Divider,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Tooltip
} from '@mui/material'
import {
  Phone as PhoneIcon,
  Email as EmailIcon,
  LocationOn as LocationIcon,
  Star as StarIcon,
  ShoppingCart as OrderIcon,
  AttachMoney as MoneyIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  CalendarToday as CalendarIcon,
  Business as BusinessIcon,
  Send as SendIcon,
  Visibility as ViewIcon
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
  const [messageDialog, setMessageDialog] = useState(false)
  const [messageText, setMessageText] = useState('')
  const [sortBy, setSortBy] = useState('totalSpent')
  const [filterStatus, setFilterStatus] = useState('all')

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
            const averageOrderValue = customerOrders.length > 0 ? totalSpent / customerOrders.length : 0
            
            // Calculate customer status based on activity
            const lastOrderDate = customerOrders.length > 0 
              ? (customerOrders[0].createdAt?.toDate ? customerOrders[0].createdAt.toDate() : new Date(customerOrders[0].orderDate || customerOrders[0].createdAt))
              : null
            
            const daysSinceLastOrder = lastOrderDate 
              ? Math.floor((new Date() - lastOrderDate) / (1000 * 60 * 60 * 24))
              : null
            
            let status = 'Active'
            if (daysSinceLastOrder !== null) {
              if (daysSinceLastOrder <= 7) status = 'Very Active'
              else if (daysSinceLastOrder <= 30) status = 'Active'
              else if (daysSinceLastOrder <= 90) status = 'Inactive'
              else status = 'Dormant'
            }
            
            customersData.push({
              ...customerProfile,
              totalOrders: customerOrders.length,
              totalSpent,
              averageOrderValue,
              lastOrder: lastOrderDate,
              daysSinceLastOrder,
              status,
              recentOrders: customerOrders.slice(0, 5),
              orderHistory: customerOrders
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

  const handleSendMessage = (customer) => {
    setSelectedCustomer(customer)
    setMessageDialog(true)
  }

  const handleSendMessageSubmit = () => {
    if (!messageText.trim()) {
      toast.error('Please enter a message')
      return
    }
    
    // Here you would typically send the message through a messaging service
    toast.success(`Message sent to ${selectedCustomer.name}`)
    setMessageText('')
    setMessageDialog(false)
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'Very Active': return 'success'
      case 'Active': return 'primary'
      case 'Inactive': return 'warning'
      case 'Dormant': return 'error'
      default: return 'default'
    }
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

  const getDaysAgo = (date) => {
    if (!date) return 'N/A'
    
    try {
      const orderDate = date.toDate ? date.toDate() : new Date(date)
      const daysAgo = Math.floor((new Date() - orderDate) / (1000 * 60 * 60 * 24))
      
      if (daysAgo === 0) return 'Today'
      if (daysAgo === 1) return 'Yesterday'
      if (daysAgo < 7) return `${daysAgo} days ago`
      if (daysAgo < 30) return `${Math.floor(daysAgo / 7)} weeks ago`
      return `${Math.floor(daysAgo / 30)} months ago`
    } catch (error) {
      return 'N/A'
    }
  }

  const sortedAndFilteredCustomers = customers
    .filter(customer => filterStatus === 'all' || customer.status === filterStatus)
    .sort((a, b) => {
      switch (sortBy) {
        case 'totalSpent':
          return b.totalSpent - a.totalSpent
        case 'totalOrders':
          return b.totalOrders - a.totalOrders
        case 'averageOrderValue':
          return b.averageOrderValue - a.averageOrderValue
        case 'lastOrder':
          return (b.lastOrder || 0) - (a.lastOrder || 0)
        case 'name':
          return a.name.localeCompare(b.name)
        default:
          return b.totalSpent - a.totalSpent
      }
    })

  const totalCustomers = customers.length
  const totalRevenue = customers.reduce((sum, customer) => sum + customer.totalSpent, 0)
  const averageCustomerValue = totalCustomers > 0 ? totalRevenue / totalCustomers : 0

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '300px' }}>
        <CircularProgress />
      </Box>
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

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                  <BusinessIcon />
                </Avatar>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 600 }}>
                    {totalCustomers}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Customers
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Avatar sx={{ bgcolor: 'success.main', mr: 2 }}>
                  <MoneyIcon />
                </Avatar>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 600 }}>
                    ₹{totalRevenue.toLocaleString()}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Revenue
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Avatar sx={{ bgcolor: 'warning.main', mr: 2 }}>
                  <OrderIcon />
                </Avatar>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 600 }}>
                    {customers.reduce((sum, customer) => sum + customer.totalOrders, 0)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Orders
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Avatar sx={{ bgcolor: 'info.main', mr: 2 }}>
                  <TrendingUpIcon />
                </Avatar>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 600 }}>
                    ₹{averageCustomerValue.toFixed(0)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Avg Customer Value
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Filters */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Sort By</InputLabel>
              <Select
                value={sortBy}
                label="Sort By"
                onChange={(e) => setSortBy(e.target.value)}
              >
                <MenuItem value="totalSpent">Total Spent</MenuItem>
                <MenuItem value="totalOrders">Total Orders</MenuItem>
                <MenuItem value="averageOrderValue">Average Order Value</MenuItem>
                <MenuItem value="lastOrder">Last Order</MenuItem>
                <MenuItem value="name">Name</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Filter Status</InputLabel>
              <Select
                value={filterStatus}
                label="Filter Status"
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <MenuItem value="all">All Customers</MenuItem>
                <MenuItem value="Very Active">Very Active</MenuItem>
                <MenuItem value="Active">Active</MenuItem>
                <MenuItem value="Inactive">Inactive</MenuItem>
                <MenuItem value="Dormant">Dormant</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Paper>

      {customers.length === 0 ? (
        <Alert severity="info">
          No customers found yet. Customers will appear here when they place orders.
        </Alert>
      ) : (
        <Grid container spacing={3}>
          {sortedAndFilteredCustomers.map((customer) => (
            <Grid item xs={12} md={6} lg={4} key={customer.uid}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Avatar sx={{ bgcolor: 'primary.main', mr: 2, width: 48, height: 48 }}>
                      {customer.name?.charAt(0) || 'C'}
                    </Avatar>
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        {customer.name || 'Unknown Customer'}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Rating value={customer.rating || 0} readOnly size="small" />
                        <Typography variant="body2" color="text.secondary">
                          {customer.rating || 0}
                        </Typography>
                      </Box>
                    </Box>
                    <Chip 
                      label={customer.status} 
                      color={getStatusColor(customer.status)}
                      size="small"
                    />
                  </Box>

                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      <LocationIcon fontSize="small" sx={{ mr: 1, verticalAlign: 'middle' }} />
                      {customer.location || 'Location not specified'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      <BusinessIcon fontSize="small" sx={{ mr: 1, verticalAlign: 'middle' }} />
                      {customer.businessType || 'Street Food Vendor'}
                    </Typography>
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
                        ₹{customer.totalSpent.toLocaleString()}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Avg Order
                      </Typography>
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        ₹{customer.averageOrderValue.toFixed(0)}
                      </Typography>
                    </Box>
                  </Box>

                  <Typography variant="body2" color="text.secondary">
                    <CalendarIcon fontSize="small" sx={{ mr: 1, verticalAlign: 'middle' }} />
                    Last Order: {getDaysAgo(customer.lastOrder)}
                  </Typography>
                </CardContent>
                
                <CardActions>
                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={<ViewIcon />}
                    onClick={() => handleViewCustomer(customer)}
                    fullWidth
                  >
                    View Details
                  </Button>
                  <Button
                    size="small"
                    variant="contained"
                    startIcon={<SendIcon />}
                    onClick={() => handleSendMessage(customer)}
                    fullWidth
                  >
                    Contact
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

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
                      {selectedCustomer.name?.charAt(0) || 'C'}
                    </Avatar>
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        {selectedCustomer.name || 'Unknown Customer'}
                      </Typography>
                      <Rating value={selectedCustomer.rating || 0} readOnly />
                      <Typography variant="body2" color="text.secondary">
                        Customer since {formatDate(selectedCustomer.createdAt)}
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
                        secondary={selectedCustomer.location || 'Not specified'}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemAvatar>
                        <PhoneIcon />
                      </ListItemAvatar>
                      <ListItemText 
                        primary="Phone" 
                        secondary={selectedCustomer.phone || 'Not specified'}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemAvatar>
                        <EmailIcon />
                      </ListItemAvatar>
                      <ListItemText 
                        primary="Email" 
                        secondary={selectedCustomer.email || 'Not specified'}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemAvatar>
                        <BusinessIcon />
                      </ListItemAvatar>
                      <ListItemText 
                        primary="Business Type" 
                        secondary={selectedCustomer.businessType || 'Street Food Vendor'}
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
                          ₹{selectedCustomer.totalSpent.toLocaleString()}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Total Spent
                        </Typography>
                      </Paper>
                    </Grid>
                    <Grid item xs={6}>
                      <Paper sx={{ p: 2, textAlign: 'center' }}>
                        <Typography variant="h4" color="success.main" sx={{ fontWeight: 600 }}>
                          ₹{selectedCustomer.averageOrderValue.toFixed(0)}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Avg Order Value
                        </Typography>
                      </Paper>
                    </Grid>
                    <Grid item xs={6}>
                      <Paper sx={{ p: 2, textAlign: 'center' }}>
                        <Typography variant="h4" color="warning.main" sx={{ fontWeight: 600 }}>
                          {selectedCustomer.daysSinceLastOrder || 'N/A'}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Days Since Last Order
                        </Typography>
                      </Paper>
                    </Grid>
                  </Grid>
                  
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="h6" gutterBottom>
                      Customer Status
                    </Typography>
                    <Chip 
                      label={selectedCustomer.status} 
                      color={getStatusColor(selectedCustomer.status)}
                      size="medium"
                    />
                  </Box>
                </Grid>
                
                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom>
                    Recent Orders
                  </Typography>
                  {selectedCustomer.recentOrders.length > 0 ? (
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
                              <TableCell>{order.trackingId || order.id}</TableCell>
                              <TableCell>{formatDate(order.orderDate || order.createdAt)}</TableCell>
                              <TableCell>₹{order.totalAmount?.toLocaleString() || '0'}</TableCell>
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
                  ) : (
                    <Alert severity="info">
                      No recent orders found for this customer.
                    </Alert>
                  )}
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setCustomerDialog(false)}>Close</Button>
              <Button 
                variant="contained" 
                startIcon={<SendIcon />}
                onClick={() => {
                  setCustomerDialog(false)
                  handleSendMessage(selectedCustomer)
                }}
              >
                Send Message
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Message Dialog */}
      <Dialog
        open={messageDialog}
        onClose={() => setMessageDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Send Message to {selectedCustomer?.name}
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Message"
            type="text"
            fullWidth
            variant="outlined"
            multiline
            rows={4}
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            placeholder="Enter your message here..."
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setMessageDialog(false)}>Cancel</Button>
          <Button 
            onClick={handleSendMessageSubmit} 
            variant="contained"
            startIcon={<SendIcon />}
          >
            Send Message
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default SupplierCustomers 