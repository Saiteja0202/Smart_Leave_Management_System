import { useEffect, useState } from 'react';
import {
  Container, Typography, CircularProgress, Paper, List, ListItem, ListItemText,
  Button, Stack, Chip, Box, FormControl, InputLabel, Select, MenuItem,
  Divider, TablePagination
} from '@mui/material';
import Swal from 'sweetalert2';
import { getAllLeaveRequests, approveLeave, rejectLeave } from '../ApiCenter/AdminApi';

const AdminLeaveRequests = () => {
  const adminId = sessionStorage.getItem('adminId');
  const [requests, setRequests] = useState([]);
  const [filteredRequests, setFilteredRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [leaveTypeFilter, setLeaveTypeFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [sortField, setSortField] = useState('');
  const [sortOrder, setSortOrder] = useState('asc');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  useEffect(() => {
    getAllLeaveRequests(adminId)
      .then(res => {
        setRequests(res.data);
        setFilteredRequests(res.data);
      })
      .catch(() => {
        setRequests([]);
        setFilteredRequests([]);
      })
      .finally(() => setLoading(false));
  }, [adminId]);

  const handleAction = async (leaveId, action) => {
    try {
      if (action === 'approve') {
        await approveLeave(adminId, leaveId);
        Swal.fire('Approved', 'Leave approved successfully', 'success');
      } else {
        await rejectLeave(adminId, leaveId);
        Swal.fire('Rejected', 'Leave rejected successfully', 'info');
      }
      const res = await getAllLeaveRequests(adminId);
      setRequests(res.data);
    } catch {
      Swal.fire('Error', 'Action failed. Try again later.', 'error');
    }
  };

  const getStatusChip = (status) => {
    const colorMap = {
      APPROVED: 'success',
      REJECTED: 'error',
      CANCELED: 'warning',
      PENDING: 'default',
    };
    return <Chip label={status} color={colorMap[status] || 'default'} />;
  };

  const handleFilterChange = (type, value) => {
    if (type === 'leaveType') setLeaveTypeFilter(value);
    else setStatusFilter(value);
  };

  useEffect(() => {
    let filtered = [...requests];
    if (leaveTypeFilter !== 'ALL') filtered = filtered.filter(r => r.leaveType === leaveTypeFilter);
    if (statusFilter !== 'ALL') filtered = filtered.filter(r => r.leaveStatus === statusFilter);
    setFilteredRequests(filtered);
    setPage(0);
  }, [leaveTypeFilter, statusFilter, requests]);

  const sortedRequests = [...filteredRequests].sort((a, b) => {
    if (!sortField) return 0;
    const valA = a[sortField]?.toString().toLowerCase();
    const valB = b[sortField]?.toString().toLowerCase();
    return sortOrder === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
  });

  const paginatedRequests = sortedRequests.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  const handleDownloadCSV = () => {
    const headers = ['User Name', 'User ID', 'Role', 'Leave Type', 'Duration', 'Start Date', 'End Date', 'Status'];
    const rows = sortedRequests.map(r => [
      r.userName, r.userId, r.userRole, r.leaveType, r.duration, r.startDate, r.endDate, r.leaveStatus
    ]);
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', 'leave_requests.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const leaveTypes = [...new Set(requests.map(r => r.leaveType))];
  const statuses = ['PENDING', 'APPROVED', 'REJECTED', 'CANCELED'];

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 6 }}>
      <Box sx={{ background: 'linear-gradient(to right, #183c86, #5c6bc0)', borderRadius: 2, p: 2, mb: 3, boxShadow: 3 }}>
        <Typography variant="h5" align="center" sx={{ fontWeight: 'bold', color: 'white' }}>
          Leave Requests Management
        </Typography>
      </Box>

      <Paper elevation={4} sx={{ p: 4, borderRadius: 3, backgroundColor: '#fafafa' }}>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, justifyContent: 'center', mb: 3 }}>
          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel>Leave Type</InputLabel>
            <Select value={leaveTypeFilter} label="Leave Type" onChange={(e) => handleFilterChange('leaveType', e.target.value)}>
              <MenuItem value="ALL">All</MenuItem>
              {leaveTypes.map(type => <MenuItem key={type} value={type}>{type}</MenuItem>)}
            </Select>
          </FormControl>

          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel>Status</InputLabel>
            <Select value={statusFilter} label="Status" onChange={(e) => handleFilterChange('status', e.target.value)}>
              <MenuItem value="ALL">All</MenuItem>
              {statuses.map(status => <MenuItem key={status} value={status}>{status}</MenuItem>)}
            </Select>
          </FormControl>

          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel>Sort By</InputLabel>
            <Select value={sortField} label="Sort By" onChange={(e) => setSortField(e.target.value)}>
              <MenuItem value="">None</MenuItem>
              <MenuItem value="userName">User Name</MenuItem>
              <MenuItem value="startDate">Start Date</MenuItem>
              <MenuItem value="leaveType">Leave Type</MenuItem>
            </Select>
          </FormControl>

          <Button onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}>
            Order: {sortOrder.toUpperCase()}
          </Button>

          <Button variant="outlined" onClick={handleDownloadCSV}>Download</Button>
        </Box>

        <Divider sx={{ mb: 3 }} />

        {loading ? (
          <Box display="flex" justifyContent="center" minHeight="150px"><CircularProgress /></Box>
        ) : paginatedRequests.length === 0 ? (
          <Typography align="center" color="text.secondary">No leave requests found.</Typography>
        ) : (
          <List>
            {paginatedRequests.map((req) => (
              <Paper key={req.leaveId} elevation={2} sx={{
                mb: 2, borderRadius: 2, p: 2, backgroundColor: '#fff',
                '&:hover': { boxShadow: 6, transform: 'scale(1.01)', transition: '0.2s ease-in-out' },
              }}>
                <ListItem
                  divider
                  secondaryAction={
                    <Stack direction="row" spacing={1}>
                      {req.leaveStatus === 'PENDING' ? (
                        <>
                          <Button variant="contained" color="success" size="small" onClick={() => handleAction(req.leaveId, 'approve')}>Approve</Button>
                          <Button variant="outlined" color="error" size="small" onClick={() => handleAction(req.leaveId, 'reject')}>Reject</Button>
                        </>
                      ) : getStatusChip(req.leaveStatus)}
                    </Stack>
                  }
                >
                  <ListItemText
                    primary={<Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#183c86' }}>
                      {req.userName} (ID: {req.userId}) — {req.userRole.replace(/_/g, ' ')}
                    </Typography>}
                    secondary={
                      <>
                        <Typography variant="body2" color="text.secondary">Leave Type: {req.leaveType} ({req.leaveTypePlannedAndUnplanned})</Typography>
                        <Typography variant="body2" color="text.secondary">Duration: {req.duration} day(s)</Typography>
                        <Typography variant="body2" color="text.secondary">From: {req.startDate} To: {req.endDate}</Typography>
                        <Typography variant="body2" color="text.secondary">Approver: {req.approver.replace(/_/g, ' ')}</Typography>
                      </>
                    }
                  />
                </ListItem>
              </Paper>
            ))}
                    </List>
        )}

        <TablePagination
          component="div"
          count={sortedRequests.length}
          page={page}
          onPageChange={(e, newPage) => setPage(newPage)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
          rowsPerPageOptions={[5, 10, 25]}
        />
      </Paper>
    </Container>
  );
};

export default AdminLeaveRequests;
