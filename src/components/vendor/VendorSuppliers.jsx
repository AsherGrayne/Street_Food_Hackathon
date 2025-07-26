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
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from '@mui/material'
import {
  Phone as PhoneIcon,
  Email as EmailIcon,
  LocationOn as LocationIcon,
  Star as StarIcon,
  Add as AddIcon,
  Edit as EditIcon,
  ShoppingCart as BuyIcon,
  Close as CloseIcon
} from '@mui/icons-material'
import { supplierService, reviewService, orderService } from '../../services/firebaseService'
import { useAuth } from '../../contexts/AuthContext'
import SharedBuyDialog from './SharedBuyDialog'
import toast from 'react-hot-toast'

const VendorSuppliers = () => {
  const { user } = useAuth()
  const [trustedSuppliers, setTrustedSuppliers] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedSupplier, setSelectedSupplier] = useState(null)
  const [supplierDialog, setSupplierDialog] = useState(false)
  const [reviewDialog, setReviewDialog] = useState(false)
  const [buyDialog, setBuyDialog] = useState(false)
  const [selectedSupplierForBuy, setSelectedSupplierForBuy] = useState(null)
  const [reviewData, setReviewData] = useState({
    rating: 5,
    comment: ''
  })

  useEffect(() => {
    loadTrustedSuppliers()
  }, [user])

  const loadTrustedSuppliers = async () => {
    if (!user) return
    
    try {
      setLoading(true)
      
      // Get vendor's order history
      const vendorOrders = await orderService.getVendorOrders(user.uid)
      
      // Get unique suppliers from orders
      const supplierIds = [...new Set(vendorOrders.map(order => order.supplierId))]
      
      // Get supplier details for each unique supplier
      const suppliersWithStats = await Promise.all(
        supplierIds.map(async (supplierId) => {
          const supplier = await supplierService.getSupplierById(supplierId)
          if (!supplier) return null
          
          // Calculate statistics from orders
          const supplierOrders = vendorOrders.filter(order => order.supplierId === supplierId)
          const totalOrders = supplierOrders.length
          const totalSpent = supplierOrders.reduce((sum, order) => sum + (order.totalAmount || 0), 0)
          const lastOrder = supplierOrders.length > 0 
            ? new Date(supplierOrders[0].createdAt?.toDate() || supplierOrders[0].orderDate).toLocaleDateString()
            : 'No orders yet'
          
          return {
            ...supplier,
            totalOrders,
            totalSpent,
            lastOrder,
            orderHistory: supplierOrders
          }
        })
      )
      
      // Filter out null values and sort by total spent
      const validSuppliers = suppliersWithStats
        .filter(supplier => supplier !== null)
        .sort((a, b) => b.totalSpent - a.totalSpent)
      
      setTrustedSuppliers(validSuppliers)
    } catch (error) {
      console.error('Error loading trusted suppliers:', error)
      toast.error('Failed to load trusted suppliers')
    } finally {
      setLoading(false)
    }
  }

  const handleViewSupplier = (supplier) => {
    setSelectedSupplier(supplier)
    setSupplierDialog(true)
  }

  const handleAddReview = (supplier) => {
    setSelectedSupplier(supplier)
    setReviewDialog(true)
  }

  const handleSubmitReview = async () => {
    if (!selectedSupplier || !reviewData.comment.trim()) {
      toast.error('Please provide a review comment')
      return
    }

    try {
      const reviewDataToSubmit = {
        vendorId: user.uid,
        vendorName: user.displayName || user.email,
        supplierId: selectedSupplier.id,
        supplierName: selectedSupplier.name,
        rating: reviewData.rating,
        comment: reviewData.comment,
        createdAt: new Date()
      }

      await reviewService.addReview(reviewDataToSubmit)
      toast.success('Review submitted successfully!')
      setReviewDialog(false)
      setReviewData({ rating: 5, comment: '' })
      setSelectedSupplier(null)
      
      // Refresh the trusted suppliers list to show updated ratings
      await loadTrustedSuppliers()
    } catch (error) {
      console.error('Error submitting review:', error)
      toast.error('Failed to submit review')
    }
  }

  const handleBuyFromSupplier = (supplier) => {
    setSelectedSupplierForBuy(supplier)
    setBuyDialog(true)
  }

  const handleOrderPlaced = () => {
    // Refresh the trusted suppliers list to show updated statistics
    loadTrustedSuppliers()
  }

  return (
    <Box>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
          My Trusted Suppliers
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Manage your relationships with suppliers you've ordered from
        </Typography>
      </Paper>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      ) : trustedSuppliers.length === 0 ? (
        <Alert severity="info" sx={{ mx: 3 }}>
          You haven't placed any orders yet. Start by searching for suppliers and placing your first order!
        </Alert>
      ) : (
        <Grid container spacing={3}>
          {trustedSuppliers.map((supplier) => (
            <Grid item xs={12} md={6} lg={4} key={supplier.id}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                      {supplier.name?.charAt(0) || 'S'}
                    </Avatar>
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        {supplier.name}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Rating value={supplier.rating || 0} readOnly size="small" />
                        <Typography variant="body2" color="text.secondary">
                          {supplier.rating || 0} • {supplier.totalReviews || 0} reviews
                        </Typography>
                      </Box>
                    </Box>
                    <Chip 
                      label="Trusted" 
                      color="success" 
                      size="small"
                    />
                  </Box>

                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      <LocationIcon fontSize="small" sx={{ mr: 1, verticalAlign: 'middle' }} />
                      {supplier.location || 'Location not specified'}
                    </Typography>
                  </Box>

                  {supplier.specialties && supplier.specialties.length > 0 && (
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="subtitle2" gutterBottom>
                        Specialties:
                      </Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {supplier.specialties.map((specialty, index) => (
                          <Chip 
                            key={index} 
                            label={specialty} 
                            size="small" 
                            variant="outlined"
                          />
                        ))}
                      </Box>
                    </Box>
                  )}

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Total Orders
                      </Typography>
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        {supplier.totalOrders}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Total Spent
                      </Typography>
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        ₹{supplier.totalSpent.toLocaleString()}
                      </Typography>
                    </Box>
                  </Box>

                  <Typography variant="body2" color="text.secondary">
                    Last Order: {supplier.lastOrder}
                  </Typography>
                </CardContent>
                
                <CardActions>
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() => handleViewSupplier(supplier)}
                  >
                    View Details
                  </Button>
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() => handleAddReview(supplier)}
                  >
                    Add Review
                  </Button>
                  <Button
                    size="small"
                    variant="contained"
                    startIcon={<BuyIcon />}
                    onClick={() => handleBuyFromSupplier(supplier)}
                  >
                    Order Again
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Supplier Details Dialog */}
      <Dialog
        open={supplierDialog}
        onClose={() => setSupplierDialog(false)}
        maxWidth="md"
        fullWidth
      >
        {selectedSupplier && (
          <>
            <DialogTitle>
              Supplier Details - {selectedSupplier.name}
            </DialogTitle>
            <DialogContent>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Avatar sx={{ bgcolor: 'primary.main', mr: 2, width: 64, height: 64 }}>
                      {selectedSupplier.name?.charAt(0) || 'S'}
                    </Avatar>
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        {selectedSupplier.name}
                      </Typography>
                      <Rating value={selectedSupplier.rating || 0} readOnly />
                      <Typography variant="body2" color="text.secondary">
                        {selectedSupplier.rating || 0} • {selectedSupplier.totalReviews || 0} reviews
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Member since {selectedSupplier.createdAt ? new Date(selectedSupplier.createdAt.toDate()).toLocaleDateString() : 'Unknown'}
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
                        secondary={selectedSupplier.location || 'Location not specified'}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemAvatar>
                        <PhoneIcon />
                      </ListItemAvatar>
                      <ListItemText 
                        primary="Phone" 
                        secondary={selectedSupplier.phone || 'Phone not specified'}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemAvatar>
                        <EmailIcon />
                      </ListItemAvatar>
                      <ListItemText 
                        primary="Email" 
                        secondary={selectedSupplier.email || 'Email not specified'}
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
                          {selectedSupplier.totalOrders}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Total Orders
                        </Typography>
                      </Paper>
                    </Grid>
                    <Grid item xs={6}>
                      <Paper sx={{ p: 2, textAlign: 'center' }}>
                        <Typography variant="h4" color="primary" sx={{ fontWeight: 600 }}>
                          ₹{selectedSupplier.totalSpent.toLocaleString()}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Total Spent
                        </Typography>
                      </Paper>
                    </Grid>
                  </Grid>
                  
                  {selectedSupplier.specialties && selectedSupplier.specialties.length > 0 && (
                    <>
                      <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                        Specialties
                      </Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                        {selectedSupplier.specialties.map((specialty, index) => (
                          <Chip 
                            key={index} 
                            label={specialty} 
                            color="primary" 
                            variant="outlined"
                          />
                        ))}
                      </Box>
                    </>
                  )}

                  {selectedSupplier.orderHistory && selectedSupplier.orderHistory.length > 0 && (
                    <>
                      <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                        Recent Orders
                      </Typography>
                      <List dense>
                        {selectedSupplier.orderHistory.slice(0, 3).map((order, index) => (
                          <ListItem key={index}>
                            <ListItemText
                              primary={`Order #${order.id}`}
                              secondary={`₹${order.totalAmount} - ${order.status}`}
                            />
                          </ListItem>
                        ))}
                      </List>
                    </>
                  )}
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setSupplierDialog(false)}>Close</Button>
              <Button 
                variant="contained"
                startIcon={<BuyIcon />}
                onClick={() => {
                  handleBuyFromSupplier(selectedSupplier)
                  setSupplierDialog(false)
                }}
              >
                Order Again
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Review Dialog */}
      <Dialog
        open={reviewDialog}
        onClose={() => setReviewDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Add Review for {selectedSupplier?.name}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              Rating
            </Typography>
            <Rating
              value={reviewData.rating}
              onChange={(event, newValue) => {
                setReviewData({ ...reviewData, rating: newValue })
              }}
              size="large"
            />
            
            <TextField
              fullWidth
              multiline
              rows={4}
              label="Your Review"
              value={reviewData.comment}
              onChange={(e) => setReviewData({ ...reviewData, comment: e.target.value })}
              sx={{ mt: 2 }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setReviewDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSubmitReview}>
            Submit Review
          </Button>
        </DialogActions>
      </Dialog>

      {/* Shared Buy Dialog */}
      <SharedBuyDialog
        open={buyDialog}
        onClose={() => setBuyDialog(false)}
        supplier={selectedSupplierForBuy}
        onOrderPlaced={handleOrderPlaced}
      />
    </Box>
  )
}

export default VendorSuppliers 