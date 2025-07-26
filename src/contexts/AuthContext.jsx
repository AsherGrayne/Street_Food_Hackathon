import React, { createContext, useContext, useState, useEffect } from 'react'
import { authService, userService } from '../services/firebaseService'
import toast from 'react-hot-toast'

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [userRole, setUserRole] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Listen to Firebase auth state changes
    const unsubscribe = authService.onAuthStateChanged(async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const userProfile = await userService.getUserProfile(firebaseUser.uid)
          if (userProfile) {
            setUser(userProfile)
            setUserRole(userProfile.role)
          }
        } catch (error) {
          console.error('Error fetching user profile:', error)
          setUser(null)
          setUserRole(null)
        }
      } else {
        setUser(null)
        setUserRole(null)
      }
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const login = async (email, password, role) => {
    try {
      setLoading(true)
      const firebaseUser = await authService.login(email, password)
      const userProfile = await userService.getUserProfile(firebaseUser.uid)
      
      if (userProfile && userProfile.role === role) {
        setUser(userProfile)
        setUserRole(userProfile.role)
        toast.success(`Welcome back, ${userProfile.name}!`)
        return true
      } else {
        await authService.logout()
        toast.error('Invalid role selected for this account')
        return false
      }
    } catch (error) {
      console.error('Login error:', error)
      let errorMessage = 'Login failed. Please try again.'
      
      if (error.code === 'auth/user-not-found') {
        errorMessage = 'No account found with this email.'
      } else if (error.code === 'auth/wrong-password') {
        errorMessage = 'Incorrect password.'
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Invalid email address.'
      }
      
      toast.error(errorMessage)
      return false
    } finally {
      setLoading(false)
    }
  }

  const register = async (userData) => {
    try {
      setLoading(true)
      const firebaseUser = await authService.register(userData.email, userData.password, userData)
      const userProfile = await userService.getUserProfile(firebaseUser.uid)
      
      setUser(userProfile)
      setUserRole(userProfile.role)
      
      toast.success('Registration successful! Welcome to StreetFood Connect.')
      return true
    } catch (error) {
      console.error('Registration error:', error)
      let errorMessage = 'Registration failed. Please try again.'
      
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'An account with this email already exists.'
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'Password should be at least 6 characters.'
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Invalid email address.'
      }
      
      toast.error(errorMessage)
      return false
    } finally {
      setLoading(false)
    }
  }

  const logout = async () => {
    try {
      await authService.logout()
      setUser(null)
      setUserRole(null)
      toast.success('Logged out successfully')
    } catch (error) {
      console.error('Logout error:', error)
      toast.error('Logout failed. Please try again.')
    }
  }

  const updateProfile = async (updates) => {
    try {
      if (user) {
        await userService.updateUserProfile(user.uid, updates)
        const updatedProfile = await userService.getUserProfile(user.uid)
        setUser(updatedProfile)
        toast.success('Profile updated successfully')
      }
    } catch (error) {
      console.error('Profile update error:', error)
      toast.error('Profile update failed. Please try again.')
    }
  }

  const value = {
    user,
    userRole,
    loading,
    login,
    register,
    logout,
    updateProfile
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
} 