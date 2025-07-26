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
  CircularProgress
} from '@mui/material'
import {
  Phone as PhoneIcon,
  Email as EmailIcon,
  LocationOn as LocationIcon,
  Star as StarIcon,
  Add as AddIcon,
  Edit as EditIcon
} from '@mui/icons-material'
import { supplierService, reviewService } from '../../services/firebaseService'
import { useAuth } from '../../contexts/AuthContext'
import toast from 'react-hot-toast'

const VendorSuppliers = () => {
  const { user } = useAuth()
  const [trustedSuppliers, setTrustedSuppliers] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedSupplier, setSelectedSupplier] = useState(null)
  const [supplierDialog, setSupplierDialog] = useState(false)
  const [reviewDialog, setReviewDialog] = useState(false)
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
      // For now, we'll show all suppliers as trusted suppliers
      // In a real app, you'd have a separate collection for trusted suppliers
      const suppliersData = await supplierService.getSuppliers()
      setTrustedSuppliers(suppliersData)
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

  const handleSubmitReview = () => {
    // In a real app, this would submit to backend
    console.log('Review submitted:', reviewData)
    setReviewDialog(false)
    setReviewData({ rating: 5, comment: '' })
  }

  return (
    <Box>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
          My Trusted Suppliers
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Manage your relationships with verified suppliers
        </Typography>
      </Paper>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      ) : trustedSuppliers.length === 0 ? (
        <Alert severity="info" sx={{ mx: 3 }}>
          You haven't added any trusted suppliers yet. Add one to get started!
        </Alert>
      ) : (
        <Grid container spacing={3}>
          {trustedSuppliers.map((supplier) => (
            <Grid item xs={12} md={6} lg={4} key={supplier.id}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                      {supplier.name.charAt(0)}
                    </Avatar>
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        {supplier.name}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Rating value={supplier.rating} readOnly size="small" />
                        <Typography variant="body2" color="text.secondary">
                          {supplier.rating}
                        </Typography>
                      </Box>
                    </Box>
                    <Chip 
                      label={supplier.status} 
                      color="success" 
                      size="small"
                    />
                  </Box>

                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      <LocationIcon fontSize="small" sx={{ mr: 1, verticalAlign: 'middle' }} />
                      {supplier.location}
                    </Typography>
                  </Box>

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
                        ₹{supplier.totalSpent}
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
                  >
                    Order Now
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
                      {selectedSupplier.name.charAt(0)}
                    </Avatar>
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        {selectedSupplier.name}
                      </Typography>
                      <Rating value={selectedSupplier.rating} readOnly />
                      <Typography variant="body2" color="text.secondary">
                        Member since {selectedSupplier.joinedDate}
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
                        secondary={selectedSupplier.location}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemAvatar>
                        <PhoneIcon />
                      </ListItemAvatar>
                      <ListItemText 
                        primary="Phone" 
                        secondary={selectedSupplier.phone}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemAvatar>
                        <EmailIcon />
                      </ListItemAvatar>
                      <ListItemText 
                        primary="Email" 
                        secondary={selectedSupplier.email}
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
                          ₹{selectedSupplier.totalSpent}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Total Spent
                        </Typography>
                      </Paper>
                    </Grid>
                  </Grid>
                  
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
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setSupplierDialog(false)}>Close</Button>
              <Button variant="contained">Place Order</Button>
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
    </Box>
  )
}

export default VendorSuppliers 