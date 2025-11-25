import { useEffect, useState } from 'react';
import {
  Box, Button, Typography, CircularProgress, Container, Paper,
  FormControl, InputLabel, Select, MenuItem, TextField, Divider,
  Card, CardContent
} from '@mui/material';
import Swal from 'sweetalert2';
import { addNewRole, getAllRoles } from '../ApiCenter/AdminApi';

const predefinedRoles = [
  { roleName: 'TEAM_MEMBER', description: 'Team Member' },
  { roleName: 'TEAM_LEAD', description: 'Team Lead' },
  { roleName: 'TEAM_MANAGER', description: 'Team Manager' },
  { roleName: 'HR_MANAGER', description: 'HR Manager' },
];

const AdminAddRoles = () => {
  const adminId = sessionStorage.getItem('adminId');
  const [selectedRole, setSelectedRole] = useState('');
  const [customDescription, setCustomDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [existingRoles, setExistingRoles] = useState([]);
  const [fetchingRoles, setFetchingRoles] = useState(true);

  useEffect(() => {
    if (!adminId) return;
    getAllRoles(adminId)
      .then(res => setExistingRoles(res.data))
      .catch(() => setExistingRoles([]))
      .finally(() => setFetchingRoles(false));
  }, [adminId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const defaultRole = predefinedRoles.find(r => r.roleName === selectedRole);
    const roleObj = {
      roleName: selectedRole,
      description: customDescription || defaultRole?.description || '',
    };
    try {
      await addNewRole(adminId, roleObj);
      Swal.fire('Success', 'Role added successfully', 'success');
      setSelectedRole('');
      setCustomDescription('');
      const res = await getAllRoles(adminId);
      setExistingRoles(res.data);
    } catch {
      Swal.fire('Error', 'Failed to add role', 'error');
    } finally {
      setLoading(false);
    }
  };

  const existingRoleNames = existingRoles.map(r => r.roleName);

  return (
    <Container maxWidth="100">
      <Paper elevation={4} sx={{ p: 4, mt: 5, borderRadius: 4, background: '#fff' }}>
        <Box sx={{ background: 'linear-gradient(to right, #183c86, #5c6bc0)', borderRadius: 2, p: 2, mb: 3 }}>
          <Typography variant="h5" align="center" sx={{ color: '#fff', fontWeight: 'bold' }}>
            Add New Role
          </Typography>
        </Box>

        <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <FormControl fullWidth required>
            <InputLabel>Select Role</InputLabel>
            <Select value={selectedRole} onChange={(e) => setSelectedRole(e.target.value)} label="Select Role">
              {predefinedRoles.map(({ roleName, description }) => (
                <MenuItem key={roleName} value={roleName} disabled={existingRoleNames.includes(roleName)}>
                  {description}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            fullWidth
            label="Description"
            value={customDescription}
            onChange={(e) => setCustomDescription(e.target.value)}
            placeholder="Optional: Customize role description"
            multiline
            rows={2}
          />

          <Button
            type="submit"
            variant="contained"
            disabled={loading || !selectedRole}
            sx={{
              mt: 2,
              py: 1.3,
              backgroundColor: '#183c86',
              fontWeight: 'bold',
              '&:hover': { backgroundColor: '#102a60', transform: 'scale(1.02)', transition: '0.3s' },
            }}
          >
            {loading ? <CircularProgress size={24} sx={{ color: '#fff' }} /> : 'Add Role'}
          </Button>
        </Box>

        <Divider sx={{ my: 4 }} />
        <Typography variant="h6" sx={{ color: '#183c86', fontWeight: 'bold', mb: 2 }}>
          Existing Roles
        </Typography>

        {fetchingRoles ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}><CircularProgress /></Box>
        ) : existingRoles.length === 0 ? (
          <Typography align="center" color="text.secondary">No roles found.</Typography>
        ) : (
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: 2 }}>
            {existingRoles.map(({ roleId, roleName, description }) => (
              <Card key={roleId} sx={{
                borderRadius: 3,
                boxShadow: '0 3px 8px rgba(0,0,0,0.08)',
                '&:hover': { transform: 'scale(1.03)', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' },
              }}>
                <CardContent>
                  <Typography variant="subtitle1" fontWeight="bold" color="#183c86">{roleName.replace(/_/g, ' ')}</Typography>
                  <Typography variant="body2" color="text.secondary">{description}</Typography>
                </CardContent>
              </Card>
            ))}
          </Box>
        )}
      </Paper>
    </Container>
  );
};

export default AdminAddRoles;
