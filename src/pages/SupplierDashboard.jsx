import React, { useState } from 'react'
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
  Inventory as InventoryIcon,
  ShoppingCart as OrdersIcon,
  People as CustomersIcon,
  TrendingUp as AnalyticsIcon,
  Add as AddIcon,
  Notifications as NotificationsIcon
} from '@mui/icons-material'
import SupplierInventory from '../components/supplier/SupplierInventory'
import SupplierOrders from '../components/supplier/SupplierOrders'
import SupplierCustomers from '../components/supplier/SupplierCustomers'
import SupplierAnalytics from '../components/supplier/SupplierAnalytics'

const SupplierDashboard = () => {
  const [activeTab, setActiveTab] = useState('inventory')

  const renderContent = () => {
    switch (activeTab) {
      case 'inventory':
        return <SupplierInventory />
      case 'orders':
        return <SupplierOrders />
      case 'customers':
        return <SupplierCustomers />
      case 'analytics':
        return <SupplierAnalytics />
      default:
        return <SupplierInventory />
    }
  }

  return (
    <Box>
      <Grid container spacing={3}>
        {/* Sidebar Navigation */}
        <Grid item xs={12} md={3}>
          <Paper sx={{ p: 2, height: 'fit-content' }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
              Supplier Dashboard
            </Typography>
            
            <List sx={{ mt: 2 }}>
              <ListItem 
                button 
                selected={activeTab === 'inventory'}
                onClick={() => setActiveTab('inventory')}
              >
                <ListItemAvatar>
                  <Avatar sx={{ bgcolor: activeTab === 'inventory' ? 'primary.main' : 'grey.300' }}>
                    <InventoryIcon />
                  </Avatar>
                </ListItemAvatar>
                <ListItemText 
                  primary="Inventory Management" 
                  secondary="Manage your materials"
                />
              </ListItem>
              
              <ListItem 
                button 
                selected={activeTab === 'orders'}
                onClick={() => setActiveTab('orders')}
              >
                <ListItemAvatar>
                  <Avatar sx={{ bgcolor: activeTab === 'orders' ? 'primary.main' : 'grey.300' }}>
                    <OrdersIcon />
                  </Avatar>
                </ListItemAvatar>
                <ListItemText 
                  primary="Orders" 
                  secondary="Manage incoming orders"
                />
              </ListItem>
              
              <ListItem 
                button 
                selected={activeTab === 'customers'}
                onClick={() => setActiveTab('customers')}
              >
                <ListItemAvatar>
                  <Avatar sx={{ bgcolor: activeTab === 'customers' ? 'primary.main' : 'grey.300' }}>
                    <CustomersIcon />
                  </Avatar>
                </ListItemAvatar>
                <ListItemText 
                  primary="Customers" 
                  secondary="View vendor relationships"
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
                  secondary="Business insights"
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

export default SupplierDashboard 