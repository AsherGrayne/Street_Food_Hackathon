import React, { useState, useEffect } from 'react'
import {
  Box,
  TextField,
  Button,
  Card,
  CardContent,
  Typography,
  Grid,
  Chip,
  Rating,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Slider,
  FormControlLabel,
  Checkbox,
  IconButton,
  Badge,
  List,
  ListItem,
  ListItemText,
  Divider,
  Alert
} from '@mui/material'
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  Compare as CompareIcon,
  Close as CloseIcon,
  LocationOn,
  Phone,
  Email,
  Star
} from '@mui/icons-material'
import { supplierService } from '../../services/firebaseService'
import { useAuth } from '../../contexts/AuthContext'
import toast from 'react-hot-toast'

const VendorSearch = () => {
  const { user } = useAuth()
  const [searchTerm, setSearchTerm] = useState('')
  const [suppliers, setSuppliers] = useState([])
  const [filteredSuppliers, setFilteredSuppliers] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedSupplier, setSelectedSupplier] = useState(null)
  const [compareList, setCompareList] = useState([])
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState({
    category: '',
    location: '',
    priceRange: [0, 1000],
    rating: 0,
    verified: false
  })

  useEffect(() => {
    loadSuppliers()
  }, [])

  const loadSuppliers = async () => {
    try {
      setLoading(true)
      const suppliersData = await supplierService.getSuppliers()
      console.log('Loaded suppliers:', suppliersData) // Debug log
      setSuppliers(suppliersData)
      setFilteredSuppliers(suppliersData)
    } catch (error) {
      console.error('Error loading suppliers:', error)
      toast.error('Failed to load suppliers')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    applyFilters()
  }, [searchTerm, filters, suppliers])

  const applyFilters = () => {
    let filtered = suppliers.filter(supplier => {
      // Search term filter
      const matchesSearch = supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (supplier.specialties && supplier.specialties.some(specialty => 
          specialty.toLowerCase().includes(searchTerm.toLowerCase())
        ))

      // Category filter
      const matchesCategory = !filters.category || 
        (supplier.specialties && supplier.specialties.includes(filters.category))

      // Location filter
      const matchesLocation = !filters.location || 
        supplier.location.toLowerCase().includes(filters.location.toLowerCase())

      // Rating filter
      const matchesRating = (supplier.rating || 0) >= filters.rating

      // Verified filter
      const matchesVerified = !filters.verified || (supplier.verified || false)

      return matchesSearch && matchesCategory && matchesLocation && matchesRating && matchesVerified
    })

    setFilteredSuppliers(filtered)
  }

  const handleAddToCompare = (supplier) => {
    if (compareList.length < 3 && !compareList.find(s => s.id === supplier.id)) {
      setCompareList([...compareList, supplier])
    }
  }

  const handleRemoveFromCompare = (supplierId) => {
    setCompareList(compareList.filter(s => s.id !== supplierId))
  }

  const handleSupplierClick = async (supplier) => {
    try {
      const fullSupplier = await supplierService.getSupplierById(supplier.id)
      setSelectedSupplier(fullSupplier)
    } catch (error) {
      console.error('Error fetching supplier details:', error)
      setSelectedSupplier(supplier)
    }
  }

  const resetFilters = () => {
    setFilters({
      category: '',
      location: '',
      priceRange: [0, 1000],
      rating: 0,
      verified: false
    })
    setSearchTerm('')
  }

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <Typography>Loading suppliers...</Typography>
      </Box>
    )
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Find Raw Material Suppliers
      </Typography>
      
      {/* Search and Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                placeholder="Search suppliers, materials, or categories..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />
                }}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<FilterIcon />}
                onClick={() => setShowFilters(!showFilters)}
              >
                Filters
              </Button>
            </Grid>
            <Grid item xs={12} md={3}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<CompareIcon />}
                onClick={() => setCompareList([])}
                disabled={compareList.length === 0}
              >
                Clear Compare ({compareList.length})
              </Button>
            </Grid>
          </Grid>

          {showFilters && (
            <Box sx={{ mt: 3 }}>
              <Grid container spacing={2}>
                <Grid item xs={12} md={3}>
                  <FormControl fullWidth>
                    <InputLabel>Category</InputLabel>
                    <Select
                      value={filters.category}
                      onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                    >
                      <MenuItem value="">All Categories</MenuItem>
                      <MenuItem value="Vegetables">Vegetables</MenuItem>
                      <MenuItem value="Fruits">Fruits</MenuItem>
                      <MenuItem value="Grains">Grains</MenuItem>
                      <MenuItem value="Spices">Spices</MenuItem>
                      <MenuItem value="Dairy">Dairy</MenuItem>
                      <MenuItem value="Meat">Meat</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={3}>
                  <TextField
                    fullWidth
                    label="Location"
                    value={filters.location}
                    onChange={(e) => setFilters({ ...filters, location: e.target.value })}
                    placeholder="e.g., Mumbai, Delhi"
                  />
                </Grid>
                <Grid item xs={12} md={3}>
                  <Typography gutterBottom>Min Rating</Typography>
                  <Rating
                    value={filters.rating}
                    onChange={(event, newValue) => setFilters({ ...filters, rating: newValue })}
                  />
                </Grid>
                <Grid item xs={12} md={3}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={filters.verified}
                        onChange={(e) => setFilters({ ...filters, verified: e.target.checked })}
                      />
                    }
                    label="Verified Only"
                  />
                </Grid>
              </Grid>
              <Button
                variant="outlined"
                onClick={resetFilters}
                sx={{ mt: 2 }}
              >
                Reset Filters
              </Button>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Results */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={compareList.length > 0 ? 8 : 12}>
          <Typography variant="h6" gutterBottom>
            {filteredSuppliers.length} Suppliers Found
          </Typography>
          
          {filteredSuppliers.length === 0 ? (
            <Alert severity="info">
              {suppliers.length === 0 
                ? "No suppliers found. Suppliers need to register and add inventory to appear here."
                : "No suppliers found matching your criteria. Try adjusting your search or filters."
              }
            </Alert>
          ) : (
            <Grid container spacing={2}>
              {filteredSuppliers.map((supplier) => (
                <Grid item xs={12} key={supplier.id}>
                  <Card 
                    sx={{ 
                      cursor: 'pointer',
                      '&:hover': { boxShadow: 3 }
                    }}
                    onClick={() => handleSupplierClick(supplier)}
                  >
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="h6" gutterBottom>
                            {supplier.name}
                            {supplier.verified && (
                              <Chip 
                                label="Verified" 
                                color="success" 
                                size="small" 
                                sx={{ ml: 1 }} 
                              />
                            )}
                          </Typography>
                          
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                            <Rating value={supplier.rating} readOnly size="small" />
                            <Typography variant="body2" sx={{ ml: 1 }}>
                              ({supplier.rating})
                            </Typography>
                          </Box>
                          
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                            <LocationOn sx={{ fontSize: 16, mr: 0.5, color: 'text.secondary' }} />
                            <Typography variant="body2" color="text.secondary">
                              {supplier.location}
                            </Typography>
                          </Box>
                          
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                            <Phone sx={{ fontSize: 16, mr: 0.5, color: 'text.secondary' }} />
                            <Typography variant="body2" color="text.secondary">
                              {supplier.phone}
                            </Typography>
                          </Box>
                          
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                            {supplier.specialties?.map((specialty) => (
                              <Chip 
                                key={specialty} 
                                label={specialty} 
                                size="small" 
                                variant="outlined" 
                              />
                            )) || (
                              <Chip 
                                label="General Supplier" 
                                size="small" 
                                variant="outlined" 
                                color="default"
                              />
                            )}
                          </Box>
                        </Box>
                        
                        <Button
                          variant="outlined"
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleAddToCompare(supplier)
                          }}
                          disabled={compareList.length >= 3 && !compareList.find(s => s.id === supplier.id)}
                        >
                          {compareList.find(s => s.id === supplier.id) ? 'Added' : 'Compare'}
                        </Button>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </Grid>

        {/* Comparison Panel */}
        {compareList.length > 0 && (
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Compare Suppliers ({compareList.length}/3)
                </Typography>
                
                <List>
                  {compareList.map((supplier, index) => (
                    <React.Fragment key={supplier.id}>
                      <ListItem>
                        <ListItemText
                          primary={supplier.name}
                          secondary={
                            <Box>
                              <Rating value={supplier.rating} readOnly size="small" />
                              <Typography variant="body2" color="text.secondary">
                                {supplier.location}
                              </Typography>
                            </Box>
                          }
                        />
                        <IconButton
                          size="small"
                          onClick={() => handleRemoveFromCompare(supplier.id)}
                        >
                          <CloseIcon />
                        </IconButton>
                      </ListItem>
                      {index < compareList.length - 1 && <Divider />}
                    </React.Fragment>
                  ))}
                </List>
                
                <Button
                  fullWidth
                  variant="contained"
                  onClick={() => setCompareList([])}
                >
                  Clear All
                </Button>
              </CardContent>
            </Card>
          </Grid>
        )}
      </Grid>

      {/* Supplier Details Dialog */}
      <Dialog
        open={!!selectedSupplier}
        onClose={() => setSelectedSupplier(null)}
        maxWidth="md"
        fullWidth
      >
        {selectedSupplier && (
          <>
            <DialogTitle>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6">{selectedSupplier.name}</Typography>
                <IconButton onClick={() => setSelectedSupplier(null)}>
                  <CloseIcon />
                </IconButton>
              </Box>
            </DialogTitle>
            <DialogContent>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" gutterBottom>Contact Information</Typography>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      <Email sx={{ fontSize: 16, mr: 0.5, verticalAlign: 'middle' }} />
                      {selectedSupplier.email}
                    </Typography>
                  </Box>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      <Phone sx={{ fontSize: 16, mr: 0.5, verticalAlign: 'middle' }} />
                      {selectedSupplier.phone}
                    </Typography>
                  </Box>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      <LocationOn sx={{ fontSize: 16, mr: 0.5, verticalAlign: 'middle' }} />
                      {selectedSupplier.location}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" gutterBottom>Business Details</Typography>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2">
                      <strong>Business Type:</strong> {selectedSupplier.businessType}
                    </Typography>
                  </Box>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2">
                      <strong>Rating:</strong> 
                      <Rating value={selectedSupplier.rating} readOnly size="small" sx={{ ml: 1 }} />
                      ({selectedSupplier.rating})
                    </Typography>
                  </Box>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2">
                      <strong>Verified:</strong> {selectedSupplier.verified ? 'Yes' : 'No'}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom>Specialties</Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {selectedSupplier.specialties?.map((specialty) => (
                      <Chip key={specialty} label={specialty} color="primary" />
                    ))}
                  </Box>
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setSelectedSupplier(null)}>Close</Button>
              <Button 
                variant="contained"
                onClick={() => {
                  handleAddToCompare(selectedSupplier)
                  setSelectedSupplier(null)
                }}
                disabled={compareList.length >= 3 && !compareList.find(s => s.id === selectedSupplier.id)}
              >
                Add to Compare
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  )
}

export default VendorSearch 