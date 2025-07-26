import React, { useState } from 'react'
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Avatar,
  Menu,
  MenuItem,
  Chip,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  useTheme,
  useMediaQuery
} from '@mui/material'
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  Search as SearchIcon,
  ShoppingCart as OrdersIcon,
  People as PeopleIcon,
  Inventory as InventoryIcon,
  Assessment as AnalyticsIcon,
  AccountCircle as AccountIcon,
  Logout as LogoutIcon,
  Store as StoreIcon,
  LocalShipping as ShippingIcon,
  Storefront as SuppliersIcon
} from '@mui/icons-material'
import { useAuth } from '../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'

const Header = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  
  const [anchorEl, setAnchorEl] = useState(null)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget)
  }

  const handleMenuClose = () => {
    setAnchorEl(null)
  }

  const handleLogout = async () => {
    try {
      await logout()
      navigate('/login')
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  const handleMobileMenuToggle = () => {
    setMobileMenuOpen(!mobileMenuOpen)
  }

  const getNavigationItems = () => {
    if (user?.role === 'vendor') {
      return [
        { text: 'Search Suppliers', icon: <SearchIcon />, path: '/vendor' },
        { text: 'My Orders', icon: <OrdersIcon />, path: '/vendor' },
        { text: 'My Suppliers', icon: <SuppliersIcon />, path: '/vendor' },
        { text: 'Analytics', icon: <AnalyticsIcon />, path: '/vendor' }
      ]
    } else if (user?.role === 'supplier') {
      return [
        { text: 'Inventory', icon: <InventoryIcon />, path: '/supplier' },
        { text: 'Orders', icon: <OrdersIcon />, path: '/supplier' },
        { text: 'Customers', icon: <PeopleIcon />, path: '/supplier' },
        { text: 'Analytics', icon: <AnalyticsIcon />, path: '/supplier' }
      ]
    }
    return []
  }

  const navigationItems = getNavigationItems()

  return (
    <>
      <AppBar 
        position="static" 
        elevation={0}
        sx={{
          background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
          borderBottom: '1px solid #334155',
          backdropFilter: 'blur(20px)',
        }}
      >
        <Toolbar sx={{ justifyContent: 'space-between', px: { xs: 2, md: 4 } }}>
          {/* Logo and Brand */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {isMobile && (
              <IconButton
                color="inherit"
                onClick={handleMobileMenuToggle}
                sx={{ mr: 1 }}
              >
                <MenuIcon />
              </IconButton>
            )}
            
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Avatar
                sx={{
                  background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
                  width: 40,
                  height: 40,
                  mr: 1
                }}
              >
                <StoreIcon />
              </Avatar>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 700,
                  background: 'linear-gradient(135deg, #f8fafc 0%, #cbd5e1 100%)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  display: { xs: 'none', sm: 'block' }
                }}
              >
                StreetFood Connect
              </Typography>
            </Box>

            {/* Role Badge */}
            <Chip
              label={user?.role === 'vendor' ? 'Vendor Portal' : 'Supplier Portal'}
              size="small"
              sx={{
                background: user?.role === 'vendor' 
                  ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
                  : 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
                color: '#ffffff',
                fontWeight: 600,
                fontSize: '0.75rem',
                height: 24,
                '& .MuiChip-label': {
                  px: 1.5,
                }
              }}
            />
          </Box>

          {/* Desktop Navigation */}
          {!isMobile && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {navigationItems.map((item, index) => (
                <Button
                  key={index}
                  color="inherit"
                  startIcon={item.icon}
                  sx={{
                    color: '#cbd5e1',
                    '&:hover': {
                      background: 'rgba(99, 102, 241, 0.1)',
                      color: '#f8fafc',
                    },
                    borderRadius: '8px',
                    px: 2,
                    py: 1,
                    fontWeight: 500,
                  }}
                >
                  {item.text}
                </Button>
              ))}
            </Box>
          )}

          {/* User Menu */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
              <Typography variant="body2" color="text.secondary" align="right">
                {user?.displayName || user?.email}
              </Typography>
              <Typography variant="caption" color="text.disabled">
                {user?.role === 'vendor' ? 'Street Food Vendor' : 'Wholesale Supplier'}
              </Typography>
            </Box>

            <Avatar
              onClick={handleMenuOpen}
              sx={{
                background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
                cursor: 'pointer',
                width: 40,
                height: 40,
                border: '2px solid rgba(99, 102, 241, 0.3)',
                '&:hover': {
                  border: '2px solid rgba(99, 102, 241, 0.6)',
                  transform: 'scale(1.05)',
                  transition: 'all 0.2s ease-in-out',
                }
              }}
            >
              {user?.displayName?.charAt(0) || user?.email?.charAt(0) || 'U'}
            </Avatar>

            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
              PaperProps={{
                sx: {
                  background: 'linear-gradient(135deg, #16213e 0%, #1e293b 100%)',
                  border: '1px solid #334155',
                  borderRadius: '12px',
                  mt: 1,
                  minWidth: 200,
                  boxShadow: '0 10px 40px rgba(0, 0, 0, 0.3)',
                }
              }}
            >
              <MenuItem onClick={handleMenuClose} sx={{ py: 2 }}>
                <ListItemIcon>
                  <AccountIcon sx={{ color: '#6366f1' }} />
                </ListItemIcon>
                <ListItemText 
                  primary="Profile"
                  secondary={user?.email}
                  primaryTypographyProps={{ fontWeight: 600 }}
                  secondaryTypographyProps={{ color: 'text.secondary' }}
                />
              </MenuItem>
              <Divider sx={{ borderColor: '#334155' }} />
              <MenuItem onClick={handleLogout} sx={{ py: 2 }}>
                <ListItemIcon>
                  <LogoutIcon sx={{ color: '#ef4444' }} />
                </ListItemIcon>
                <ListItemText 
                  primary="Logout"
                  primaryTypographyProps={{ fontWeight: 600, color: '#ef4444' }}
                />
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Mobile Navigation Drawer */}
      <Drawer
        anchor="left"
        open={mobileMenuOpen}
        onClose={handleMobileMenuToggle}
        PaperProps={{
          sx: {
            background: 'linear-gradient(135deg, #16213e 0%, #1e293b 100%)',
            borderRight: '1px solid #334155',
            width: 280,
          }
        }}
      >
        <Box sx={{ p: 3, borderBottom: '1px solid #334155' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <Avatar
              sx={{
                background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
                width: 48,
                height: 48,
              }}
            >
              <StoreIcon />
            </Avatar>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 700, color: '#f8fafc' }}>
                StreetFood Connect
              </Typography>
              <Chip
                label={user?.role === 'vendor' ? 'Vendor Portal' : 'Supplier Portal'}
                size="small"
                sx={{
                  background: user?.role === 'vendor' 
                    ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
                    : 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
                  color: '#ffffff',
                  fontWeight: 600,
                  fontSize: '0.75rem',
                }}
              />
            </Box>
          </Box>
          <Typography variant="body2" color="text.secondary">
            {user?.displayName || user?.email}
          </Typography>
        </Box>

        <List sx={{ pt: 2 }}>
          {navigationItems.map((item, index) => (
            <ListItem
              key={index}
              button
              onClick={() => {
                setMobileMenuOpen(false)
                // Navigate to the specific section
              }}
              sx={{
                mx: 2,
                mb: 1,
                borderRadius: '8px',
                '&:hover': {
                  background: 'rgba(99, 102, 241, 0.1)',
                }
              }}
            >
              <ListItemIcon sx={{ color: '#6366f1', minWidth: 40 }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText 
                primary={item.text}
                primaryTypographyProps={{ 
                  fontWeight: 500,
                  color: '#f8fafc'
                }}
              />
            </ListItem>
          ))}
        </List>

        <Divider sx={{ borderColor: '#334155', my: 2 }} />

        <List>
          <ListItem
            button
            onClick={handleLogout}
            sx={{
              mx: 2,
              borderRadius: '8px',
              '&:hover': {
                background: 'rgba(239, 68, 68, 0.1)',
              }
            }}
          >
            <ListItemIcon sx={{ color: '#ef4444', minWidth: 40 }}>
              <LogoutIcon />
            </ListItemIcon>
            <ListItemText 
              primary="Logout"
              primaryTypographyProps={{ 
                fontWeight: 500,
                color: '#ef4444'
              }}
            />
          </ListItem>
        </List>
      </Drawer>
    </>
  )
}

export default Header 