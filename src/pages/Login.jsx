import React, { useState } from 'react'
import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  Link,
  Alert,
  CircularProgress,
  Container,
  Avatar,
  Divider,
  IconButton,
  InputAdornment
} from '@mui/material'
import {
  Visibility,
  VisibilityOff,
  Store as StoreIcon,
  Email as EmailIcon,
  Lock as LockIcon
} from '@mui/icons-material'
import { useAuth } from '../contexts/AuthContext'
import { useNavigate, Link as RouterLink } from 'react-router-dom'
import toast from 'react-hot-toast'

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
    setError('') // Clear error when user starts typing
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.email || !formData.password) {
      setError('Please fill in all fields')
      return
    }

    try {
      setLoading(true)
      setError('')
      
      const user = await login(formData.email, formData.password)
      
      if (user.role === 'vendor') {
        navigate('/vendor')
      } else if (user.role === 'supplier') {
        navigate('/supplier')
      } else {
        navigate('/')
      }
      
      toast.success('Login successful!')
    } catch (error) {
      console.error('Login error:', error)
      setError('Invalid email or password. Please try again.')
      toast.error('Login failed. Please check your credentials.')
    } finally {
      setLoading(false)
    }
  }

  const handleTogglePasswordVisibility = () => {
    setShowPassword(!showPassword)
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0f0f23 0%, #1a1a2e 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        py: 4,
        px: 2,
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'radial-gradient(circle at 20% 80%, rgba(99, 102, 241, 0.1) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(16, 185, 129, 0.1) 0%, transparent 50%)',
          pointerEvents: 'none',
        }
      }}
    >
      <Container maxWidth="sm">
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            mb: 4,
          }}
        >
          {/* Logo and Brand */}
          <Avatar
            sx={{
              width: 80,
              height: 80,
              mb: 3,
              background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
              boxShadow: '0 8px 32px rgba(99, 102, 241, 0.3)',
            }}
          >
            <StoreIcon sx={{ fontSize: 40 }} />
          </Avatar>
          
          <Typography
            variant="h3"
            component="h1"
            sx={{
              fontWeight: 700,
              textAlign: 'center',
              mb: 1,
              background: 'linear-gradient(135deg, #f8fafc 0%, #cbd5e1 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            StreetFood Connect
          </Typography>
          
          <Typography
            variant="h6"
            color="text.secondary"
            sx={{
              textAlign: 'center',
              mb: 4,
              fontWeight: 400,
            }}
          >
            Connect with the best suppliers for your street food business
          </Typography>
        </Box>

        <Paper
          elevation={0}
          sx={{
            p: 4,
            background: 'linear-gradient(135deg, #16213e 0%, #1e293b 100%)',
            border: '1px solid #334155',
            borderRadius: '20px',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
            backdropFilter: 'blur(20px)',
            position: 'relative',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.05) 0%, rgba(16, 185, 129, 0.05) 100%)',
              borderRadius: '20px',
              pointerEvents: 'none',
            }
          }}
        >
          <Typography
            variant="h4"
            component="h2"
            sx={{
              textAlign: 'center',
              mb: 3,
              fontWeight: 600,
              color: '#f8fafc',
            }}
          >
            Welcome Back
          </Typography>
          
          <Typography
            variant="body1"
            color="text.secondary"
            sx={{
              textAlign: 'center',
              mb: 4,
            }}
          >
            Sign in to your account to continue
          </Typography>

          {error && (
            <Alert
              severity="error"
              sx={{
                mb: 3,
                borderRadius: '8px',
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                '& .MuiAlert-icon': {
                  color: '#ef4444',
                }
              }}
            >
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
            <TextField
              fullWidth
              label="Email Address"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              required
              sx={{
                mb: 3,
                '& .MuiOutlinedInput-root': {
                  borderRadius: '12px',
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
                '& .MuiInputLabel-root': {
                  color: '#cbd5e1',
                  '&.Mui-focused': {
                    color: '#6366f1',
                  },
                },
                '& .MuiInputBase-input': {
                  color: '#f8fafc',
                },
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <EmailIcon sx={{ color: '#6366f1' }} />
                  </InputAdornment>
                ),
              }}
            />

            <TextField
              fullWidth
              label="Password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={handleChange}
              required
              sx={{
                mb: 4,
                '& .MuiOutlinedInput-root': {
                  borderRadius: '12px',
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
                '& .MuiInputLabel-root': {
                  color: '#cbd5e1',
                  '&.Mui-focused': {
                    color: '#6366f1',
                  },
                },
                '& .MuiInputBase-input': {
                  color: '#f8fafc',
                },
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockIcon sx={{ color: '#6366f1' }} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={handleTogglePasswordVisibility}
                      edge="end"
                      sx={{ color: '#cbd5e1' }}
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={loading}
              sx={{
                py: 2,
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
                fontSize: '1.1rem',
                fontWeight: 600,
                textTransform: 'none',
                boxShadow: '0 4px 20px rgba(99, 102, 241, 0.3)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #4f46e5 0%, #3730a3 100%)',
                  boxShadow: '0 6px 25px rgba(99, 102, 241, 0.4)',
                  transform: 'translateY(-1px)',
                },
                '&:disabled': {
                  background: '#334155',
                  color: '#64748b',
                },
              }}
            >
              {loading ? (
                <CircularProgress size={24} sx={{ color: '#ffffff' }} />
              ) : (
                'Sign In'
              )}
            </Button>
          </Box>

          <Divider sx={{ my: 4, borderColor: '#334155' }}>
            <Typography variant="body2" color="text.secondary">
              New to StreetFood Connect?
            </Typography>
          </Divider>

          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Don't have an account?{' '}
              <Link
                component={RouterLink}
                to="/register"
                sx={{
                  color: '#6366f1',
                  textDecoration: 'none',
                  fontWeight: 600,
                  '&:hover': {
                    textDecoration: 'underline',
                  },
                }}
              >
                Sign up here
              </Link>
            </Typography>
          </Box>
        </Paper>

        {/* Footer */}
        <Box sx={{ textAlign: 'center', mt: 4 }}>
          <Typography variant="body2" color="text.disabled">
            © 2024 StreetFood Connect. All rights reserved.
          </Typography>
        </Box>
      </Container>
    </Box>
  )
}

export default Login 