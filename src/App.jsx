import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import { CssBaseline, Box, Typography, Button } from '@mui/material'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import Header from './components/Header'
import Login from './pages/Login'
import Register from './pages/Register'
import VendorDashboard from './pages/VendorDashboard'
import SupplierDashboard from './pages/SupplierDashboard'
import AdminPanel from './components/AdminPanel'

// Create a professional dark theme
const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#6366f1', // Indigo
      light: '#818cf8',
      dark: '#4f46e5',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#10b981', // Emerald
      light: '#34d399',
      dark: '#059669',
      contrastText: '#ffffff',
    },
    background: {
      default: '#0f0f23', // Deep dark blue
      paper: '#1a1a2e', // Slightly lighter dark blue
      card: '#16213e', // Card background
    },
    surface: {
      main: '#1e293b', // Slate
      light: '#334155',
      dark: '#0f172a',
    },
    text: {
      primary: '#f8fafc', // Slate 50
      secondary: '#cbd5e1', // Slate 300
      disabled: '#64748b', // Slate 500
    },
    divider: '#334155', // Slate 700
    success: {
      main: '#10b981', // Emerald
      light: '#34d399',
      dark: '#059669',
    },
    warning: {
      main: '#f59e0b', // Amber
      light: '#fbbf24',
      dark: '#d97706',
    },
    error: {
      main: '#ef4444', // Red
      light: '#f87171',
      dark: '#dc2626',
    },
    info: {
      main: '#3b82f6', // Blue
      light: '#60a5fa',
      dark: '#2563eb',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 700,
      fontSize: '2.5rem',
      lineHeight: 1.2,
    },
    h2: {
      fontWeight: 600,
      fontSize: '2rem',
      lineHeight: 1.3,
    },
    h3: {
      fontWeight: 600,
      fontSize: '1.75rem',
      lineHeight: 1.3,
    },
    h4: {
      fontWeight: 600,
      fontSize: '1.5rem',
      lineHeight: 1.4,
    },
    h5: {
      fontWeight: 600,
      fontSize: '1.25rem',
      lineHeight: 1.4,
    },
    h6: {
      fontWeight: 600,
      fontSize: '1.125rem',
      lineHeight: 1.4,
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.6,
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.6,
    },
    button: {
      fontWeight: 600,
      textTransform: 'none',
      fontSize: '0.875rem',
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          scrollbarColor: '#334155 #1a1a2e',
          '&::-webkit-scrollbar, & *::-webkit-scrollbar': {
            width: '8px',
            height: '8px',
          },
          '&::-webkit-scrollbar-thumb, & *::-webkit-scrollbar-thumb': {
            borderRadius: '4px',
            backgroundColor: '#334155',
            minHeight: '24px',
          },
          '&::-webkit-scrollbar-track, & *::-webkit-scrollbar-track': {
            borderRadius: '4px',
            backgroundColor: '#1a1a2e',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          background: 'linear-gradient(135deg, #16213e 0%, #1e293b 100%)',
          border: '1px solid #334155',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
          backdropFilter: 'blur(10px)',
          '&:hover': {
            boxShadow: '0 8px 30px rgba(0, 0, 0, 0.4)',
            transform: 'translateY(-2px)',
            transition: 'all 0.3s ease-in-out',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          background: 'linear-gradient(135deg, #16213e 0%, #1e293b 100%)',
          border: '1px solid #334155',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '8px',
          fontWeight: 600,
          textTransform: 'none',
          padding: '10px 24px',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)',
          transition: 'all 0.3s ease-in-out',
          '&:hover': {
            transform: 'translateY(-1px)',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
          },
        },
        contained: {
          background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
          '&:hover': {
            background: 'linear-gradient(135deg, #4f46e5 0%, #3730a3 100%)',
          },
        },
        outlined: {
          borderColor: '#334155',
          '&:hover': {
            borderColor: '#6366f1',
            backgroundColor: 'rgba(99, 102, 241, 0.08)',
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: '8px',
          fontWeight: 500,
          '&.MuiChip-colorSuccess': {
            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            color: '#ffffff',
          },
          '&.MuiChip-colorWarning': {
            background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
            color: '#ffffff',
          },
          '&.MuiChip-colorError': {
            background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
            color: '#ffffff',
          },
          '&.MuiChip-colorPrimary': {
            background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
            color: '#ffffff',
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: '8px',
            backgroundColor: 'rgba(30, 41, 59, 0.5)',
            border: '1px solid #334155',
            '&:hover': {
              borderColor: '#6366f1',
            },
            '&.Mui-focused': {
              borderColor: '#6366f1',
              boxShadow: '0 0 0 2px rgba(99, 102, 241, 0.2)',
            },
          },
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          background: 'linear-gradient(135deg, #16213e 0%, #1e293b 100%)',
          border: '1px solid #334155',
          borderRadius: '16px',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)',
        },
      },
    },
    MuiTableContainer: {
      styleOverrides: {
        root: {
          background: 'linear-gradient(135deg, #16213e 0%, #1e293b 100%)',
          border: '1px solid #334155',
          borderRadius: '12px',
          overflow: 'hidden',
        },
      },
    },
    MuiTableHead: {
      styleOverrides: {
        root: {
          '& .MuiTableCell-head': {
            backgroundColor: 'rgba(30, 41, 59, 0.8)',
            fontWeight: 600,
            color: '#f8fafc',
            borderBottom: '2px solid #334155',
          },
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderBottom: '1px solid #334155',
          color: '#cbd5e1',
        },
      },
    },
    MuiAvatar: {
      styleOverrides: {
        root: {
          background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
          fontWeight: 600,
        },
      },
    },
    MuiRating: {
      styleOverrides: {
        root: {
          '& .MuiRating-iconFilled': {
            color: '#f59e0b',
          },
          '& .MuiRating-iconHover': {
            color: '#fbbf24',
          },
        },
      },
    },
  },
})

// Simple fallback component
const FallbackComponent = () => (
  <Box
    sx={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f0f23 0%, #1a1a2e 100%)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      p: 4,
    }}
  >
    <Typography variant="h4" sx={{ color: '#f8fafc', mb: 2 }}>
      StreetFood Connect
    </Typography>
    <Typography variant="body1" sx={{ color: '#cbd5e1', mb: 4, textAlign: 'center' }}>
      Loading application...
    </Typography>
    <div className="loading-spinner"></div>
  </Box>
)

// Error boundary component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <Box
          sx={{
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #0f0f23 0%, #1a1a2e 100%)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            p: 4,
          }}
        >
          <Typography variant="h4" sx={{ color: '#f8fafc', mb: 2 }}>
            Something went wrong
          </Typography>
          <Typography variant="body1" sx={{ color: '#cbd5e1', mb: 4, textAlign: 'center' }}>
            {this.state.error?.message || 'An unexpected error occurred'}
          </Typography>
          <Button
            variant="contained"
            onClick={() => window.location.reload()}
            sx={{ mt: 2 }}
          >
            Reload Page
          </Button>
        </Box>
      )
    }

    return this.props.children
  }
}

const PrivateRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth()
  
  console.log('PrivateRoute - user:', user, 'loading:', loading, 'allowedRoles:', allowedRoles)

  if (loading) {
    console.log('PrivateRoute - showing loading spinner')
    return <FallbackComponent />
  }
  
  if (!user) {
    console.log('PrivateRoute - no user, redirecting to login')
    return <Navigate to="/login" replace />
  }
  
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    console.log('PrivateRoute - user role not allowed, redirecting')
    return <Navigate to="/" replace />
  }
  
  console.log('PrivateRoute - rendering children')
  return children
}

const App = () => {
  console.log('App component rendering...')

  return (
    <ErrorBoundary>
      <ThemeProvider theme={darkTheme}>
        <CssBaseline />
        <AuthProvider>
          <Router>
            <Box
              sx={{
                minHeight: '100vh',
                background: 'linear-gradient(135deg, #0f0f23 0%, #1a1a2e 100%)',
                backgroundAttachment: 'fixed',
              }}
            >
        <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
          <Route 
                  path="/vendor"
            element={
                    <PrivateRoute allowedRoles={['vendor']}>
                      <>
                        <Header />
                <VendorDashboard />
                      </>
                    </PrivateRoute>
            } 
          />
          <Route 
                  path="/supplier"
            element={
                    <PrivateRoute allowedRoles={['supplier']}>
                      <>
                        <Header />
                <SupplierDashboard />
                      </>
                    </PrivateRoute>
            } 
          />
          <Route 
                  path="/admin"
            element={
                    <PrivateRoute allowedRoles={['vendor', 'supplier']}>
                      <>
                        <Header />
                        <AdminPanel />
                      </>
                    </PrivateRoute>
                  }
                />
                <Route path="/" element={<Navigate to="/login" replace />} />
        </Routes>
    </Box>
          </Router>
    </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  )
}

export default App 