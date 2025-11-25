import { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemText,
  Toolbar,
  Typography,
  CssBaseline,
  AppBar,
  Button,
  Avatar,
  IconButton,
} from '@mui/material';
import {
  Dashboard,
  Person,
  CalendarMonth,
  BeachAccess,
  AssignmentTurnedIn,
  RequestQuote,
  PeopleAlt,
  Logout,
  Menu as MenuIcon,
  Assessment,
} from '@mui/icons-material';
import { logout } from '../ApiCenter/AuthUtils';

const drawerWidth = 240;

const UserDashboard = () => {
  const [open, setOpen] = useState(false);
  const toggleDrawer = () => setOpen(!open);

  const navigate = useNavigate();
  const roleName = sessionStorage.getItem('role') || 'USER';
  const userName = sessionStorage.getItem('userName') || '';
  const avatarLetter = userName?.trim()?.charAt(0)?.toUpperCase();

  const navItems = [
    { label: 'Profile', path: 'user-profile', icon: <Person /> },
    { label: 'Leave Balance', path: 'user-leavebalance', icon: <RequestQuote /> },
    { label: 'Leave Requests', path: 'user-leave-requests', icon: <AssignmentTurnedIn /> },
    { label: 'Holidays', path: 'user-holidays', icon: <BeachAccess /> },
    { label: 'Apply Leave', path: 'user-apply-leave', icon: <CalendarMonth /> },
  ];

  if (roleName === 'HR_MANAGER' || roleName === 'TEAM_MANAGER') {
    navItems.push({ label: 'Leave Approvals', path: 'user-approvals', icon: <PeopleAlt /> });
    navItems.push({ label: 'Team Leave Balance', path: 'user-all-leavebalance', icon: <Assessment /> });
  }

  const handleLogout = () => {
    logout();
    navigate('/user-login');
  };

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />

      <AppBar
        position="fixed"
        sx={{
          zIndex: (theme) => theme.zIndex.drawer + 1,
          background: 'linear-gradient(90deg, #0288d1, #26c6da)',
          boxShadow: '0px 2px 8px rgba(0,0,0,0.2)',
        }}
      >
        <Toolbar sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <IconButton
              edge="start"
              color="inherit"
              aria-label="menu"
              onClick={toggleDrawer}
              sx={{ mr: 1 }}
            >
              <MenuIcon />
            </IconButton>
            <Dashboard sx={{ fontSize: 28 }} />
            <Typography variant="h6" noWrap component="div">
              User Dashboard
            </Typography>
          </Box>

          <Button
            variant="contained"
            startIcon={<Logout />}
            onClick={handleLogout}
            sx={{
              textTransform: 'none',
              borderRadius: 2,
              backgroundColor: '#fff',
              color: '#0288d1',
              '&:hover': { backgroundColor: '#e0f7fa' },
            }}
          >
            Logout
          </Button>
        </Toolbar>
      </AppBar>

      <Drawer
        variant="temporary"
        open={open}
        onClose={toggleDrawer}
        ModalProps={{ keepMounted: true }}
        sx={{
          [`& .MuiDrawer-paper`]: {
            width: drawerWidth,
            boxSizing: 'border-box',
            backgroundColor: '#f5f7fb',
            borderRight: '1px solid #e0e0e0',
          },
        }}
      >
        <Toolbar />
        <Box sx={{ overflow: 'auto', p: 1 }}>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              mb: 2,
              mt: 1,
            }}
          >
            <Avatar sx={{ bgcolor: '#0288d1', width: 56, height: 56, mb: 1 }}>
              {avatarLetter}
            </Avatar>
            <Typography variant="subtitle1" fontWeight="bold">
              {roleName.replace('_', ' ')}
            </Typography>
          </Box>

          <List>
            {navItems.map((item) => (
              <ListItem
                button
                key={item.path}
                component={NavLink}
                to={item.path}
                onClick={toggleDrawer}
                sx={{
                  my: 0.5,
                  mx: 1,
                  borderRadius: 2,
                  transition: 'all 0.3s ease',
                  color: '#333',
                  '&:hover': {
                    backgroundColor: 'rgba(2, 136, 209, 0.1)',
                  },
                  '&.active': {
                    backgroundColor: 'primary.main',
                    color: 'white',
                    '& svg': { color: 'white' },
                  },
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  {item.icon}
                  <ListItemText primary={item.label} />
                </Box>
              </ListItem>
            ))}
          </List>
        </Box>
      </Drawer>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          backgroundColor: '#f7f9fc',
          minHeight: '100vh',
          width: '100%',
          '@keyframes fadeIn': {
            from: { opacity: 0, transform: 'translateY(10px)' },
            to: { opacity: 1, transform: 'translateY(0)' },
          },
        }}
      >
        <Toolbar />
        <Box
          sx={{
            p: 3,
            bgcolor: 'white',
            borderRadius: 3,
            boxShadow: 2,
            animation: 'fadeIn 0.5s ease-in-out',
          }}
        >
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
};

export default UserDashboard;
