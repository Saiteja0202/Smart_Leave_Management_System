import { useState, useEffect } from 'react';
import {
  Container,
  TextField,
  Button,
  Typography,
  Box,
  CircularProgress,
  useMediaQuery,
  useTheme,
  Link,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';
import { logout } from '../ApiCenter/AuthUtils';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import {
  loginUser,
  generateOtpForUsername,
  generateOtpForPassword,
  verifyOtpForUsername,
  verifyOtpForPassword,
  updateNewPassword,
} from '../ApiCenter/UserApi';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';



const UserLogin = () => {
  const [formData, setFormData] = useState({ userName: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [dialogType, setDialogType] = useState(null); 
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [showNewPasswordDialog, setShowNewPasswordDialog] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [verifiedUserId, setVerifiedUserId] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const togglePasswordVisibility = () => setShowPassword((prev) => !prev);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const navigate = useNavigate();

  useEffect(() => {
    logout();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    return formData.userName.trim() && formData.password.trim();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await loginUser(formData);
      const { token, userId, role } = response.data;

      sessionStorage.setItem('token', token);
      sessionStorage.setItem('userId', userId);
      sessionStorage.setItem('role', role);

      await Swal.fire({
        icon: 'success',
        title: 'Login Successful',
        confirmButtonColor: '#3085d6',
      });

      navigate('/user-dashboard');
    } catch (error) {
      const status = error.response?.status;
      const message = error.response?.data || 'Login failed. Please try again.';
      Swal.fire({
        icon: 'error',
        title: `Error ${status || ''}`,
        text: message,
        confirmButtonColor: '#d33',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleForgot = (type) => {
    setDialogType(type);
    setEmail('');
    setOtp('');
    setOtpSent(false);
  };

  const handleSendOtp = async () => {
    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      Swal.fire('Invalid Email', 'Please enter a valid email address.', 'warning');
      return;
    }

    setOtpLoading(true);

    try {
      if (dialogType === 'username') {
        await generateOtpForUsername({ email });
      } else {
        await generateOtpForPassword({ email });
      }
      setOtpSent(true);
    } catch {
      Swal.fire('Error', 'Failed to send OTP. Please try again.', 'error');
    } finally {
      setOtpLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp || otp.length < 4) {
      Swal.fire('Invalid OTP', 'Please enter a valid OTP.', 'warning');
      return;
    }

    try {
      if (dialogType === 'username') {
        const res = await verifyOtpForUsername({ otp });
        Swal.fire('Username Retrieved', `${res.data}`, 'info');
        setDialogType(null);
      } else {
        const res = await verifyOtpForPassword({ otp });
        const userIdMatch = res.data.match(/UserId\s*:\s*(\d+)/);
        if (userIdMatch && userIdMatch[1]) {
          const userId = parseInt(userIdMatch[1], 10);
          setVerifiedUserId(userId);
          Swal.fire('OTP Verified', 'Please enter your new password.', 'info');
          setDialogType(null);
          setShowNewPasswordDialog(true);
        } else {
          throw new Error('UserId not found in response');
        }
      }
    } catch {
      Swal.fire('Error', 'Invalid OTP. Please try again.', 'error');
    }
  };

  const handleUpdatePassword = async () => {
    if (!newPassword || newPassword.length < 6) {
      Swal.fire('Invalid Password', 'Password must be at least 6 characters.', 'warning');
      return;
    }

    try {
      await updateNewPassword(verifiedUserId, { newPassword });
      Swal.fire('Success', 'Your password has been updated.', 'success');
      setShowNewPasswordDialog(false);
    } catch {
      Swal.fire('Error', 'Failed to update password.', 'error');
    }
  };

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          px: 2,
        }}
      >
        <Box
          sx={{
            width: '100%',
            maxWidth: 500,
            p: isMobile ? 3 : 5,
            boxShadow: 3,
            borderRadius: 3,
            backgroundColor: '#fff',
          }}
        >
          <Typography variant={isMobile ? 'h5' : 'h4'} align="center" gutterBottom sx={{ color: '#183c86', fontWeight: 'bold' }}>
            User Login
          </Typography>
          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Username"
              name="userName"
              value={formData.userName}
              onChange={handleChange}
              margin="normal"
              required
            />
            <TextField
  fullWidth
  label="Password"
  name="password"
  type={showPassword ? 'password' : 'text'}  // reversed logic
  value={formData.password}
  onChange={handleChange}
  margin="normal"
  required
  InputProps={{
    endAdornment: (
      <InputAdornment position="end">
        <IconButton onClick={() => setShowPassword((prev) => !prev)} edge="end">
          {showPassword ? <Visibility /> : <VisibilityOff />}
        </IconButton>
      </InputAdornment>
    ),
  }}
/>

            <Button
              fullWidth
              type="submit"
              variant="contained"
              color="primary"
              disabled={!validateForm() || loading}
              sx={{ mt: 2 }}
              size={isMobile ? 'medium' : 'large'}
            >
              {loading ? <CircularProgress size={24} /> : 'Login'}
            </Button>
          </form>

          <Typography align="center" sx={{ mt: 2 }}>
            <Link component="button" onClick={() => handleForgot('username')} underline="hover">
              Forgot Username
            </Link>{' '}
            |{' '}
            <Link component="button" onClick={() => handleForgot('password')} underline="hover">
              Forgot Password
            </Link>
          </Typography>

          <Typography align="center" sx={{ mt: 2 }}>
            Don't have an account?{' '}
            <Link href="/user-registration" underline="hover">
              Register here
            </Link>
          </Typography>
          <Typography align="center" sx={{ mt: 2 }}>
  <Button
    variant="outlined"
    startIcon={<ArrowBackIcon />}
    href="/"
  >
    Back to Home
  </Button>
</Typography>
        </Box>
      </Box>

      {/* OTP Dialog */}
      <Dialog open={!!dialogType} onClose={() => setDialogType(null)}>
        <DialogTitle>{otpSent ? 'Verify OTP' : `Recover ${dialogType === 'username' ? 'Username' : 'Password'}`}</DialogTitle>
        <DialogContent>
          {!otpSent ? (
            <TextField
              fullWidth
              label="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              margin="normal"
              type="email"
            />
          ) : (
            <TextField
              fullWidth
              label="Enter OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              margin="normal"
              type="number"
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogType(null)}>Cancel</Button>
          <Button
            onClick={otpSent ? handleVerifyOtp : handleSendOtp}
            variant="contained"
            disabled={otpLoading}
          >
            {otpLoading ? <CircularProgress size={24} color="inherit" /> : otpSent ? 'Verify OTP' : 'Send OTP'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* New Password Dialog */}
      <Dialog open={showNewPasswordDialog} onClose={() => setShowNewPasswordDialog(false)}>
        <DialogTitle>Set New Password</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="New Password"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            margin="normal"          />
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setShowNewPasswordDialog(false)}>Cancel</Button>
              <Button onClick={handleUpdatePassword} variant="contained">
                Update Password
              </Button>
            </DialogActions>
          </Dialog>
        </Container>
      );
    };
    
    export default UserLogin;
    
