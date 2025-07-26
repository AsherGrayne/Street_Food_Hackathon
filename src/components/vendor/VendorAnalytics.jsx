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
  LocalShipping as ShippingIcon,
  AttachMoney as MoneyIcon,
  Star as StarIcon,
  Inventory as InventoryIcon
} from '@mui/icons-material'
import { orderService, supplierService } from '../../services/firebaseService'
import { useAuth } from '../../contexts/AuthContext'
import toast from 'react-hot-toast'

const VendorAnalytics = () => {
  const { user } = useAuth()
  const [analytics, setAnalytics] = useState({
    totalSpent: 0,
    totalOrders: 0,
    averageOrderValue: 0,
    topSuppliers: [],
    monthlySpending: [],
    materialCategories: [],
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
      const orders = await orderService.getVendorOrders(user.uid)
      const suppliers = await supplierService.getSuppliers()
      
      // Calculate analytics from real data
      const totalSpent = orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0)
      const totalOrders = orders.length
      const averageOrderValue = totalOrders > 0 ? totalSpent / totalOrders : 0
      
      // Calculate top suppliers (simplified)
      const supplierStats = {}
      orders.forEach(order => {
        if (order.supplierId && supplierStats[order.supplierId]) {
          supplierStats[order.supplierId].orders++
          supplierStats[order.supplierId].spent += order.totalAmount || 0
        } else if (order.supplierId) {
          const supplier = suppliers.find(s => s.id === order.supplierId)
          supplierStats[order.supplierId] = {
            name: supplier?.name || 'Unknown Supplier',
            orders: 1,
            spent: order.totalAmount || 0,
            rating: supplier?.rating || 0
          }
        }
      })
      
      const topSuppliers = Object.values(supplierStats)
        .sort((a, b) => b.spent - a.spent)
        .slice(0, 3)
      
      setAnalytics({
        totalSpent,
        totalOrders,
        averageOrderValue,
        topSuppliers,
        monthlySpending: [], // Would need date-based calculation
        materialCategories: [], // Would need inventory data
        recentTrends: [
          { trend: 'Total orders placed', change: `${totalOrders}`, positive: true },
          { trend: 'Total amount spent', change: `₹${totalSpent.toLocaleString()}`, positive: true },
          { trend: 'Average order value', change: `₹${averageOrderValue.toFixed(0)}`, positive: true }
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
          Analytics & Insights
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Track your raw material sourcing performance and trends
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
                    ₹{analytics.totalSpent.toLocaleString()}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Spent
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
                  <StarIcon />
                </Avatar>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 600 }}>
                    4.5
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Avg Supplier Rating
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Top Suppliers */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                Top Suppliers
              </Typography>
              <List>
                {analytics.topSuppliers.map((supplier, index) => (
                  <ListItem key={index} sx={{ px: 0 }}>
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: 'primary.main' }}>
                        {supplier.name.charAt(0)}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={supplier.name}
                      secondary={`${supplier.orders} orders • ₹${supplier.spent.toLocaleString()} spent`}
                    />
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, ml: 2 }}>
                      <StarIcon fontSize="small" color="warning" />
                      <Typography variant="body2" color="text.secondary">
                        {supplier.rating}
                      </Typography>
                    </Box>
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Material Categories */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                Spending by Category
              </Typography>
              {analytics.materialCategories.map((category, index) => (
                <Box key={index} sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {category.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      ₹{category.amount.toLocaleString()}
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={category.percentage}
                    sx={{ height: 8, borderRadius: 4 }}
                  />
                  <Typography variant="caption" color="text.secondary">
                    {category.percentage}% of total spending
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

        {/* Monthly Spending Chart */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                Monthly Spending Trend
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'end', gap: 2, height: 200, mt: 2 }}>
                {analytics.monthlySpending.map((month, index) => (
                  <Box key={index} sx={{ flex: 1, textAlign: 'center' }}>
                    <Box
                      sx={{
                        height: `${(month.amount / 4000) * 150}px`,
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
                      ₹{month.amount}
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

export default VendorAnalytics 