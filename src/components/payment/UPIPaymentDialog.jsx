import React, { useState, useEffect } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  TextField,
  Button,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  Grid,
  Chip,
  Divider,
  IconButton,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Avatar,
  Stepper,
  Step,
  StepLabel,
  StepContent
} from '@mui/material'
import {
  Close as CloseIcon,
  QrCode as QRCodeIcon,
  Payment as PaymentIcon,
  CheckCircle as SuccessIcon,
  Error as ErrorIcon,
  ContentCopy as CopyIcon,
  Phone as PhoneIcon,
  AccountBalance as BankIcon,
  CreditCard as CardIcon,
  Timer as TimerIcon,
  Receipt as ReceiptIcon,
  Security as SecurityIcon,
  Verified as VerifiedIcon,
  Warning as WarningIcon
} from '@mui/icons-material'
import toast from 'react-hot-toast'
import QRCode from 'qrcode'

// UPI Apps data
const UPI_APPS = [
  { name: 'Google Pay', icon: '💰', color: '#4285F4' },
  { name: 'PhonePe', icon: '📱', color: '#5F259F' },
  { name: 'Paytm', icon: '💳', color: '#00BAF2' },
  { name: 'BHIM', icon: '🏦', color: '#FF6B35' },
  { name: 'Amazon Pay', icon: '📦', color: '#FF9900' },
  { name: 'WhatsApp Pay', icon: '💬', color: '#25D366' }
]

const UPIPaymentDialog = ({ 
  open, 
  onClose, 
  orderData, 
  onPaymentSuccess,
  onPaymentFailure 
}) => {
  const [paymentMethod, setPaymentMethod] = useState('qr')
  const [upiId, setUpiId] = useState('')
  const [paymentStatus, setPaymentStatus] = useState('pending') // pending, processing, success, failed
  const [qrCodeData, setQrCodeData] = useState('')
  const [paymentId, setPaymentId] = useState('')
  const [activeStep, setActiveStep] = useState(0)
  const [paymentTimer, setPaymentTimer] = useState(300) // 5 minutes
  const [selectedUPIApp, setSelectedUPIApp] = useState(null)
  const [paymentDetails, setPaymentDetails] = useState({})

  useEffect(() => {
    if (open && orderData) {
      generatePaymentData()
      setActiveStep(0)
      setPaymentStatus('pending')
      setPaymentTimer(300)
    }
  }, [open, orderData])

  useEffect(() => {
    let timer
    if (paymentStatus === 'processing' && paymentTimer > 0) {
      timer = setTimeout(() => {
        setPaymentTimer(prev => prev - 1)
      }, 1000)
    }
    return () => clearTimeout(timer)
  }, [paymentStatus, paymentTimer])

  const generatePaymentData = () => {
    // Generate a unique payment ID
    const uniquePaymentId = `PAY${Date.now()}${Math.random().toString(36).substr(2, 9)}`
    setPaymentId(uniquePaymentId)
    
    // Generate UPI payment URL with QR code data
    const upiData = {
      pa: 'streetfood@paytm', // Payee UPI ID
      pn: 'StreetFood Connect',
      tn: `Order ${orderData.trackingId}`,
      am: orderData.totalAmount.toString(),
      cu: 'INR',
      ref: uniquePaymentId,
      mc: 'STREETFOOD',
      tr: uniquePaymentId
    }
    
    const upiUrl = `upi://pay?pa=${upiData.pa}&pn=${upiData.pn}&tn=${upiData.tn}&am=${upiData.am}&cu=${upiData.cu}&ref=${upiData.ref}&mc=${upiData.mc}&tr=${upiData.tr}`
    setQrCodeData(upiUrl)
    
    // Set a default UPI ID for manual entry
    setUpiId('streetfood@paytm')
  }

  const generateQRCode = async () => {
    try {
      const qrDataURL = await QRCode.toDataURL(qrCodeData, {
        width: 200,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      })
      return qrDataURL
    } catch (error) {
      console.error('Error generating QR code:', error)
      return ''
    }
  }

  const handleCopyUPIId = () => {
    navigator.clipboard.writeText(upiId)
    toast.success('UPI ID copied to clipboard!')
  }

  const handleCopyPaymentId = () => {
    navigator.clipboard.writeText(paymentId)
    toast.success('Payment ID copied to clipboard!')
  }

  const handleCopyUPIUrl = () => {
    navigator.clipboard.writeText(qrCodeData)
    toast.success('UPI URL copied to clipboard!')
  }

  const simulatePaymentProcessing = () => {
    setPaymentStatus('processing')
    setActiveStep(1)
    
    // Simulate payment processing with realistic steps
    const processingSteps = [
      { step: 0, label: 'Initiating payment...', duration: 1000 },
      { step: 1, label: 'Connecting to UPI network...', duration: 1500 },
      { step: 2, label: 'Verifying payment details...', duration: 2000 },
      { step: 3, label: 'Processing transaction...', duration: 2500 },
      { step: 4, label: 'Confirming payment...', duration: 1000 }
    ]

    let currentStep = 0
    const processStep = () => {
      if (currentStep < processingSteps.length) {
        setActiveStep(processingSteps[currentStep].step)
        setTimeout(processStep, processingSteps[currentStep].duration)
        currentStep++
      } else {
        // Final payment result
        const isSuccess = Math.random() > 0.1 // 90% success rate
        
        if (isSuccess) {
          setPaymentStatus('success')
          setActiveStep(5)
          toast.success('Payment successful!')
          
          const paymentResult = {
            paymentId,
            amount: orderData.totalAmount,
            method: 'UPI',
            status: 'success',
            timestamp: new Date().toISOString(),
            upiApp: selectedUPIApp?.name || 'Unknown',
            transactionId: `TXN${Date.now()}${Math.random().toString(36).substr(2, 6)}`,
            processingTime: `${Math.floor((Date.now() - open) / 1000)}s`
          }
          
          setPaymentDetails(paymentResult)
          
          setTimeout(() => {
            onPaymentSuccess(paymentResult)
          }, 2000)
        } else {
          setPaymentStatus('failed')
          setActiveStep(6)
          toast.error('Payment failed. Please try again.')
          
          const paymentResult = {
            paymentId,
            amount: orderData.totalAmount,
            method: 'UPI',
            status: 'failed',
            timestamp: new Date().toISOString(),
            error: 'Transaction declined by bank',
            processingTime: `${Math.floor((Date.now() - open) / 1000)}s`
          }
          
          setPaymentDetails(paymentResult)
          
          setTimeout(() => {
            onPaymentFailure(paymentResult)
          }, 2000)
        }
      }
    }
    
    processStep()
  }

  const handleRetryPayment = () => {
    setPaymentStatus('pending')
    setActiveStep(0)
    setPaymentTimer(300)
    generatePaymentData()
  }

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const [qrCodeImage, setQrCodeImage] = useState('')

  useEffect(() => {
    if (qrCodeData) {
      generateQRCode().then(setQrCodeImage)
    }
  }, [qrCodeData])

  const renderQRCode = () => (
    <Box sx={{ textAlign: 'center', py: 2 }}>
      <Box
        sx={{
          width: 200,
          height: 200,
          border: '2px solid #e0e0e0',
          borderRadius: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          mx: 'auto',
          mb: 2,
          bgcolor: 'white',
          position: 'relative'
        }}
      >
        {qrCodeImage ? (
          <img 
            src={qrCodeImage} 
            alt="QR Code" 
            style={{ width: '100%', height: '100%', objectFit: 'contain' }}
          />
        ) : (
          <CircularProgress size={40} />
        )}
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            bgcolor: 'white',
            borderRadius: '50%',
            p: 1
          }}
        >
          <PaymentIcon sx={{ fontSize: 24, color: 'primary.main' }} />
        </Box>
      </Box>
      
      <Typography variant="body2" color="text.secondary" gutterBottom>
        Scan QR code with any UPI app
      </Typography>
      
      <Box sx={{ mt: 2 }}>
        <Typography variant="caption" color="text.secondary" gutterBottom>
          Supported Apps:
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, mt: 1, flexWrap: 'wrap' }}>
          {UPI_APPS.map((app, index) => (
            <Chip
              key={index}
              label={app.name}
              size="small"
              sx={{ 
                bgcolor: app.color, 
                color: 'white',
                fontSize: '0.7rem'
              }}
            />
          ))}
        </Box>
      </Box>
      
      <Button
        variant="outlined"
        size="small"
        onClick={handleCopyUPIUrl}
        startIcon={<CopyIcon />}
        sx={{ mt: 2 }}
      >
        Copy UPI URL
      </Button>
    </Box>
  )

  const renderManualUPI = () => (
    <Box sx={{ py: 2 }}>
      <Typography variant="h6" gutterBottom>
        Manual UPI Payment
      </Typography>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="UPI ID"
            value={upiId}
            onChange={(e) => setUpiId(e.target.value)}
            placeholder="Enter UPI ID (e.g., name@bank)"
            InputProps={{
              endAdornment: (
                <IconButton onClick={handleCopyUPIId} size="small">
                  <CopyIcon />
                </IconButton>
              )
            }}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Amount"
            value={`₹${orderData?.totalAmount}`}
            disabled
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Payment ID"
            value={paymentId}
            disabled
            InputProps={{
              endAdornment: (
                <IconButton onClick={handleCopyPaymentId} size="small">
                  <CopyIcon />
                </IconButton>
              )
            }}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Transaction Note"
            value={`Order ${orderData?.trackingId}`}
            disabled
          />
        </Grid>
      </Grid>
      
      <Alert severity="info" sx={{ mt: 2 }}>
        <Typography variant="body2" gutterBottom>
          <strong>Instructions:</strong>
        </Typography>
        <Typography variant="body2" component="div">
          1. Open your UPI app
        </Typography>
        <Typography variant="body2" component="div">
          2. Send ₹{orderData?.totalAmount} to {upiId}
        </Typography>
        <Typography variant="body2" component="div">
          3. Include Payment ID in the note/reference
        </Typography>
        <Typography variant="body2" component="div">
          4. Click "Proceed to Payment" after sending
        </Typography>
      </Alert>
    </Box>
  )

  const renderPaymentStatus = () => {
    switch (paymentStatus) {
      case 'processing':
        return (
          <Box sx={{ py: 4 }}>
            <Stepper activeStep={activeStep} orientation="vertical">
              <Step>
                <StepLabel>Initiating payment</StepLabel>
                <StepContent>
                  <Typography variant="body2" color="text.secondary">
                    Setting up payment gateway connection...
                  </Typography>
                </StepContent>
              </Step>
              <Step>
                <StepLabel>Connecting to UPI network</StepLabel>
                <StepContent>
                  <Typography variant="body2" color="text.secondary">
                    Establishing secure connection to UPI servers...
                  </Typography>
                </StepContent>
              </Step>
              <Step>
                <StepLabel>Verifying payment details</StepLabel>
                <StepContent>
                  <Typography variant="body2" color="text.secondary">
                    Validating transaction information...
                  </Typography>
                </StepContent>
              </Step>
              <Step>
                <StepLabel>Processing transaction</StepLabel>
                <StepContent>
                  <Typography variant="body2" color="text.secondary">
                    Executing payment transfer...
                  </Typography>
                </StepContent>
              </Step>
              <Step>
                <StepLabel>Confirming payment</StepLabel>
                <StepContent>
                  <Typography variant="body2" color="text.secondary">
                    Finalizing transaction...
                  </Typography>
                </StepContent>
              </Step>
            </Stepper>
            
            <Box sx={{ textAlign: 'center', mt: 3 }}>
              <CircularProgress size={40} sx={{ mb: 2 }} />
              <Typography variant="body2" color="text.secondary">
                Time remaining: {formatTime(paymentTimer)}
              </Typography>
            </Box>
          </Box>
        )
      
      case 'success':
        return (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <SuccessIcon sx={{ fontSize: 60, color: 'success.main', mb: 2 }} />
            <Typography variant="h6" gutterBottom color="success.main">
              Payment Successful!
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Your order has been confirmed and will be processed shortly.
            </Typography>
            
            <Card sx={{ mt: 3, bgcolor: 'success.light' }}>
              <CardContent>
                <Typography variant="h6" color="success.contrastText" gutterBottom>
                  Payment Receipt
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="success.contrastText">
                      Payment ID:
                    </Typography>
                    <Typography variant="body2" color="success.contrastText" sx={{ fontWeight: 600 }}>
                      {paymentDetails.paymentId}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="success.contrastText">
                      Transaction ID:
                    </Typography>
                    <Typography variant="body2" color="success.contrastText" sx={{ fontWeight: 600 }}>
                      {paymentDetails.transactionId}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="success.contrastText">
                      Amount:
                    </Typography>
                    <Typography variant="body2" color="success.contrastText" sx={{ fontWeight: 600 }}>
                      ₹{paymentDetails.amount}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="success.contrastText">
                      Method:
                    </Typography>
                    <Typography variant="body2" color="success.contrastText" sx={{ fontWeight: 600 }}>
                      UPI ({paymentDetails.upiApp})
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="success.contrastText">
                      Time:
                    </Typography>
                    <Typography variant="body2" color="success.contrastText" sx={{ fontWeight: 600 }}>
                      {paymentDetails.processingTime}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="success.contrastText">
                      Status:
                    </Typography>
                    <Chip 
                      label="SUCCESS" 
                      size="small" 
                      color="success" 
                      sx={{ color: 'white' }}
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Box>
        )
      
      case 'failed':
        return (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <ErrorIcon sx={{ fontSize: 60, color: 'error.main', mb: 2 }} />
            <Typography variant="h6" gutterBottom color="error.main">
              Payment Failed
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              {paymentDetails.error || 'Your payment could not be processed. Please try again.'}
            </Typography>
            
            <Card sx={{ mt: 3, bgcolor: 'error.light' }}>
              <CardContent>
                <Typography variant="h6" color="error.contrastText" gutterBottom>
                  Error Details
                </Typography>
                <Typography variant="body2" color="error.contrastText">
                  Payment ID: {paymentDetails.paymentId}
                </Typography>
                <Typography variant="body2" color="error.contrastText">
                  Amount: ₹{paymentDetails.amount}
                </Typography>
                <Typography variant="body2" color="error.contrastText">
                  Time: {paymentDetails.processingTime}
                </Typography>
              </CardContent>
            </Card>
            
            <Button
              variant="contained"
              onClick={handleRetryPayment}
              sx={{ mt: 3 }}
            >
              Retry Payment
            </Button>
          </Box>
        )
      
      default:
        return null
    }
  }

  if (!orderData) return null

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">
            <PaymentIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
            UPI Payment Gateway
          </Typography>
          <IconButton onClick={onClose} disabled={paymentStatus === 'processing'}>
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      
      <DialogContent>
        {paymentStatus === 'pending' && (
          <>
            {/* Order Summary */}
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  <ReceiptIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                  Order Summary
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">Order ID:</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {orderData.trackingId}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">Supplier:</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {orderData.supplierName}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">Items:</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {orderData.materials?.length || 0} items
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">Payment ID:</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {paymentId}
                    </Typography>
                  </Grid>
                </Grid>
                <Divider sx={{ my: 2 }} />
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="h6">Total Amount:</Typography>
                  <Typography variant="h6" color="primary" sx={{ fontWeight: 600 }}>
                    ₹{orderData.totalAmount}
                  </Typography>
                </Box>
              </CardContent>
            </Card>

            {/* Payment Method Selection */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Choose Payment Method
              </Typography>
              <Tabs 
                value={paymentMethod} 
                onChange={(e, newValue) => setPaymentMethod(newValue)}
                sx={{ mb: 2 }}
              >
                <Tab 
                  value="qr" 
                  label="QR Code Payment" 
                  icon={<QRCodeIcon />}
                  iconPosition="start"
                />
                <Tab 
                  value="manual" 
                  label="Manual UPI" 
                  icon={<PaymentIcon />}
                  iconPosition="start"
                />
              </Tabs>
            </Box>

            {/* Payment Content */}
            {paymentMethod === 'qr' ? renderQRCode() : renderManualUPI()}

            {/* Security Notice */}
            <Alert severity="success" sx={{ mt: 2 }}>
              <SecurityIcon sx={{ mr: 1 }} />
              <Typography variant="body2">
                <strong>Secure Payment:</strong> Your payment is protected by UPI's secure infrastructure and bank-grade encryption.
              </Typography>
            </Alert>
          </>
        )}

        {/* Payment Status */}
        {paymentStatus !== 'pending' && renderPaymentStatus()}
      </DialogContent>

      <DialogActions>
        {paymentStatus === 'pending' && (
          <>
            <Button onClick={onClose}>Cancel</Button>
            <Button
              variant="contained"
              onClick={simulatePaymentProcessing}
              startIcon={<PaymentIcon />}
              disabled={!upiId.trim()}
            >
              Proceed to Payment
            </Button>
          </>
        )}
        {paymentStatus === 'success' && (
          <Button
            variant="contained"
            onClick={onClose}
            startIcon={<VerifiedIcon />}
          >
            Continue to Order
          </Button>
        )}
        {paymentStatus === 'failed' && (
          <Button onClick={onClose}>Close</Button>
        )}
      </DialogActions>
    </Dialog>
  )
}

export default UPIPaymentDialog 