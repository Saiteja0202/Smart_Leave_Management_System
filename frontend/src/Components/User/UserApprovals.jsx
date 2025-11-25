import { useEffect, useState } from 'react';
import {
  Paper, Typography, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Button, CircularProgress, Box, Chip, Stack,
  FormControl, InputLabel, Select, MenuItem, TableSortLabel, Pagination
} from '@mui/material';
import Swal from 'sweetalert2';
import {
  getAllUserLeaveRequests, approveUserLeave, rejectUserLeave
} from '../ApiCenter/UserApi';

const UserApprovals = () => {
  const userId = sessionStorage.getItem('userId');
  const [requests, setRequests] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [sortConfig, setSortConfig] = useState({ key: 'startDate', direction: 'asc' });
  const [page, setPage] = useState(1);
  const rowsPerPage = 5;

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        const res = await getAllUserLeaveRequests(userId);
        setRequests(res.data);
      } catch {
        Swal.fire('Error', 'Failed to fetch leave requests', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [userId]);

  useEffect(() => {
    let data = [...requests];
    if (statusFilter !== 'ALL') data = data.filter(r => r.leaveStatus === statusFilter);
    if (typeFilter !== 'ALL') data = data.filter(r => r.leaveType?.toLowerCase() === typeFilter.toLowerCase());
    if (sortConfig.key) {
      data.sort((a, b) => {
        const aVal = a[sortConfig.key] || '';
        const bVal = b[sortConfig.key] || '';
        return sortConfig.direction === 'asc'
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
      });
    }
    setFiltered(data);
    setPage(1);
  }, [requests, statusFilter, typeFilter, sortConfig]);

  const handleAction = async (leaveId, requesterId, action) => {
    try {
      await (action === 'approve'
        ? approveUserLeave(userId, requesterId)
        : rejectUserLeave(userId, requesterId));
      Swal.fire(action === 'approve' ? 'Approved' : 'Rejected', `Leave ${action}d`, action === 'approve' ? 'success' : 'info');
      const res = await getAllUserLeaveRequests(userId);
      setRequests(res.data);
    } catch {
      Swal.fire('Error', 'Action failed', 'error');
    }
  };

  const getStatusChip = (status) => {
    const map = {
      APPROVED: 'success',
      REJECTED: 'error',
      CANCELED: 'warning',
      PENDING: 'default',
    };
    return <Chip label={status} color={map[status] || 'default'} variant="outlined" />;
  };

  const getActionCell = (req) =>
    req.leaveStatus === 'PENDING' ? (
      <Stack direction="row" spacing={1}>
        <Button size="small" color="success" variant="contained" onClick={() => handleAction(req.leaveId, req.user?.userId || req.userId, 'approve')}>Approve</Button>
        <Button size="small" color="error" variant="outlined" onClick={() => handleAction(req.leaveId, req.user?.userId || req.userId, 'reject')}>Reject</Button>
      </Stack>
    ) : getStatusChip(req.leaveStatus);

  const uniqueLeaveTypes = ['ALL', ...new Set(requests.map(r => r.leaveType?.trim()).filter(Boolean))];

  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const handleDownload = () => {
    const headers = ['Employee Name', 'Role', 'Leave Type', 'Start Date', 'End Date', 'Duration', 'Approver', 'Status'];
    const rows = filtered.map(r => [
      `${r.user?.firstName || ''} ${r.user?.lastName || ''}`.trim() || r.user?.userName || r.userName || 'N/A',
      r.user?.role || r.userRole || 'N/A',
      r.leaveType, r.startDate, r.endDate, r.duration, r.approver, r.leaveStatus
    ]);
    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const link = Object.assign(document.createElement('a'), {
      href: URL.createObjectURL(blob),
      download: 'leave_approvals.csv'
    });
    link.click();
  };

  const paginated = filtered.slice((page - 1) * rowsPerPage, page * rowsPerPage);

  return (
    <Paper elevation={3} sx={{ maxWidth: '100%', p: { xs: 2, sm: 4 }, borderRadius: 3 }}>
      <Box sx={{ background: 'linear-gradient(to right, #183c86, #5c6bc0)', borderRadius: 2, p: 2, mb: 3, textAlign: 'center' }}>
        <Typography variant="h5" sx={{ color: '#fff', fontWeight: 'bold' }}>User Leave Approvals</Typography>
      </Box>

      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 3, justifyContent: 'center', flexWrap: 'wrap' }}>
        <FormControl sx={{ minWidth: 180 }}>
          <InputLabel>Status</InputLabel>
          <Select value={statusFilter} label="Status" onChange={(e) => setStatusFilter(e.target.value)}>
            {['ALL', 'PENDING', 'APPROVED', 'REJECTED', 'CANCELED'].map(s => <MenuItem key={s} value={s}>{s}</MenuItem>)}
          </Select>
        </FormControl>
        <FormControl sx={{ minWidth: 180 }}>
          <InputLabel>Leave Type</InputLabel>
          <Select value={typeFilter} label="Leave Type" onChange={(e) => setTypeFilter(e.target.value)}>
            {uniqueLeaveTypes.map(type => <MenuItem key={type} value={type}>{type}</MenuItem>)}
          </Select>
        </FormControl>
        <Button variant="contained" onClick={handleDownload}>Download</Button>
      </Stack>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>
      ) : filtered.length === 0 ? (
        <Typography align="center" sx={{ mt: 2 }}>No leave requests found.</Typography>
      ) : (
        <>
          <TableContainer>
            <Table stickyHeader size="small">
              <TableHead>
                <TableRow>
                  {[
                    { key: 'employeeName', label: 'Employee Name' },
                    { key: 'role', label: 'Role' },
                    { key: 'leaveType', label: 'Leave Type' },
                    { key: 'startDate', label: 'Start Date' },
                    { key: 'endDate', label: 'End Date' },
                    { key: 'duration', label: 'Duration' },
                    { key: 'approver', label: 'Approver' },
                    { key: 'leaveStatus', label: 'Status' },
                    { key: 'actions', label: 'Actions' }
                  ].map(({ key, label }) => (
                    <TableCell key={key}>
                      {key !== 'actions' ? (
                        <TableSortLabel
                          active={sortConfig.key === key}
                          direction={sortConfig.direction}
                          onClick={() => handleSort(key)}
                        >
                          {label}
                        </TableSortLabel>
                      ) : label}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {paginated.map((req, i) => {
                  const name = `${req.user?.firstName || ''} ${req.user?.lastName || ''}`.trim() || req.user?.userName || req.userName || 'N/A';
                  const role = req.user?.role || req.userRole || 'N/A';
                  return (
                    <TableRow key={req.leaveId} hover sx={{ backgroundColor: i % 2 ? '#fff' : '#f9f9fc' }}>
                      <TableCell>{name}</TableCell>
                      <TableCell>{role.replace(/_/g, ' ')}</TableCell>
                      <TableCell>{req.leaveType}</TableCell>
                      <TableCell>{req.startDate}</TableCell>
                      <TableCell>{req.endDate}</TableCell>
                      <TableCell>{req.duration}</TableCell>
                      <TableCell>{req.approver.replace(/_/g, ' ')}</TableCell>
                      <TableCell>{getStatusChip(req.leaveStatus)}</TableCell>
                      <TableCell>{getActionCell(req)}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>

          <Pagination
            count={Math.ceil(filtered.length / rowsPerPage)}
            page={page}
            onChange={(e, val) => setPage(val)}
            sx={{ mt: 3, display: 'flex', justifyContent: 'center' }}
          />
        </>
      )}
    </Paper>
  );
};

export default UserApprovals;
