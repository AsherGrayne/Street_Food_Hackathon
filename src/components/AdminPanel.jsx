import React, { useState } from 'react'
import {
  Box,
  Paper,
  Typography,
  Button,
  Alert,
  CircularProgress,
  Grid,
  Card,
  CardContent,
  Divider
} from '@mui/material'
import {
  Refresh as RefreshIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Assessment as StatsIcon
} from '@mui/icons-material'
import { 
  clearAllData, 
  populateDatabase, 
  getDatabaseStats 
} from '../utils/populateDatabase'
import toast from 'react-hot-toast'

const AdminPanel = () => {
  const [loading, setLoading] = useState(false)
  const [stats, setStats] = useState(null)
  const [error, setError] = useState(null)

  const handleClearData = async () => {
    if (!window.confirm('Are you sure you want to delete ALL data? This action cannot be undone.')) {
      return
    }

    try {
      setLoading(true)
      setError(null)
      
      await clearAllData()
      toast.success('All data cleared successfully!')
      setStats(null)
    } catch (error) {
      console.error('Error clearing data:', error)
      setError('Failed to clear data: ' + error.message)
      toast.error('Failed to clear data')
    } finally {
      setLoading(false)
    }
  }

  const handlePopulateDatabase = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const result = await populateDatabase()
      
      toast.success(`Database populated successfully! Created: ${result.users} users, ${result.inventory} inventory items, ${result.orders} orders, ${result.reviews} reviews`)
      
      // Refresh stats
      await handleGetStats()
    } catch (error) {
      console.error('Error populating database:', error)
      setError('Failed to populate database: ' + error.message)
      toast.error('Failed to populate database')
    } finally {
      setLoading(false)
    }
  }

  const handleGetStats = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const databaseStats = await getDatabaseStats()
      setStats(databaseStats)
    } catch (error) {
      console.error('Error getting stats:', error)
      setError('Failed to get database stats: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box sx={{ p: 3 }}>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 600 }}>
          Database Management Panel
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Manage and populate the database with sample data for testing
        </Typography>
      </Paper>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Database Actions */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Database Actions
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<AddIcon />}
                  onClick={handlePopulateDatabase}
                  disabled={loading}
                  fullWidth
                >
                  {loading ? 'Populating...' : 'Populate Database'}
                </Button>
                
                <Button
                  variant="outlined"
                  color="error"
                  startIcon={<DeleteIcon />}
                  onClick={handleClearData}
                  disabled={loading}
                  fullWidth
                >
                  {loading ? 'Clearing...' : 'Clear All Data'}
                </Button>
                
                <Button
                  variant="outlined"
                  startIcon={<StatsIcon />}
                  onClick={handleGetStats}
                  disabled={loading}
                  fullWidth
                >
                  {loading ? 'Loading...' : 'Get Database Stats'}
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Database Statistics */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Database Statistics
              </Typography>
              
              {loading ? (
                <Box display="flex" justifyContent="center" p={3}>
                  <CircularProgress />
                </Box>
              ) : stats ? (
                <Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Current data in database:
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2">Users:</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {stats.users || 0}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2">Orders:</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {stats.orders || 0}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2">Inventory Items:</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {stats.inventory || 0}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2">Reviews:</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {stats.reviews || 0}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  Click "Get Database Stats" to view current data
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Sample Data Information */}
      <Card sx={{ mt: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Sample Data Overview
          </Typography>
          <Divider sx={{ mb: 2 }} />
          
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600 }}>
                Vendors (8)
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                • Rajesh's Chaat Corner (Mumbai)<br/>
                • Lakshmi's South Indian Stall (Bangalore)<br/>
                • Ahmed's Biryani Point (Delhi)<br/>
                • Priya's Juice Corner (Mumbai)<br/>
                • Sanjay's Vada Pav (Mumbai)<br/>
                • Meera's Sweet Shop (Delhi)<br/>
                • Ramesh's Tea Stall (Mumbai)<br/>
                • Fatima's Kebab Corner (Delhi)
              </Typography>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600 }}>
                Suppliers (5)
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                • Fresh Vegetables Co. (Mumbai)<br/>
                • Spice Paradise (Delhi)<br/>
                • Dairy Fresh (Gujarat)<br/>
                • Grain Masters (Punjab)<br/>
                • Meat & Poultry Co. (Mumbai)
              </Typography>
            </Grid>
            
            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600 }}>
                Sample Data Includes:
              </Typography>
              <Typography variant="body2" color="text.secondary">
                • 8 vendors with complete profiles<br/>
                • 5 suppliers with inventory<br/>
                • 20+ inventory items across categories<br/>
                • 4 sample orders with different statuses<br/>
                • 4 sample reviews and ratings<br/>
                • Realistic pricing and quantities
              </Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Instructions */}
      <Alert severity="info" sx={{ mt: 3 }}>
        <Typography variant="body2">
          <strong>Instructions:</strong><br/>
          1. Click "Populate Database" to create sample data<br/>
          2. Use the sample accounts from SAMPLE_VENDORS.md to test<br/>
          3. All sample accounts use password: <code>test123456</code><br/>
          4. Click "Clear All Data" to reset the database
        </Typography>
      </Alert>
    </Box>
  )
}

export default AdminPanel 