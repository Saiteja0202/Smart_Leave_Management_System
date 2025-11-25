import React, { useEffect, useState } from 'react';
import { getAllUserLeaveBalances } from '../ApiCenter/UserApi';
import {
  Paper, Typography, CircularProgress, Button, Box, Grid, Divider,
  Stack, Pagination
} from '@mui/material';

const UserAllLeaveBalances = () => {
  const userId = sessionStorage.getItem('userId');
  const [leaveBalances, setLeaveBalances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const perPage = 8;

  useEffect(() => {
    const fetchLeaveBalances = async () => {
      try {
        const response = await getAllUserLeaveBalances(userId);
        setLeaveBalances(response.data);
      } catch (err) {
        setError('Failed to fetch leave balances');
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchLeaveBalances();
    }
  }, [userId]);

  const paginated = leaveBalances.slice((page - 1) * perPage, page * perPage);

  const downloadCSV = () => {
    const headers = ['Name', 'Sick Leave', 'Casual Leave', 'Loss of Pay', 'Earned Leave', 'Paternity Leave', 'Maternity Leave', 'Total Leaves'];
    const rows = paginated.map(u => [
      `${u.firstName} ${u.lastName}`, u.sickLeave, u.casualLeave, u.lossOfPay,
      u.earnedLeave, u.paternityLeave, u.maternityLeave, u.totalLeaves
    ]);
    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const link = Object.assign(document.createElement('a'), {
      href: URL.createObjectURL(blob),
      download: 'user_leave_balances.csv'
    });
    link.click();
  };

  return (
    <Paper elevation={3} sx={{ maxWidth: 1400, mx: 'auto', p: { xs: 2, sm: 4 }, borderRadius: 3 }}>
      <Box sx={{ background: 'linear-gradient(to right, #183c86, #5c6bc0)', borderRadius: 2, p: 2, mb: 3, textAlign: 'center' }}>
        <Typography variant="h5" sx={{ color: '#fff', fontWeight: 'bold' }}>All User's Leave Balances</Typography>
      </Box>

      <Stack direction="row" justifyContent="flex-end" sx={{ mb: 3 }}>
        <Button variant="contained" onClick={downloadCSV}>Download</Button>
      </Stack>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>
      ) : error ? (
        <Typography align="center" sx={{ mt: 2, color: 'red' }}>{error}</Typography>
      ) : paginated.length === 0 ? (
        <Typography align="center" sx={{ mt: 2 }}>No leave balances found.</Typography>
      ) : (
        <>
          <Grid container spacing={3} justifyContent="center">
            {paginated.map((user, index) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
                <Paper elevation={2} sx={{
                  p: 2, borderRadius: 3, backgroundColor: '#f9f9fc',
                  display: 'flex', flexDirection: 'column', gap: 1.5, height: '100%', boxShadow: 5
                }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: '#0288d1' }}>
                    {user.firstName} {user.lastName}
                  </Typography>
                  <Divider />
                  <Typography variant="body2"><strong>Sick Leave:</strong> {user.sickLeave}</Typography>
                  <Typography variant="body2"><strong>Casual Leave:</strong> {user.casualLeave}</Typography>
                  <Typography variant="body2"><strong>Loss of Pay:</strong> {user.lossOfPay}</Typography>
                  <Typography variant="body2"><strong>Earned Leave:</strong> {user.earnedLeave}</Typography>
                  <Typography variant="body2"><strong>Paternity Leave:</strong> {user.paternityLeave}</Typography>
                  <Typography variant="body2"><strong>Maternity Leave:</strong> {user.maternityLeave}</Typography>
                  <Divider />
                  <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                    Total Leaves: {user.totalLeaves}
                  </Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
          <Pagination
            count={Math.ceil(leaveBalances.length / perPage)}
            page={page}
            onChange={(e, val) => setPage(val)}
            sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}
          />
        </>
      )}
    </Paper>
  );
};

export default UserAllLeaveBalances;
