import { useEffect, useState } from 'react';
import { getUserLeaveRequests, cancelLeave } from '../ApiCenter/UserApi';
import {
  Paper, Typography, CircularProgress, Chip, Button, Box, Grid, Divider,
  FormControl, InputLabel, Select, MenuItem, Stack, Pagination
} from '@mui/material';
import Swal from 'sweetalert2';

const UserLeaveRequests = () => {
  const userId = sessionStorage.getItem('userId');
  const [requests, setRequests] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('ALL');
  const [type, setType] = useState('ALL');
  const [sort, setSort] = useState('NEWEST');
  const [page, setPage] = useState(1);
  const perPage = 8;

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const res = await getUserLeaveRequests(userId);
        const cleaned = res.data.map(r => ({
          ...r,
          leaveType: r.leaveType?.trim(),
          leaveStatus: r.leaveStatus?.trim(),
        }));
        setRequests(cleaned);
        setFiltered(cleaned);
      } catch {
        setRequests([]);
      } finally {
        setLoading(false);
      }
    })();
  }, [userId]);

  useEffect(() => {
    let data = [...requests];
    if (status !== 'ALL') data = data.filter(r => r.leaveStatus === status);
    if (type !== 'ALL') data = data.filter(r => r.leaveType === type);
    data.sort((a, b) => sort === 'NEWEST'
      ? new Date(b.startDate) - new Date(a.startDate)
      : new Date(a.startDate) - new Date(b.startDate));
    setFiltered(data);
    setPage(1);
  }, [status, type, sort, requests]);

  const paginated = filtered.slice((page - 1) * perPage, page * perPage);

  const handleCancel = async (id) => {
    const confirm = await Swal.fire({
      title: 'Cancel Leave Request?', text: 'This action cannot be undone.',
      icon: 'warning', showCancelButton: true, confirmButtonText: 'Yes, cancel it'
    });
    if (confirm.isConfirmed) {
      try {
        await cancelLeave(userId, id);
        Swal.fire('Cancelled', 'Your leave request has been cancelled.', 'success');
        const res = await getUserLeaveRequests(userId);
        const cleaned = res.data.map(r => ({
          ...r,
          leaveType: r.leaveType?.trim(),
          leaveStatus: r.leaveStatus?.trim(),
        }));
        setRequests(cleaned);
      } catch {
        Swal.fire('Error', 'Failed to cancel leave request.', 'error');
      }
    }
  };

  const getChip = (status) => {
    const colors = { APPROVED: 'success', REJECTED: 'error', CANCELED: 'warning', PENDING: 'default' };
    return <Chip label={status} color={colors[status] || 'default'} />;
  };

  const leaveTypes = ['ALL', ...new Set(requests.map(r => r.leaveType).filter(Boolean))].sort();

  const downloadCSV = () => {
    const headers = ['Leave Type', 'Start Date', 'End Date', 'Duration', 'Approver', 'Status'];
    const rows = paginated.map(r => [
      r.leaveType, r.startDate, r.endDate, r.duration, r.approver, r.leaveStatus
    ]);
    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const link = Object.assign(document.createElement('a'), {
      href: URL.createObjectURL(blob),
      download: 'leave_requests.csv'
    });
    link.click();
  };

  return (
      <Paper elevation={3} sx={{ maxWidth: 1400, mx: 'auto', p: { xs: 2, sm: 4 }, borderRadius: 3 }}>
        <Box sx={{ background: 'linear-gradient(to right, #183c86, #5c6bc0)', borderRadius: 2, p: 2, mb: 3, textAlign: 'center' }}>
          <Typography variant="h5" sx={{ color: '#fff', fontWeight: 'bold' }}>My Leave Requests</Typography>
        </Box>

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 3, justifyContent: 'center', flexWrap: 'wrap' }}>
          {[{
            label: 'Status', value: status, set: setStatus,
            options: ['ALL', 'PENDING', 'APPROVED', 'REJECTED', 'CANCELED']
          }, {
            label: 'Leave Type', value: type, set: setType,
            options: leaveTypes
          }, {
            label: 'Sort By', value: sort, set: setSort,
            options: ['NEWEST', 'OLDEST']
          }].map(({ label, value, set, options }) => (
            <FormControl key={label} sx={{ minWidth: 180 }}>
              <InputLabel>{label}</InputLabel>
              <Select value={value} label={label} onChange={(e) => set(e.target.value)}>
                {options.map(opt => <MenuItem key={opt} value={opt}>{opt}</MenuItem>)}
              </Select>
            </FormControl>
          ))}
          <Button variant="contained" onClick={downloadCSV}>Download</Button>
        </Stack>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>
        ) : paginated.length === 0 ? (
          <Typography align="center" sx={{ mt: 2 }}>No leave requests found.</Typography>
        ) : (
          <>
            <Grid container spacing={3} justifyContent="center">
              {paginated.map((r) => (
                <Grid item xs={12} sm={6} md={3} lg={3} key={r.leaveId}>
                  <Paper elevation={2} sx={{
                    p: 2, borderRadius: 3, backgroundColor: '#f9f9fc',
                    display: 'flex', flexDirection: 'column', gap: 1.5, height: '100%', boxShadow: 5
                  }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: '#0288d1' }}>
                      {r.leaveType} ({r.leaveTypePlannedAndUnplanned})
                    </Typography>
                    <Divider />
                    <Typography variant="body2"><strong>From:</strong> {r.startDate} <strong>To:</strong> {r.endDate}</Typography>
                    <Typography variant="body2"><strong>Duration:</strong> {r.duration} day(s)</Typography>
                    <Typography variant="body2">
  <strong>Approver:</strong> {r.approver.replace(/_/g, ' ')}
</Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 'auto' }}>
                      {getChip(r.leaveStatus)}
                      {r.leaveStatus === 'PENDING' && (
                        <Button variant="outlined" color="error" size="small" onClick={() => handleCancel(r.leaveId)}>
                          Cancel
                        </Button>
                      )}
                    </Box>
                  </Paper>
                </Grid>
              ))}
            </Grid>
            <Pagination
              count={Math.ceil(filtered.length / perPage)}
              page={page}
              onChange={(e, val) => setPage(val)}
              sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}
            />
          </>
        )}
      </Paper>
  );
};

export default UserLeaveRequests;
