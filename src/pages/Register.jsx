import React, { useState } from 'react'
import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  CircularProgress
} from '@mui/material'
import { Link as RouterLink } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    location: '',
    role: '',
    businessType: ''
  })
  const [loading, setLoading] = useState(false)
  const { register } = useAuth()

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (formData.password !== formData.confirmPassword) {
      alert('Passwords do not match')
      return
    }
    
    setLoading(true)
    const success = await register(formData)
    setLoading(false)
  }

  return (
    <Box
      sx={{
        minHeight: '80vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        py: 4
      }}
    >
      <Paper
        elevation={3}
        sx={{
          p: 4,
          width: '100%',
          maxWidth: 600,
          textAlign: 'center'
        }}
      >
        <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 600 }}>
          Join StreetFood Connect
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Create your account to start connecting with the street food ecosystem
        </Typography>

        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>I am a...</InputLabel>
                <Select
                  name="role"
                  value={formData.role}
                  label="I am a..."
                  onChange={handleChange}
                  required
                >
                  <MenuItem value="vendor">Street Food Vendor</MenuItem>
                  <MenuItem value="supplier">Raw Material Supplier</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Business Name / Full Name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Email Address"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Phone Number"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                required
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Location (City, State)"
                name="location"
                value={formData.location}
                onChange={handleChange}
                required
              />
            </Grid>

            {formData.role === 'supplier' && (
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Business Type (e.g., Wholesale, Distributor)"
                  name="businessType"
                  value={formData.businessType}
                  onChange={handleChange}
                  required
                />
              </Grid>
            )}

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Confirm Password"
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
              />
            </Grid>
          </Grid>

          <Button
            type="submit"
            fullWidth
            variant="contained"
            size="large"
            disabled={loading || !formData.role}
            sx={{ mt: 3, mb: 2 }}
          >
            {loading ? <CircularProgress size={24} /> : 'Create Account'}
          </Button>

          <Typography variant="body2">
            Already have an account?{' '}
            <RouterLink to="/login" style={{ color: 'inherit', textDecoration: 'none' }}>
              <Typography component="span" color="primary" sx={{ fontWeight: 500 }}>
                Sign in here
              </Typography>
            </RouterLink>
          </Typography>
        </Box>
      </Paper>
    </Box>
  )
}

export default Register 