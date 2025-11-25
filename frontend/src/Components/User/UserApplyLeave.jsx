import { useEffect, useState } from 'react';
import {
  Paper, Typography, TextField, Button, MenuItem,
  CircularProgress, Box
} from '@mui/material';
import {
  applyLeave, calculateLeaveDuration, getUserLeaveBalance
} from '../ApiCenter/UserApi';
import Swal from 'sweetalert2';

const leaveTypes = [
  { key: 'sickLeave', label: 'SICK' },
  { key: 'casualLeave', label: 'CASUAL' },
  { key: 'earnedLeave', label: 'EARNED' },
  { key: 'maternityLeave', label: 'MATERNITY' },
  { key: 'paternityLeave', label: 'PATERNITY' },
];

const UserApplyLeave = () => {
  const userId = sessionStorage.getItem('userId');
  const [formData, setFormData] = useState({
    leaveType: '', startDate: '', endDate: '', comments: ''
  });
  const [duration, setDuration] = useState(null);
  const [leaveBalance, setLeaveBalance] = useState({});
  const [loading, setLoading] = useState(false);
  const [dateError, setDateError] = useState('');
  const [balanceError, setBalanceError] = useState(false);

  useEffect(() => {
    getUserLeaveBalance(userId)
      .then(res => setLeaveBalance(res.data[0]))
      .catch(() => setLeaveBalance({}));
  }, [userId]);

  useEffect(() => {
    const { startDate, endDate } = formData;
    if (startDate && endDate) {
      calculateLeaveDuration(userId, startDate, endDate)
        .then(res => {
          setDuration(res.data);
          setDateError('');
        })
        .catch(err => {
          setDuration(null);
          setDateError(err.response?.data || 'Invalid date range.');
        });
    } else {
      setDuration(null);
      setDateError('');
    }
  }, [formData.startDate, formData.endDate, userId]);

  useEffect(() => {
    const key = `${formData.leaveType?.toLowerCase()}Leave`;
    const available = leaveBalance[key];
    setBalanceError(duration !== null && available !== undefined && duration > available);
  }, [formData.leaveType, duration, leaveBalance]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const isFormValid = () =>
    formData.leaveType && formData.startDate && formData.endDate &&
    formData.comments.trim() && !dateError && !balanceError;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await applyLeave(userId, { ...formData, duration });
      Swal.fire('Success', 'Leave applied successfully', 'success');
      setFormData({ leaveType: '', startDate: '', endDate: '', comments: '' });
      setDuration(null);
    } catch {
      Swal.fire('Error', 'Failed to apply leave', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper elevation={3} sx={{ maxWidth: 1500, mx: 'auto', p: { xs: 2, sm: 4 }, borderRadius: 3 }}>
      <Box sx={{ background: 'linear-gradient(to right, #183c86, #5c6bc0)', borderRadius: 2, p: 2, mb: 3, textAlign: 'center' }}>
        <Typography variant="h5" sx={{ color: '#fff', fontWeight: 'bold' }}>Apply for Leave</Typography>
      </Box>

      <form onSubmit={handleSubmit}>
        <TextField
          select fullWidth required name="leaveType" label="Leave Type"
          value={formData.leaveType} onChange={handleChange} margin="normal"
        >
          {leaveTypes.map(({ key, label }) => (
            <MenuItem key={label} value={label}>
              {label} ({leaveBalance[key] ?? 0} days left)
            </MenuItem>
          ))}
        </TextField>

        {['startDate', 'endDate'].map((field) => (
          <TextField
            key={field}
            fullWidth required type="date" name={field}
            label={field === 'startDate' ? 'Start Date' : 'End Date'}
            value={formData[field]} onChange={handleChange}
            margin="normal" InputLabelProps={{ shrink: true }}
            error={!!dateError} helperText={dateError}
          />
        ))}

        {duration !== null && !dateError && (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Duration: {duration} day{duration > 1 ? 's' : ''}
          </Typography>
        )}

        {balanceError && (
          <Typography variant="body2" color="error" sx={{ mt: 1 }}>
            Insufficient leave balance for selected type.
          </Typography>
        )}

        <TextField
          fullWidth required multiline minRows={2}
          name="comments" label="Comments"
          value={formData.comments} onChange={handleChange}
          margin="normal"
        />

        <Button
          type="submit" variant="contained"
          sx={{ mt: 2 }} disabled={!isFormValid() || loading}
        >
          {loading ? <CircularProgress size={24} /> : 'Apply Leave'}
        </Button>
      </form>
    </Paper>
  );
};

export default UserApplyLeave;
