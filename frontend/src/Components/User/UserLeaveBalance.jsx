import { useEffect, useState } from 'react';
import { getUserLeaveBalance } from '../ApiCenter/UserApi';
import {
  Paper,
  Typography,
  CircularProgress,
  Grid,
  Box,
  Avatar,
} from '@mui/material';
import BeachAccessIcon from '@mui/icons-material/BeachAccess';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import ChildCareIcon from '@mui/icons-material/ChildCare';
import FamilyRestroomIcon from '@mui/icons-material/FamilyRestroom';
import WorkOffIcon from '@mui/icons-material/WorkOff';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';

const UserLeaveBalance = () => {
  const userId = sessionStorage.getItem('userId');
  const [balanceData, setBalanceData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBalance = async () => {
      try {
        const res = await getUserLeaveBalance(userId);
        setBalanceData(res.data[0]);
      } catch {
        setBalanceData(null);
      } finally {
        setLoading(false);
      }
    };
    fetchBalance();
  }, [userId]);

  const leaveTypes = [
    { key: 'sickLeave', label: 'Sick Leave', icon: <LocalHospitalIcon /> },
    { key: 'casualLeave', label: 'Casual Leave', icon: <BeachAccessIcon /> },
    { key: 'earnedLeave', label: 'Earned Leave', icon: <EventAvailableIcon /> },
    { key: 'paternityLeave', label: 'Paternity Leave', icon: <ChildCareIcon /> },
    { key: 'maternityLeave', label: 'Maternity Leave', icon: <FamilyRestroomIcon /> },
    { key: 'totalLeaves', label: 'Total Leaves', icon: <EventAvailableIcon /> },
  ];

  return (
    <Paper sx={{ p: 4, borderRadius: 4, boxShadow: 4 }}>
      <Box
        sx={{
          background: 'linear-gradient(to right, #183c86, #5c6bc0)',
          borderRadius: 2,
          p: 2,
          mb: 3,
        }}
      >
        <Typography
          variant="h5"
          align="center"
          sx={{ color: '#fff', fontWeight: 'bold' }}
        >
          Leave Balance Overview
        </Typography>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
          <CircularProgress />
        </Box>
      ) : balanceData ? (
        <Grid container spacing={6}>
          {leaveTypes.map(({ key, label, icon }) => (
            <Grid item xs={12} sm={6} md={4} key={key}>
              <Box
                sx={{
                  border: '1px solid #e0e0e0',
                  borderRadius: 3,
                  p: 4,
                  textAlign: 'center',
                  backgroundColor: '#f5f5f5',
                  boxShadow: 8,
                  transition: 'transform 0.2s ease-in-out',
                  '&:hover': {
                    transform: 'scale(1.03)',
                    boxShadow: 20,
                  },
                }}
              >
                <Avatar
                  sx={{
                    bgcolor: '#183c86',
                    mx: 'auto',
                    mb: 1,
                    width: 40,
                    height: 40,
                  }}
                >
                  {icon}
                </Avatar>
                <Typography variant="subtitle1" fontWeight="bold">
                  {label}
                </Typography>
                <Typography variant="body2">
                  Available Days: {balanceData[key]}
                </Typography>
              </Box>
            </Grid>
          ))}
        </Grid>
      ) : (
        <Typography align="center">No leave balance data available.</Typography>
      )}
    </Paper>
  );
};

export default UserLeaveBalance;