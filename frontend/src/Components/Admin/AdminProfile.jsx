import { useEffect, useState } from 'react';
import {
  Container, Typography, Box, CircularProgress, Paper, Grid,
  Button, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, IconButton, Divider, Avatar, MenuItem
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import Swal from 'sweetalert2';
import { getAdminDetails, updateAdminDetails } from '../ApiCenter/AdminApi';

const AdminProfile = () => {
  const adminId = sessionStorage.getItem('adminId');
  const [adminData, setAdminData] = useState(null);
  const [editData, setEditData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!adminId) return setError('Admin ID not found in session.'), setLoading(false);
    getAdminDetails(adminId)
      .then(res => {
        setAdminData(res.data);
        setEditData(res.data);
      })
      .catch(() => setError('Failed to load admin profile.'))
      .finally(() => setLoading(false));
  }, [adminId]);

  const handleChange = (e) => setEditData({ ...editData, [e.target.name]: e.target.value });

  const handleUpdate = async () => {
    try {
      await updateAdminDetails(adminId, editData);
      setAdminData(editData);
      setOpen(false);
      Swal.fire({ icon: 'success', title: 'Profile Updated', timer: 2000, showConfirmButton: false });
    } catch {
      Swal.fire('Error', 'Failed to update profile', 'error');
    }
  };

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}><CircularProgress /></Box>;
  if (error) return <Typography color="error" align="center" sx={{ mt: 5 }}>{error}</Typography>;

  const fullName = `${adminData.firstName || ''} ${adminData.lastName || ''}`.trim();
  const firstLetter = adminData?.firstName?.[0]?.toUpperCase() || 'A';

  return (
    <Container maxWidth="100">
      <Paper elevation={4} sx={{ p: 4, mt: 5, borderRadius: 3, backgroundColor: '#fff' }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
          <Avatar sx={{ bgcolor: '#0288d1', width: 80, height: 80, fontSize: 32, mb: 1 }}>{firstLetter}</Avatar>
          <Typography variant="h5" sx={{ color: '#183c86', fontWeight: 'bold' }}>{fullName || 'Admin'}</Typography>
          <Typography variant="body2" color="text.secondary">Administrator</Typography>
          <IconButton color="primary" sx={{ mt: 1 }} onClick={() => setOpen(true)}><EditIcon /></IconButton>
        </Box>

        <Divider sx={{ my: 2 }} />

        {[
          { title: 'Personal Information', fields: [['First Name', 'firstName'], ['Last Name', 'lastName'], ['Gender', 'gender']] },
          { title: 'Contact Information', fields: [['Email', 'email'], ['Phone', 'phoneNumber'], ['Address', 'address']] },
          { title: 'Account Details', fields: [['Username', 'userName']] },
        ].map((section, idx) => (
          <Box key={idx} sx={{ mt: idx ? 3 : 0 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: '#0288d1', mb: 1 }}>{section.title}</Typography>
            <Grid container spacing={2}>
              {section.fields.map(([label, key]) => (
                <Grid item xs={12} sm={key === 'address' ? 12 : 6} key={key}>
                  <Typography><strong>{label}:</strong> {adminData[key]}</Typography>
                </Grid>
              ))}
            </Grid>
          </Box>
        ))}
      </Paper>

      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Edit Profile</DialogTitle>
        <DialogContent>
          {['userName', 'email', 'firstName', 'lastName', 'phoneNumber', 'address'].map((field) => (
            <TextField
              key={field}
              fullWidth
              margin="normal"
              label={field.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
              name={field}
              value={editData[field] || ''}
              onChange={handleChange}
            />
          ))}
          <TextField
            fullWidth
            select
            label="Gender"
            name="gender"
            value={editData.gender || ''}
            onChange={handleChange}
            margin="normal"
            required
          >
            <MenuItem value="MALE">Male</MenuItem>
            <MenuItem value="FEMALE">Female</MenuItem>
            <MenuItem value="TRANS">Trans</MenuItem>
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleUpdate}>Save Changes</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default AdminProfile;
