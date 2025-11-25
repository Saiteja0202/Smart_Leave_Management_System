import { useEffect, useState } from 'react';
import { getUserHolidays } from '../ApiCenter/UserApi';
import {
  Paper, Typography, CircularProgress, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, Box,
  TablePagination
} from '@mui/material';

const UserHolidays = () => {
  const userId = sessionStorage.getItem('userId');
  const [holidays, setHolidays] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [sortField, setSortField] = useState('holidayDate');
  const [sortOrder, setSortOrder] = useState('asc');

  useEffect(() => {
    (async () => {
      try {
        const res = await getUserHolidays(userId);
        setHolidays(res.data);
      } catch {
        setHolidays([]);
      } finally {
        setLoading(false);
      }
    })();
  }, [userId]);

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return {
      dateFormatted: date.toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' }),
      day: date.toLocaleDateString('en-IN', { weekday: 'long' })
    };
  };

  const handleSort = (field) => {
    const order = sortField === field && sortOrder === 'asc' ? 'desc' : 'asc';
    setSortField(field);
    setSortOrder(order);
  };

  const sortedHolidays = [...holidays].sort((a, b) => {
    const valA = sortField === 'holidayDate' ? new Date(a[sortField]) : a[sortField];
    const valB = sortField === 'holidayDate' ? new Date(b[sortField]) : b[sortField];
    return sortOrder === 'asc'
      ? valA > valB ? 1 : -1
      : valA < valB ? 1 : -1;
  });

  return (
    <Paper elevation={3} sx={{ maxWidth: 1500, mx: 'auto', p: { xs: 2, sm: 4 }, borderRadius: 3 }}>
      <Box sx={{ background: 'linear-gradient(to right, #183c86, #5c6bc0)', borderRadius: 2, p: 2, mb: 3, textAlign: 'center' }}>
        <Typography variant="h5" sx={{ color: '#fff', fontWeight: 'bold' }}>Holiday Calendar</Typography>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>
      ) : holidays.length === 0 ? (
        <Typography align="center" sx={{ mt: 2 }}>No holiday data available.</Typography>
      ) : (
        <TableContainer>
          <Table stickyHeader>
            <TableHead>
              <TableRow sx={{ backgroundColor: '#e3f2fd' }}>
                {[
                  { label: 'Date', field: 'holidayDate' },
                  { label: 'Day', field: 'day' },
                  { label: 'Holiday Name', field: 'holidayName' }
                ].map(({ label, field }) => (
                  <TableCell
                    key={field}
                    align="center"
                    sx={{ fontWeight: 'bold', color: '#183c86', cursor: 'pointer' }}
                    onClick={() => handleSort(field)}
                  >
                    {label}
                    {sortField === field && (sortOrder === 'asc' ? ' ↑' : ' ↓')}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {sortedHolidays.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((h, i) => {
                const { dateFormatted, day } = formatDate(h.holidayDate);
                return (
                  <TableRow
                    key={i}
                    hover
                    sx={{
                      backgroundColor: i % 2 === 0 ? '#f9f9fc' : '#fff',
                      transition: 'background-color 0.3s ease'
                    }}
                  >
                    <TableCell align="center">{dateFormatted}</TableCell>
                    <TableCell align="center">{day}</TableCell>
                    <TableCell align="center">{h.holidayName}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
          <TablePagination
            component="div"
            count={holidays.length}
            page={page}
            onPageChange={(e, newPage) => setPage(newPage)}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={(e) => {
              setRowsPerPage(parseInt(e.target.value, 10));
              setPage(0);
            }}
            rowsPerPageOptions={[10, 25, 50]}
          />
        </TableContainer>
      )}
    </Paper>
  );
};

export default UserHolidays;
