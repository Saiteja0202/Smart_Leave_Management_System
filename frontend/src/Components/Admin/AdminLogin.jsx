import { useState, useEffect } from 'react';
import { loginAdmin } from '../ApiCenter/AdminApi';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import {
  Container,
  TextField,
  Button,
  Typography,
  Box,
  CircularProgress,
  Link,
  useMediaQuery,
  useTheme,
  IconButton,
  InputAdornment,
} from '@mui/material';
import { logout } from '../ApiCenter/AuthUtils'; 
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';

const AdminLogin = () => {
  const [loginDetails, setLoginDetails] = useState({
    userName: '',
    password: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  useEffect(() => {
    logout();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setLoginDetails((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await loginAdmin(loginDetails);
      const { token, userId, role, email } = response.data;

      sessionStorage.setItem('token', token);
      sessionStorage.setItem('adminId', userId);
      sessionStorage.setItem('role', role);
      sessionStorage.setItem('email', email);

      Swal.fire({
        icon: 'success',
        title: 'Login Successful',
        text: 'Welcome to the Admin Dashboard!',
        confirmButtonColor: '#3085d6',
      });

      navigate('/admin-dashboard');
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

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  return (
    <Container maxWidth="md">
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
            Admin Login
          </Typography>
          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Username"
              name="userName"
              value={loginDetails.userName}
              onChange={handleChange}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="Password"
              name="password"
              type={showPassword ? 'password' : 'text'} 
              value={loginDetails.password}
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
              disabled={loading}
              sx={{ mt: 2 }}
              size={isMobile ? 'medium' : 'large'}
            >
              {loading ? <CircularProgress size={24} /> : 'Login'}
            </Button>
          </form>
          {/* <Typography align="center" sx={{ mt: 2 }}>
            Don't have an account?{' '}
            <Link href="/admin-register" underline="hover">
              Register here
            </Link>
          </Typography> */}
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
    </Container>
  );
};

export default AdminLogin;
