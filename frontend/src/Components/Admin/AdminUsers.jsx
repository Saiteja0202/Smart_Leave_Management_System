import { useEffect, useState } from 'react';
import {
  Container, Typography, CircularProgress, Paper, List, ListItem,
  ListItemText, IconButton, Box, Divider, TextField, Select, MenuItem,
  Grid, TablePagination, Button
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import Swal from 'sweetalert2';
import { getAllUsers, deleteUser } from '../ApiCenter/AdminApi';

const AdminUsers = () => {
  const adminId = sessionStorage.getItem('adminId');
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
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
      .catch(() => setUsers([]))
      .finally(() => setLoading(false));
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

  const handleDelete = async (userId) => {
    const confirm = await Swal.fire({
      title: 'Are you sure?',
      text: 'This will permanently delete the user.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
      confirmButtonColor: '#d33',
    });

    if (confirm.isConfirmed) {
      try {
        await deleteUser(adminId, userId);
        Swal.fire('Deleted!', 'User has been deleted.', 'success');
        const res = await getAllUsers();
        setUsers(res.data);
      } catch {
        Swal.fire('Error', 'Failed to delete user.', 'error');
      }
    }
  };

  const handleDownload = () => {
    const header = 'ID,Name,Email,Role,Country,Gender\n';
    const rows = filteredUsers.map(u =>
      `${u.userId},"${u.firstName} ${u.lastName}",${u.email},"${u.role?.roleName || u.userRole}",${u.countryName},${u.gender}`
    ).join('\n');
    const blob = new Blob([header + rows], { type: 'text/csv;charset=utf-8;' });
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
          Manage Users
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
              sx={{ py: 1.6, fontSize: '1rem', fontWeight: 'bold' }}
            >
              Download
            </Button>
          </Grid>
        </Grid>

        {loading ? (
          <Box display="flex" justifyContent="center" minHeight="150px"><CircularProgress /></Box>
        ) : filteredUsers.length === 0 ? (
          <Typography align="center" color="text.secondary">No users found.</Typography>
        ) : (
          <>
            <List>
              {filteredUsers.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map(({ userId, firstName, lastName, email, role, userRole, countryName, gender }) => (
                <Paper
                  key={userId}
                  elevation={2}
                  sx={{
                    mb: 2, borderRadius: 2, p: 2, backgroundColor: '#fff',
                    '&:hover': { boxShadow: 6, transform: 'scale(1.01)', transition: '0.2s ease-in-out' },
                  }}
                >
                  <ListItem
                    divider
                    secondaryAction={
                      <IconButton
                        edge="end"
                        onClick={() => handleDelete(userId)}
                        sx={{
                          color: '#d32f2f',
                          '&:hover': { color: '#b71c1c', transform: 'scale(1.2)' },
                          transition: '0.2s ease',
                        }}
                      >
                        <DeleteIcon />
                      </IconButton>
                    }
                  >
                    <ListItemText
                      primary={
                        <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#183c86' }}>
                          {firstName} {lastName} (ID: {userId})
                        </Typography>
                      }
                      secondary={
                        <>
                          <Typography variant="body2" color="text.secondary">
                            Email: {email} | Role: {role?.roleName.replace(/_/g, ' ') || userRole.replace(/_/g, ' ')}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Country: {countryName} | Gender: {gender}
                          </Typography>
                        </>
                      }
                    />
                  </ListItem>
                </Paper>
              ))}
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
    </Container>
  );
};

export default AdminUsers;
