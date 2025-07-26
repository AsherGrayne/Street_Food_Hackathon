import React, { useState } from 'react'
import { Routes, Route } from 'react-router-dom'
import {
  Box,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Divider
} from '@mui/material'
import {
  Search as SearchIcon,
  ShoppingCart as CartIcon,
  LocalShipping as OrdersIcon,
  Store as SuppliersIcon,
  TrendingUp as AnalyticsIcon,
  Notifications as NotificationsIcon
} from '@mui/icons-material'
import VendorSearch from '../components/vendor/VendorSearch'
import VendorOrders from '../components/vendor/VendorOrders'
import VendorSuppliers from '../components/vendor/VendorSuppliers'
import VendorAnalytics from '../components/vendor/VendorAnalytics'

const VendorDashboard = () => {
  const [activeTab, setActiveTab] = useState('search')

  const renderContent = () => {
    switch (activeTab) {
      case 'search':
        return <VendorSearch />
      case 'orders':
        return <VendorOrders />
      case 'suppliers':
        return <VendorSuppliers />
      case 'analytics':
        return <VendorAnalytics />
      default:
        return <VendorSearch />
    }
  }

  return (
    <Box>
      <Grid container spacing={3}>
        {/* Sidebar Navigation */}
        <Grid item xs={12} md={3}>
          <Paper sx={{ p: 2, height: 'fit-content' }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
              Vendor Dashboard
            </Typography>
            
            <List sx={{ mt: 2 }}>
              <ListItem 
                button 
                selected={activeTab === 'search'}
                onClick={() => setActiveTab('search')}
              >
                <ListItemAvatar>
                  <Avatar sx={{ bgcolor: activeTab === 'search' ? 'primary.main' : 'grey.300' }}>
                    <SearchIcon />
                  </Avatar>
                </ListItemAvatar>
                <ListItemText 
                  primary="Search Materials" 
                  secondary="Find suppliers and materials"
                />
              </ListItem>
              
              <ListItem 
                button 
                selected={activeTab === 'orders'}
                onClick={() => setActiveTab('orders')}
              >
                <ListItemAvatar>
                  <Avatar sx={{ bgcolor: activeTab === 'orders' ? 'primary.main' : 'grey.300' }}>
                    <CartIcon />
                  </Avatar>
                </ListItemAvatar>
                <ListItemText 
                  primary="My Orders" 
                  secondary="Track your purchases"
                />
              </ListItem>
              
              <ListItem 
                button 
                selected={activeTab === 'suppliers'}
                onClick={() => setActiveTab('suppliers')}
              >
                <ListItemAvatar>
                  <Avatar sx={{ bgcolor: activeTab === 'suppliers' ? 'primary.main' : 'grey.300' }}>
                    <SuppliersIcon />
                  </Avatar>
                </ListItemAvatar>
                <ListItemText 
                  primary="My Suppliers" 
                  secondary="Manage relationships"
                />
              </ListItem>
              
              <ListItem 
                button 
                selected={activeTab === 'analytics'}
                onClick={() => setActiveTab('analytics')}
              >
                <ListItemAvatar>
                  <Avatar sx={{ bgcolor: activeTab === 'analytics' ? 'primary.main' : 'grey.300' }}>
                    <AnalyticsIcon />
                  </Avatar>
                </ListItemAvatar>
                <ListItemText 
                  primary="Analytics" 
                  secondary="View insights"
                />
              </ListItem>
            </List>
          </Paper>
        </Grid>

        {/* Main Content */}
        <Grid item xs={12} md={9}>
          {renderContent()}
        </Grid>
      </Grid>
    </Box>
  )
}

export default VendorDashboard 