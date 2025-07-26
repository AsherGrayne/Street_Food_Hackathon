import React, { useState, useEffect } from 'react'
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Chip,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Rating
} from '@mui/material'
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Inventory as InventoryIcon,
  Close as CloseIcon
} from '@mui/icons-material'
import { inventoryService } from '../../services/firebaseService'
import { useAuth } from '../../contexts/AuthContext'
import toast from 'react-hot-toast'

const SupplierInventory = () => {
  const { user } = useAuth()
  const [inventory, setInventory] = useState([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    price: '',
    unit: 'kg',
    stock: '',
    minStock: '',
    quality: 'Standard',
    description: ''
  })

  const categories = [
    'Vegetables', 'Fruits', 'Grains', 'Spices', 'Dairy', 'Meat', 'Herbs', 'Other'
  ]

  const units = ['kg', 'g', 'pieces', 'dozen', 'liters', 'packets']

  const qualities = ['Standard', 'Premium', 'Organic', 'Grade A']

  useEffect(() => {
    loadInventory()
  }, [])

  const loadInventory = async () => {
    try {
      setLoading(true)
      const inventoryData = await inventoryService.getSupplierInventory(user.uid)
      setInventory(inventoryData)
    } catch (error) {
      console.error('Error loading inventory:', error)
      toast.error('Failed to load inventory')
    } finally {
      setLoading(false)
    }
  }

  const handleOpenDialog = (item = null) => {
    if (item) {
      setEditingItem(item)
      setFormData({
        name: item.name,
        category: item.category,
        price: item.price.toString(),
        unit: item.unit,
        stock: item.stock.toString(),
        minStock: item.minStock.toString(),
        quality: item.quality,
        description: item.description
      })
    } else {
      setEditingItem(null)
      setFormData({
        name: '',
        category: '',
        price: '',
        unit: 'kg',
        stock: '',
        minStock: '',
        quality: 'Standard',
        description: ''
      })
    }
    setDialogOpen(true)
  }

  const handleCloseDialog = () => {
    setDialogOpen(false)
    setEditingItem(null)
    setFormData({
      name: '',
      category: '',
      price: '',
      unit: 'kg',
      stock: '',
      minStock: '',
      quality: 'Standard',
      description: ''
    })
  }

  const handleSubmit = async () => {
    try {
      const itemData = {
        ...formData,
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock),
        minStock: parseInt(formData.minStock),
        supplierId: user.uid,
        updatedAt: new Date()
      }

      if (editingItem) {
        await inventoryService.updateInventoryItem(editingItem.id, itemData)
        toast.success('Inventory item updated successfully')
      } else {
        await inventoryService.addInventoryItem(itemData)
        toast.success('Inventory item added successfully')
      }

      handleCloseDialog()
      loadInventory()
    } catch (error) {
      console.error('Error saving inventory item:', error)
      toast.error('Failed to save inventory item')
    }
  }

  const handleDelete = async (itemId) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      try {
        await inventoryService.deleteInventoryItem(itemId)
        toast.success('Inventory item deleted successfully')
        loadInventory()
      } catch (error) {
        console.error('Error deleting inventory item:', error)
        toast.error('Failed to delete inventory item')
      }
    }
  }

  const getStockStatus = (stock, minStock) => {
    if (stock <= 0) return { status: 'Out of Stock', color: 'error' }
    if (stock <= minStock) return { status: 'Low Stock', color: 'warning' }
    return { status: 'In Stock', color: 'success' }
  }

  const getQualityColor = (quality) => {
    switch (quality) {
      case 'Premium': return 'primary'
      case 'Organic': return 'success'
      case 'Grade A': return 'secondary'
      default: return 'default'
    }
  }

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <Typography>Loading inventory...</Typography>
      </Box>
    )
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          Inventory Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Add Item
        </Button>
      </Box>

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Items
              </Typography>
              <Typography variant="h4">
                {inventory.length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Low Stock Items
              </Typography>
              <Typography variant="h4" color="warning.main">
                {inventory.filter(item => item.stock <= item.minStock).length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Out of Stock
              </Typography>
              <Typography variant="h4" color="error.main">
                {inventory.filter(item => item.stock <= 0).length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Value
              </Typography>
              <Typography variant="h4" color="primary.main">
                ₹{inventory.reduce((sum, item) => sum + (item.price * item.stock), 0).toLocaleString()}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Inventory Table */}
      {inventory.length === 0 ? (
        <Alert severity="info">
          No inventory items found. Add your first item to get started.
        </Alert>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Item Name</TableCell>
                <TableCell>Category</TableCell>
                <TableCell>Price</TableCell>
                <TableCell>Stock</TableCell>
                <TableCell>Quality</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {inventory.map((item) => {
                const stockStatus = getStockStatus(item.stock, item.minStock)
                return (
                  <TableRow key={item.id}>
                    <TableCell>
                      <Box>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                          {item.name}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          {item.description}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip label={item.category} size="small" />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        ₹{item.price}/{item.unit}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {item.stock} {item.unit}
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        Min: {item.minStock}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={item.quality} 
                        size="small" 
                        color={getQualityColor(item.quality)}
                      />
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={stockStatus.status} 
                        size="small" 
                        color={stockStatus.color}
                      />
                    </TableCell>
                    <TableCell>
                      <IconButton
                        size="small"
                        onClick={() => handleOpenDialog(item)}
                        color="primary"
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleDelete(item.id)}
                        color="error"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">
              {editingItem ? 'Edit Inventory Item' : 'Add New Item'}
            </Typography>
            <IconButton onClick={handleCloseDialog}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Item Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth required>
                <InputLabel>Category</InputLabel>
                <Select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                >
                  {categories.map(category => (
                    <MenuItem key={category} value={category}>{category}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Price"
                type="number"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                required
                InputProps={{
                  startAdornment: <Typography sx={{ mr: 1 }}>₹</Typography>
                }}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <FormControl fullWidth required>
                <InputLabel>Unit</InputLabel>
                <Select
                  value={formData.unit}
                  onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                >
                  {units.map(unit => (
                    <MenuItem key={unit} value={unit}>{unit}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={4}>
              <FormControl fullWidth required>
                <InputLabel>Quality</InputLabel>
                <Select
                  value={formData.quality}
                  onChange={(e) => setFormData({ ...formData, quality: e.target.value })}
                >
                  {qualities.map(quality => (
                    <MenuItem key={quality} value={quality}>{quality}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Current Stock"
                type="number"
                value={formData.stock}
                onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Minimum Stock"
                type="number"
                value={formData.minStock}
                onChange={(e) => setFormData({ ...formData, minStock: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                multiline
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe the item, its features, or any special notes..."
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button 
            variant="contained" 
            onClick={handleSubmit}
            disabled={!formData.name || !formData.category || !formData.price || !formData.stock}
          >
            {editingItem ? 'Update' : 'Add'} Item
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default SupplierInventory 