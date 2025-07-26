import React, { useState, useEffect } from 'react'
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Chip,
  LinearProgress,
  CircularProgress,
  Alert
} from '@mui/material'
import {
  TrendingUp as TrendingUpIcon,
  ShoppingCart as CartIcon,
  People as CustomersIcon,
  AttachMoney as MoneyIcon,
  Star as StarIcon,
  Inventory as InventoryIcon
} from '@mui/icons-material'
import { orderService, inventoryService, userService } from '../../services/firebaseService'
import { useAuth } from '../../contexts/AuthContext'
import toast from 'react-hot-toast'

const SupplierAnalytics = () => {
  const { user } = useAuth()
  const [analytics, setAnalytics] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    averageOrderValue: 0,
    totalCustomers: 0,
    topCustomers: [],
    monthlyRevenue: [],
    materialSales: [],
    recentTrends: []
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadAnalytics()
  }, [user])

  const loadAnalytics = async () => {
    if (!user) return
    
    try {
      setLoading(true)
      const orders = await orderService.getSupplierOrders(user.uid)
      const inventory = await inventoryService.getSupplierInventory(user.uid)
      
      // Calculate analytics from real data
      const totalRevenue = orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0)
      const totalOrders = orders.length
      const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0
      
      // Get unique customers
      const customerIds = [...new Set(orders.map(order => order.vendorId))]
      const totalCustomers = customerIds.length
      
      // Calculate top customers
      const customerStats = {}
      for (const customerId of customerIds) {
        try {
          const customerProfile = await userService.getUserProfile(customerId)
          if (customerProfile) {
            const customerOrders = orders.filter(order => order.vendorId === customerId)
            const totalSpent = customerOrders.reduce((sum, order) => sum + (order.totalAmount || 0), 0)
            customerStats[customerId] = {
              name: customerProfile.name || customerProfile.email,
              orders: customerOrders.length,
              spent: totalSpent,
              rating: customerProfile.rating || 0
            }
          }
        } catch (error) {
          console.error('Error loading customer profile:', error)
        }
      }
      
      const topCustomers = Object.values(customerStats)
        .sort((a, b) => b.spent - a.spent)
        .slice(0, 3)
      
      setAnalytics({
        totalRevenue,
        totalOrders,
        averageOrderValue,
        totalCustomers,
        topCustomers,
        monthlyRevenue: [], // Would need date-based calculation
        materialSales: [], // Would need inventory data
        recentTrends: [
          { trend: 'Total orders received', change: `${totalOrders}`, positive: true },
          { trend: 'Total revenue generated', change: `₹${totalRevenue.toLocaleString()}`, positive: true },
          { trend: 'Average order value', change: `₹${averageOrderValue.toFixed(0)}`, positive: true },
          { trend: 'Total customers served', change: `${totalCustomers}`, positive: true }
        ]
      })
    } catch (error) {
      console.error('Error loading analytics:', error)
      toast.error('Failed to load analytics')
    } finally {
      setLoading(false)
    }
  }

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
          Business Analytics
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Track your business performance and growth metrics
        </Typography>
      </Paper>

      {/* Key Metrics */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                  <MoneyIcon />
                </Avatar>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 600 }}>
                    ₹{analytics.totalRevenue.toLocaleString()}
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
                <Avatar sx={{ bgcolor: 'secondary.main', mr: 2 }}>
                  <CartIcon />
                </Avatar>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 600 }}>
                    {analytics.totalOrders}
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
                <Avatar sx={{ bgcolor: 'success.main', mr: 2 }}>
                  <TrendingUpIcon />
                </Avatar>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 600 }}>
                    ₹{analytics.averageOrderValue}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Avg Order Value
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
                  <CustomersIcon />
                </Avatar>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 600 }}>
                    {analytics.totalCustomers}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Active Customers
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Top Customers */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                Top Customers
              </Typography>
              <List>
                {analytics.topCustomers.map((customer, index) => (
                  <ListItem key={index} sx={{ px: 0 }}>
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: 'primary.main' }}>
                        {customer.name.charAt(0)}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={customer.name}
                      secondary={
                        <Box>
                          <Typography variant="body2">
                            {customer.orders} orders • ₹{customer.spent.toLocaleString()} spent
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                            <StarIcon fontSize="small" color="warning" />
                            <Typography variant="body2" color="text.secondary">
                              {customer.rating}
                            </Typography>
                          </Box>
                        </Box>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Material Sales */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                Sales by Material
              </Typography>
              {analytics.materialSales.map((material, index) => (
                <Box key={index} sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {material.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      ₹{material.revenue.toLocaleString()}
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={material.percentage}
                    sx={{ height: 8, borderRadius: 4 }}
                  />
                  <Typography variant="caption" color="text.secondary">
                    {material.percentage}% of total revenue
                  </Typography>
                </Box>
              ))}
            </CardContent>
          </Card>
        </Grid>

        {/* Recent Trends */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                Recent Trends & Insights
              </Typography>
              <Grid container spacing={2}>
                {analytics.recentTrends.map((trend, index) => (
                  <Grid item xs={12} sm={6} md={3} key={index}>
                    <Box sx={{ p: 2, border: 1, borderColor: 'divider', borderRadius: 1 }}>
                      <Typography variant="body2" gutterBottom>
                        {trend.trend}
                      </Typography>
                      <Chip
                        label={trend.change}
                        color={trend.positive ? 'success' : 'error'}
                        size="small"
                        icon={trend.positive ? <TrendingUpIcon /> : null}
                      />
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Monthly Revenue Chart */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                Monthly Revenue Trend
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'end', gap: 2, height: 200, mt: 2 }}>
                {analytics.monthlyRevenue.map((month, index) => (
                  <Box key={index} sx={{ flex: 1, textAlign: 'center' }}>
                    <Box
                      sx={{
                        height: `${(month.revenue / 6000) * 150}px`,
                        bgcolor: 'primary.main',
                        borderRadius: 1,
                        mb: 1,
                        minHeight: 20
                      }}
                    />
                    <Typography variant="caption" color="text.secondary">
                      {month.month}
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      ₹{month.revenue}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  )
}

export default SupplierAnalytics 