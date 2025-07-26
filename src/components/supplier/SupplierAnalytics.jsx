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
  Inventory as InventoryIcon,
  TrendingDown as TrendingDownIcon,
  Category as CategoryIcon
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
    monthlyOrders: [],
    spendingByCategory: [],
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
      
      // Calculate monthly revenue trend (last 6 months)
      const monthlyRevenue = calculateMonthlyRevenue(orders)
      
      // Calculate monthly orders trend (last 6 months)
      const monthlyOrders = calculateMonthlyOrders(orders)
      
      // Calculate spending by category (operational costs for suppliers)
      const spendingByCategory = calculateSpendingByCategory(inventory, orders)
      
      // Calculate material sales
      const materialSales = calculateMaterialSales(orders, inventory)
      
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
      
      // Calculate recent trends
      const recentTrends = [
        { trend: 'Total orders received', change: `${totalOrders}`, positive: totalOrders > 0 },
        { trend: 'Total revenue generated', change: `₹${totalRevenue.toLocaleString()}`, positive: totalRevenue > 0 },
        { trend: 'Average order value', change: `₹${averageOrderValue.toFixed(0)}`, positive: averageOrderValue > 0 },
        { trend: 'Total customers served', change: `${totalCustomers}`, positive: totalCustomers > 0 }
      ]
      
      setAnalytics({
        totalRevenue,
        totalOrders,
        averageOrderValue,
        totalCustomers,
        topCustomers,
        monthlyRevenue,
        monthlyOrders,
        spendingByCategory,
        materialSales,
        recentTrends
      })
    } catch (error) {
      console.error('Error loading analytics:', error)
      toast.error('Failed to load analytics')
    } finally {
      setLoading(false)
    }
  }

  const calculateMonthlyRevenue = (orders) => {
    const months = []
    const currentDate = new Date()
    
    for (let i = 5; i >= 0; i--) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1)
      const monthName = date.toLocaleDateString('en-US', { month: 'short' })
      const year = date.getFullYear()
      
      // Filter orders for this month
      const monthOrders = orders.filter(order => {
        const orderDate = order.createdAt?.toDate ? order.createdAt.toDate() : new Date(order.createdAt || order.orderDate)
        return orderDate.getMonth() === date.getMonth() && orderDate.getFullYear() === date.getFullYear()
      })
      
      const revenue = monthOrders.reduce((sum, order) => sum + (order.totalAmount || 0), 0)
      
      months.push({
        month: monthName,
        year: year,
        revenue: revenue,
        orders: monthOrders.length
      })
    }
    
    return months
  }

  const calculateMonthlyOrders = (orders) => {
    const months = []
    const currentDate = new Date()
    
    for (let i = 5; i >= 0; i--) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1)
      const monthName = date.toLocaleDateString('en-US', { month: 'short' })
      const year = date.getFullYear()
      
      // Filter orders for this month
      const monthOrders = orders.filter(order => {
        const orderDate = order.createdAt?.toDate ? order.createdAt.toDate() : new Date(order.createdAt || order.orderDate)
        return orderDate.getMonth() === date.getMonth() && orderDate.getFullYear() === date.getFullYear()
      })
      
      months.push({
        month: monthName,
        year: year,
        orders: monthOrders.length,
        revenue: monthOrders.reduce((sum, order) => sum + (order.totalAmount || 0), 0)
      })
    }
    
    return months
  }

  const calculateSpendingByCategory = (inventory, orders) => {
    // For suppliers, "spending" represents operational costs and inventory management
    const categories = {
      'Inventory Management': {
        name: 'Inventory Management',
        amount: 0,
        percentage: 0,
        description: 'Stock maintenance and management costs'
      },
      'Operational Costs': {
        name: 'Operational Costs',
        amount: 0,
        percentage: 0,
        description: 'Utilities, rent, and daily operations'
      },
      'Quality Control': {
        name: 'Quality Control',
        amount: 0,
        percentage: 0,
        description: 'Quality testing and certification'
      },
      'Marketing & Promotion': {
        name: 'Marketing & Promotion',
        amount: 0,
        percentage: 0,
        description: 'Advertising and customer acquisition'
      },
      'Logistics & Delivery': {
        name: 'Logistics & Delivery',
        amount: 0,
        percentage: 0,
        description: 'Transportation and delivery costs'
      }
    }

    // Calculate estimated costs based on inventory and orders
    const totalInventoryValue = inventory.reduce((sum, item) => sum + (item.price * item.stock), 0)
    const totalRevenue = orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0)

    // Estimate spending by category (these are realistic estimates for suppliers)
    categories['Inventory Management'].amount = Math.round(totalInventoryValue * 0.15) // 15% of inventory value
    categories['Operational Costs'].amount = Math.round(totalRevenue * 0.20) // 20% of revenue
    categories['Quality Control'].amount = Math.round(totalRevenue * 0.10) // 10% of revenue
    categories['Marketing & Promotion'].amount = Math.round(totalRevenue * 0.08) // 8% of revenue
    categories['Logistics & Delivery'].amount = Math.round(totalRevenue * 0.12) // 12% of revenue

    // Calculate total spending and percentages
    const totalSpending = Object.values(categories).reduce((sum, cat) => sum + cat.amount, 0)
    
    Object.values(categories).forEach(category => {
      category.percentage = totalSpending > 0 ? Math.round((category.amount / totalSpending) * 100) : 0
    })

    return Object.values(categories)
      .filter(cat => cat.amount > 0)
      .sort((a, b) => b.amount - a.amount)
  }

  const calculateMaterialSales = (orders, inventory) => {
    const materialStats = {}
    
    // Initialize with inventory items
    inventory.forEach(item => {
      materialStats[item.name] = {
        name: item.name,
        revenue: 0,
        quantity: 0,
        percentage: 0
      }
    })
    
    // Calculate sales from orders
    orders.forEach(order => {
      if (order.materials) {
        order.materials.forEach(material => {
          if (materialStats[material.name]) {
            materialStats[material.name].revenue += material.total || 0
            materialStats[material.name].quantity += material.quantity || 0
          }
        })
      }
    })
    
    // Calculate percentages
    const totalRevenue = Object.values(materialStats).reduce((sum, item) => sum + item.revenue, 0)
    Object.values(materialStats).forEach(item => {
      item.percentage = totalRevenue > 0 ? Math.round((item.revenue / totalRevenue) * 100) : 0
    })
    
    return Object.values(materialStats)
      .filter(item => item.revenue > 0)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5)
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
                    ₹{analytics.averageOrderValue.toFixed(0)}
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
              {analytics.topCustomers.length > 0 ? (
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
              ) : (
                <Alert severity="info">
                  No customer data available. Start receiving orders to see customer analytics.
                </Alert>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Spending by Category */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                Spending by Category
              </Typography>
              {analytics.spendingByCategory.length > 0 ? (
                analytics.spendingByCategory.map((category, index) => (
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
                      {category.percentage}% of total operational costs
                    </Typography>
                  </Box>
                ))
              ) : (
                <Alert severity="info">
                  No spending data available. Add inventory and receive orders to see spending analytics.
                </Alert>
              )}
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
              {analytics.materialSales.length > 0 ? (
                analytics.materialSales.map((material, index) => (
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
                ))
              ) : (
                <Alert severity="info">
                  No sales data available. Add inventory and receive orders to see sales analytics.
                </Alert>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Monthly Revenue Chart */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                Monthly Revenue Trend
              </Typography>
              {analytics.monthlyRevenue.length > 0 ? (
                <Box sx={{ display: 'flex', alignItems: 'end', gap: 2, height: 200, mt: 2 }}>
                  {analytics.monthlyRevenue.map((month, index) => {
                    const maxRevenue = Math.max(...analytics.monthlyRevenue.map(m => m.revenue))
                    const height = maxRevenue > 0 ? (month.revenue / maxRevenue) * 150 : 20
                    return (
                      <Box key={index} sx={{ flex: 1, textAlign: 'center' }}>
                        <Box
                          sx={{
                            height: `${height}px`,
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
                          ₹{month.revenue.toLocaleString()}
                        </Typography>
                      </Box>
                    )
                  })}
                </Box>
              ) : (
                <Alert severity="info">
                  No revenue data available. Start receiving orders to see revenue trends.
                </Alert>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Monthly Orders Trend */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                Monthly Orders Trend
              </Typography>
              {analytics.monthlyOrders.length > 0 ? (
                <Box sx={{ display: 'flex', alignItems: 'end', gap: 2, height: 200, mt: 2 }}>
                  {analytics.monthlyOrders.map((month, index) => {
                    const maxOrders = Math.max(...analytics.monthlyOrders.map(m => m.orders))
                    const height = maxOrders > 0 ? (month.orders / maxOrders) * 150 : 20
                    return (
                      <Box key={index} sx={{ flex: 1, textAlign: 'center' }}>
                        <Box
                          sx={{
                            height: `${height}px`,
                            bgcolor: 'secondary.main',
                            borderRadius: 1,
                            mb: 1,
                            minHeight: 20
                          }}
                        />
                        <Typography variant="caption" color="text.secondary">
                          {month.month}
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {month.orders} orders
                        </Typography>
                      </Box>
                    )
                  })}
                </Box>
              ) : (
                <Alert severity="info">
                  No order data available. Start receiving orders to see order trends.
                </Alert>
              )}
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
                        icon={trend.positive ? <TrendingUpIcon /> : <TrendingDownIcon />}
                      />
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  )
}

export default SupplierAnalytics 