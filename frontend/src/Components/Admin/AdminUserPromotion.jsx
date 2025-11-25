import { useEffect, useState } from 'react';
import {
  Container, Paper, Typography, CircularProgress, Dialog, DialogTitle,
  DialogContent, DialogActions, MenuItem, Select, List, ListItem,
  ListItemText, Button, Box, Divider, TextField, TablePagination, Grid
} from '@mui/material';
import Swal from 'sweetalert2';
import { getAllUsers, promoteUser } from '../ApiCenter/AdminApi';

const rolePromotionMap = {
  TEAM_MEMBER: ['TEAM_LEAD', 'TEAM_MANAGER', 'HR_MANAGER'],
  TEAM_LEAD: ['TEAM_MANAGER', 'HR_MANAGER'],
  TEAM_MANAGER: ['HR_MANAGER'],
};

const AdminUserPromotion = () => {
  const adminId = sessionStorage.getItem('adminId');
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [newRole, setNewRole] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortKey, setSortKey] = useState('firstName');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  useEffect(() => {
    getAllUsers()
      .then(res => {
        setUsers(res.data);
        setFilteredUsers(res.data);
      })
      .catch(() => Swal.fire('Error', 'Failed to fetch users', 'error'))
      .finally(() => setLoadingUsers(false));
  }, []);

  useEffect(() => {
    const filtered = users.filter(u =>
      `${u.firstName} ${u.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const sorted = [...filtered].sort((a, b) => {
      const aVal = getSortValue(a, sortKey);
      const bVal = getSortValue(b, sortKey);
      return aVal.localeCompare(bVal);
    });

    setFilteredUsers(sorted);
    setPage(0);
  }, [searchTerm, sortKey, users]);

  const getSortValue = (user, key) => {
    if (key === 'role') return user.role?.roleName || user.userRole || '';
    return user[key] || '';
  };

  const handlePromoteClick = (user) => {
    setSelectedUser(user);
    setNewRole('');
    setDialogOpen(true);
  };

  const handlePromoteConfirm = async () => {
    if (!newRole) return Swal.fire('Error', 'Please select a new role', 'error');
    setLoading(true);
    try {
      await promoteUser(adminId, selectedUser.userId, newRole);
      Swal.fire('Success', 'User promotion completed.', 'success');
      setDialogOpen(false);
      const res = await getAllUsers();
      setUsers(res.data);
    } catch {
      Swal.fire('Error', 'Promotion failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  const getAvailableRoles = (currentRole) => rolePromotionMap[currentRole] || [];

  const handleDownload = () => {
    const header = 'ID,Name,Email,Role,Country,Gender\n';
    const rows = filteredUsers.map(u =>
      `${u.userId},"${u.firstName} ${u.lastName}",${u.email},"${u.role?.roleName || u.userRole}",${u.countryName},${u.gender}`
    ).join('\n');
    const csvContent = header + rows;
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'user_list.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 6 }}>
      <Box sx={{ background: 'linear-gradient(to right, #183c86, #5c6bc0)', borderRadius: 2, p: 2, mb: 3 }}>
        <Typography variant="h5" align="center" sx={{ fontWeight: 'bold', color: 'white' }}>
          User Promotion Panel
        </Typography>
      </Box>

      <Paper elevation={4} sx={{ p: 3, borderRadius: 3 }}>
        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Search by name or email"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </Grid>
          <Grid item xs={6} sm={3}>
            <Select fullWidth value={sortKey} onChange={(e) => setSortKey(e.target.value)}>
              <MenuItem value="firstName">Sort by Name</MenuItem>
              <MenuItem value="role">Sort by Role</MenuItem>
              <MenuItem value="countryName">Sort by Country</MenuItem>
            </Select>
          </Grid>
          <Grid item xs={6} sm={3}>
  <Button
    variant="outlined"
    fullWidth
    onClick={handleDownload}
    sx={{
      py: 1.6,
      fontSize: '1rem',
      fontWeight: 'bold' 
    }}
  >
    Download
  </Button>
</Grid>

        </Grid>

        {loadingUsers ? (
          <Box display="flex" justifyContent="center" minHeight="150px"><CircularProgress /></Box>
        ) : filteredUsers.length === 0 ? (
          <Typography align="center" color="text.secondary">No users found.</Typography>
        ) : (
          <>
            <List>
              {filteredUsers.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((user) => {
                const currentRole = user.role?.roleName || user.userRole;
                return (
                  <Paper key={user.userId} elevation={2} sx={{ mb: 2, p: 2 }}>
                    <ListItem
                      divider
                      secondaryAction={
                        <Button
                          variant="contained"
                          onClick={() => handlePromoteClick(user)}
                          disabled={!getAvailableRoles(currentRole).length}
                        >
                          Promote
                        </Button>
                      }
                    >
                      <ListItemText
                        primary={`${user.firstName} ${user.lastName} (ID: ${user.userId})`}
                        secondary={`Email: ${user.email} | Role: ${currentRole.replace(/_/g, ' ')} | Country: ${user.countryName} | Gender: ${user.gender}`}
                      />
                    </ListItem>
                  </Paper>
                );
              })}
            </List>
            <TablePagination
              component="div"
              count={filteredUsers.length}
              page={page}
              onPageChange={(e, newPage) => setPage(newPage)}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={(e) => setRowsPerPage(parseInt(e.target.value, 10))}
              rowsPerPageOptions={[5, 10, 20]}
            />
          </>
        )}
      </Paper>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)}>
        <DialogTitle>Promote User</DialogTitle>
        <DialogContent>
          <Typography gutterBottom>
            Promote <strong>{selectedUser?.firstName} {selectedUser?.lastName}</strong> from{' '}
            <strong>{selectedUser?.role?.roleName.replace(/_/g, ' ') || selectedUser?.userRole.replace(/_/g, ' ')}</strong> to:
          </Typography>
          <Select fullWidth value={newRole} onChange={(e) => setNewRole(e.target.value)} displayEmpty>
            <MenuItem value="" disabled>Select new role</MenuItem>
            {getAvailableRoles(selectedUser?.role?.roleName || selectedUser?.userRole).map((role) => (
              <MenuItem key={role} value={role}>{role.replace(/_/g, ' ')}</MenuItem>
            ))}
          </Select>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)} disabled={loading}>Cancel</Button>
          <Button onClick={handlePromoteConfirm} variant="contained" disabled={loading}>
            {loading ? <CircularProgress size={20} /> : 'Confirm'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default AdminUserPromotion;
