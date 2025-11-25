import React, { useEffect, useState } from 'react';
import {
  Box, Typography, CircularProgress, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Paper, TextField, TablePagination,
  IconButton, useMediaQuery, Button
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { registrationHistory } from '../ApiCenter/AdminApi';
import DownloadIcon from '@mui/icons-material/Download';

const AdminRegistrationHistory = () => {
  const [history, setHistory] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [sortField, setSortField] = useState('registrationId');
  const [sortOrder, setSortOrder] = useState('asc');

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  useEffect(() => {
    registrationHistory()
      .then((res) => {
        setHistory(res.data);
        setFiltered(res.data);
      })
      .catch((err) => console.error('Failed to fetch registration history:', err))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const filteredData = history.filter((entry) =>
      Object.values(entry).some((val) =>
        String(val).toLowerCase().includes(search.toLowerCase())
      )
    );
    setFiltered(filteredData);
  }, [search, history]);

  const handleSort = (field) => {
    const order = sortField === field && sortOrder === 'asc' ? 'desc' : 'asc';
    setSortField(field);
    setSortOrder(order);
    const sorted = [...filtered].sort((a, b) => {
      const valA = a[field];
      const valB = b[field];
      return order === 'asc'
        ? valA > valB ? 1 : -1
        : valA < valB ? 1 : -1;
    });
    setFiltered(sorted);
  };

  const handleDownload = () => {
    const csv = [
      ['Reg. ID', 'First Name', 'Last Name', 'User ID', 'Email', 'Role', 'Registered On'],
      ...filtered.map((r) => [
        r.registrationId, r.firstName, r.lastName, r.userId,
        r.email, r.role, new Date(r.registerDate).toLocaleString()
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'registration_history.csv';
    link.click();
  };

  return (
    <Box sx={{ mt: 6, mb: 5, px: isMobile ? 1 : 6 }}>
      <Box sx={{ background: 'linear-gradient(to right, #183c86, #5c6bc0)', borderRadius: 3, p: 2, textAlign: 'center', mb: 4 }}>
        <Typography variant={isMobile ? 'h6' : 'h5'} sx={{ color: 'white', fontWeight: 'bold' }}>
          Registration History
        </Typography>
      </Box>

      <Box sx={{ mb: 2, display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: 2, alignItems: 'center' }}>
        <TextField
          label="Search"
          variant="outlined"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          fullWidth={isMobile}
        />
        <Button variant="contained" startIcon={<DownloadIcon />} onClick={handleDownload}>
          Download
        </Button>
      </Box>

      <TableContainer component={Paper} sx={{ borderRadius: 3 }}>
        {loading ? (
          <Box display="flex" justifyContent="center" py={5}>
            <CircularProgress />
          </Box>
        ) : filtered.length === 0 ? (
          <Typography align="center" sx={{ p: 4, color: 'gray' }}>
            No registration records found.
          </Typography>
        ) : (
          <>
            <Table stickyHeader size={isMobile ? 'small' : 'medium'}>
              <TableHead>
                <TableRow sx={{ backgroundColor: '#e3eafc' }}>
                  {[
                    'registrationId',
                    'firstName',
                    'lastName',
                    // 'userId',
                    'email',
                    'role',
                    'registerDate'
                  ].map((field) => (
                    <TableCell
                      key={field}
                      align="center"
                      sx={{ fontWeight: 'bold', cursor: 'pointer' }}
                      onClick={() => handleSort(field)}
                    >
                      {field === 'registerDate' ? 'Registered On' : field.replace(/([A-Z])/g, ' $1')}
                      {sortField === field ? (sortOrder === 'asc' ? ' ↑' : ' ↓') : ''}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {filtered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((entry) => (
                  <TableRow key={entry.registrationId}>
                    <TableCell align="center">{entry.registrationId}</TableCell>
                    <TableCell align="center">{entry.firstName}</TableCell>
                    <TableCell align="center">{entry.lastName}</TableCell>
                    {/* <TableCell align="center">{entry.userId}</TableCell> */}
                    <TableCell align="center">{entry.email}</TableCell>
                    <TableCell align="center">{entry.role.replace(/_/g, ' ')}</TableCell>
                    <TableCell align="center">{new Date(entry.registerDate).toLocaleString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <TablePagination
              component="div"
              count={filtered.length}
              page={page}
              onPageChange={(e, newPage) => setPage(newPage)}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={(e) => {
                setRowsPerPage(parseInt(e.target.value, 10));
                setPage(0);
              }}
              rowsPerPageOptions={[10, 25, 50]}
            />
          </>
        )}
      </TableContainer>
    </Box>
  );
};

export default AdminRegistrationHistory;
