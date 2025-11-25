import { useEffect, useState } from 'react';
import {
  Typography,
  CircularProgress,
  Paper,
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
  Avatar,
  Divider,
  Tooltip,
  FormControl,      
  InputLabel,     
  Select,       
  MenuItem 
} from '@mui/material';
import { Edit, Delete, LockReset } from '@mui/icons-material';
import Swal from 'sweetalert2';
import {
  getUserDetails,
  updateUserDetails,
  deleteAccount,
  updatePassword,
  generateOtpForPassword,
  verifyOtpForPassword,
} from '../ApiCenter/UserApi';
import { getAllCities } from '../ApiCenter/UserApi';
import { useNavigate } from 'react-router-dom';

const UserProfile = () => {
  const [user, setUser] = useState(null);
  const [editData, setEditData] = useState({});
  const [openDialog, setOpenDialog] = useState(false);
  const [openEmailDialog, setOpenEmailDialog] = useState(false);
  const [openOtpDialog, setOpenOtpDialog] = useState(false);
  const [openPasswordDialog, setOpenPasswordDialog] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [cities, setCities] = useState([]);
  const [loadingCities, setLoadingCities] = useState(false);
  const [passwordData, setPasswordData] = useState({ oldPassword: '', newPassword: '' });

  const userId = sessionStorage.getItem('userId');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await getUserDetails(userId);
        setUser(res.data);
      } catch {
        setUser(null);
      }
    };
    fetchUser();
  }, [userId]);

  const handleOpenDialog = () => {
    setEditData(user);
    setOpenDialog(true);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditData((prev) => ({ ...prev, [name]: value }));
  };

  useEffect(() => {
    const country = editData.countryName || user?.countryName;
    if (!country) return;
  
    const fetchCities = async () => {
      setLoadingCities(true);
      try {
        const res = await getAllCities(country);
        console.log('Fetched cities for:', country, res.data);
        // Since API returns an array like ["Delhi", "Mumbai"], use it directly
        setCities(res.data || []);
      } catch (err) {
        console.error('Failed to load cities:', err);
        setCities([]);
      } finally {
        setLoadingCities(false);
      }
    };
  
    fetchCities();
  }, [user?.countryName, editData.countryName]);
  
  
  

  const handleUpdate = async () => {
    try {
      await updateUserDetails(userId, editData);
      Swal.fire('Updated', 'Profile updated successfully', 'success');
      setOpenDialog(false);
      const res = await getUserDetails(userId);
      setUser(res.data);
    } catch {
      Swal.fire('Error', 'Failed to update profile', 'error');
    }
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({ ...prev, [name]: value }));
  };

  const handleEmailSubmit = async () => {
    if (!email) return Swal.fire('Error', 'Please enter your email', 'error');
    setOtpLoading(true);
    try {
      await generateOtpForPassword({ email });
      Swal.fire('OTP Sent', 'Check your email for the OTP', 'success');
      setOpenEmailDialog(false);
      setOpenOtpDialog(true);
    } catch {
      Swal.fire('Error', 'Failed to generate OTP', 'error');
    } finally {
      setOtpLoading(false);
    }
  };

  const handleOtpSubmit = async () => {
    if (!otp) return Swal.fire('Error', 'Please enter the OTP', 'error');
    setOtpLoading(true);
    try {
      await verifyOtpForPassword({ otp });
      Swal.fire('Verified', 'OTP verified successfully', 'success');
      setOpenOtpDialog(false);
      setOpenPasswordDialog(true);
    } catch {
      Swal.fire('Error', 'Invalid OTP', 'error');
    } finally {
      setOtpLoading(false);
    }
  };

  const handlePasswordUpdate = async () => {
    const { oldPassword, newPassword } = passwordData;
    if (!oldPassword || !newPassword) {
      return Swal.fire('Error', 'Please fill in both password fields', 'error');
    }
    try {
      await updatePassword(userId, passwordData);
      Swal.fire('Success', 'Password updated successfully', 'success');
      setOpenPasswordDialog(false);
      setPasswordData({ oldPassword: '', newPassword: '' });
    } catch {
      Swal.fire('Error', 'Failed to update password', 'error');
    }
  };

  const handleDelete = async () => {
    const confirm = await Swal.fire({
      title: 'Are you sure?',
      text: 'This will permanently delete your account.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
    });
    if (confirm.isConfirmed) {
      try {
        await deleteAccount(userId);
        Swal.fire('Deleted', 'Your account has been deleted.', 'success');
        sessionStorage.clear();
        navigate('/user-login');
      } catch {
        Swal.fire('Error', 'Failed to delete account', 'error');
      }
    }
  };

  if (!user) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}>
        <CircularProgress />
      </Box>
    );
  }

  const firstLetter = user.firstName?.charAt(0)?.toUpperCase() || 'U';

  return (
    <Paper
      elevation={3}
      sx={{
        p: { xs: 2, sm: 4 },
        borderRadius: 4,
        background: 'linear-gradient(180deg, #ffffff 0%, #f7f9fc 100%)',
        boxShadow: 3,
        animation: 'fadeIn 0.6s ease-in-out',
        '@keyframes fadeIn': {
          from: { opacity: 0, transform: 'translateY(15px)' },
          to: { opacity: 1, transform: 'translateY(0)' },
        },
      }}
    >
      <Box textAlign="center" mb={3}>
        <Avatar sx={{ bgcolor: '#0288d1', width: 80, height: 80, mx: 'auto', mb: 1, fontSize: 32 }}>
          {firstLetter}
        </Avatar>
        <Typography variant="h5" fontWeight="bold" color="#183c86">
          {user.firstName} {user.lastName}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {user.userName}
        </Typography>
      </Box>

      <Divider sx={{ mb: 3 }} />
      <Box sx={{ display: 'flex', justifyContent: 'center' }}>
  <Grid container spacing={2} sx={{ maxWidth: 1000 }}>
    {[
      ['Email', user.email],
      ['Phone', user.phoneNumber],
      ['Gender', user.gender],
      ['Country', user.countryName],
      ['City',user.cityName],
      ['Address', user.address],
      
    ].map(([label, value], i) => (
      <Grid item xs={12} sm={i < 4 ? 6 : 12} key={label}>
        <Typography>
          <strong>{label}:</strong> {value}
        </Typography>
      </Grid>
    ))}
  </Grid>
</Box>

      <Box mt={4} display="flex" flexWrap="wrap" gap={2} justifyContent="center">
        <Tooltip title="Edit Profile">
          <Button variant="contained" startIcon={<Edit />} onClick={handleOpenDialog}>
            Update Profile
          </Button>
        </Tooltip>
        <Tooltip title="Change Password">
          <Button variant="outlined" startIcon={<LockReset />} onClick={() => setOpenEmailDialog(true)}>
            Change Password
          </Button>
        </Tooltip>
        <Tooltip title="Delete Account">
          <Button variant="outlined" color="error" startIcon={<Delete />} onClick={handleDelete}>
            Delete Account
          </Button>
        </Tooltip>
      </Box>

      {/* Edit Profile Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} fullWidth>
        <DialogTitle>Edit Profile</DialogTitle>
        <DialogContent>
          {['firstName', 'lastName', 'email', 'phoneNumber', 'address'].map((field) => (
            <TextField
              key={field}
              fullWidth
              label={field.replace(/([A-Z])/g, ' $1')}
              name={field}
              value={editData[field] || ''}
              onChange={handleChange}
              margin="normal"
            />
          ))}

          {/* City Dropdown */}
          {/* City Dropdown */}
<TextField
  fullWidth
  select
  label="City"
  name="cityName"
  value={editData.cityName || ''}
  onChange={handleChange}
  margin="normal"
  required
>
  {loadingCities ? (
    <MenuItem disabled>
      <CircularProgress size={20} />
    </MenuItem>
  ) : (
    cities.map((city) => (
      <MenuItem key={city} value={city}>
        {city}
      </MenuItem>
    ))
  )}
</TextField>

        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button onClick={handleUpdate} variant="contained">Save</Button>
        </DialogActions>
      </Dialog>


      {/* Email Dialog */}
      <Dialog open={openEmailDialog} onClose={() => setOpenEmailDialog(false)}>
        <DialogTitle>Enter Email to Receive OTP</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            margin="normal"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenEmailDialog(false)}>Cancel</Button>
          <Button onClick={handleEmailSubmit} variant="contained" disabled={otpLoading}>
          {otpLoading ? <CircularProgress size={24} color="inherit" /> : 'Send OTP'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* OTP Dialog */}
      <Dialog open={openOtpDialog} onClose={() => setOpenOtpDialog(false)}>
        <DialogTitle>Enter OTP</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            margin="normal"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenOtpDialog(false)}>Cancel</Button>
          <Button onClick={handleOtpSubmit} variant="contained" disabled={otpLoading}>
            {otpLoading ? <CircularProgress size={24} color="inherit" /> : 'Verify OTP'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Password Dialog */}
      <Dialog open={openPasswordDialog} onClose={() => setOpenPasswordDialog(false)}>
        <DialogTitle>Change Password</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Old Password"
            name="oldPassword"
            type="password"
            value={passwordData.oldPassword}
            onChange={handlePasswordChange}
            margin="normal"
          />
          <TextField
            fullWidth
            label="New Password"
            name="newPassword"
            type="password"
            value={passwordData.newPassword}
            onChange={handlePasswordChange}
            margin="normal"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenPasswordDialog(false)}>Cancel</Button>
          <Button onClick={handlePasswordUpdate} variant="contained">
            Update
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default UserProfile;
