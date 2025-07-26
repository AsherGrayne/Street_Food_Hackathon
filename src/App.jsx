import React, { useState } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { Box, Container } from '@mui/material'
import Header from './components/Header'
import VendorDashboard from './pages/VendorDashboard'
import SupplierDashboard from './pages/SupplierDashboard'
import Login from './pages/Login'
import Register from './pages/Register'
import { AuthProvider, useAuth } from './contexts/AuthContext'

const ProtectedRoute = ({ children, userType }) => {
  const { user, userRole } = useAuth()
  
  if (!user) {
    return <Navigate to="/login" replace />
  }
  
  if (userType && userRole !== userType) {
    return <Navigate to="/" replace />
  }
  
  return children
}

const AppContent = () => {
  const { user, userRole } = useAuth()

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <Header />
      <Container maxWidth="xl" sx={{ mt: 2, mb: 4 }}>
        <Routes>
          <Route path="/login" element={!user ? <Login /> : <Navigate to="/" replace />} />
          <Route path="/register" element={!user ? <Register /> : <Navigate to="/" replace />} />
          <Route 
            path="/vendor/*" 
            element={
              <ProtectedRoute userType="vendor">
                <VendorDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/supplier/*" 
            element={
              <ProtectedRoute userType="supplier">
                <SupplierDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/" 
            element={
              user ? (
                userRole === 'vendor' ? (
                  <Navigate to="/vendor" replace />
                ) : (
                  <Navigate to="/supplier" replace />
                )
              ) : (
                <Navigate to="/login" replace />
              )
            } 
          />
        </Routes>
      </Container>
    </Box>
  )
}

const App = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}

export default App 