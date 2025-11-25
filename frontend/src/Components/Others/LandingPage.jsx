import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Button,
  Box,
  Grid,
  Paper,
  useTheme,
  useMediaQuery,
  Fade,
  Grow,
  Stack,
  Divider,
  Chip,
  Backdrop,
  CircularProgress,
} from '@mui/material';
import {
  AdminPanelSettings,
  Person,
  CalendarMonth,
  Security,
  Speed,
  Assessment,
  ArrowForward,
} from '@mui/icons-material';

const BRAND = '#183c86';

const LandingPage = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 1400);
    return () => clearTimeout(t);
  }, []);

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#ffffff' }}>
      <Backdrop
        open={loading}
        sx={{
          color: BRAND,
          zIndex: (t) => t.zIndex.drawer + 1,
          backdropFilter: 'blur(2px)',
          backgroundColor: 'rgba(255,255,255,0.92)',
        }}
      >
        <Stack spacing={2} alignItems="center">
          <CircularProgress thickness={4} sx={{ color: BRAND }} />
          <Typography variant="body1" sx={{ letterSpacing: 0.2, color: BRAND }}>
            Loading Smart Leave Management…
          </Typography>
        </Stack>
      </Backdrop>

      <Container maxWidth="md" sx={{ py: isMobile ? 6 : 10 }}>
        <Fade in={!loading} timeout={600}>
          <Box
            sx={{
              minHeight: 'calc(100vh - 140px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              px: 2,
            }}
          >
            <Paper
              elevation={0}
              sx={{
                width: '100%',
                maxWidth: 800,
                p: isMobile ? 3 : 5,
                textAlign: 'center',
                borderRadius: 3,
                bgcolor: '#ffffff',
                border: '1px solid #eaeaea',
                boxShadow:
                  '0 8px 24px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.06)',
              }}
            >
              {/* Title */}
              <Typography
                variant={isMobile ? 'h5' : 'h4'}
                gutterBottom
                sx={{
                  fontWeight: 800,
                  color: BRAND,
                  mb: 1,
                }}
              >
                Smart Leave Management
              </Typography>

              <Typography
  variant="subtitle1"
  sx={{
    color: '#5f6368',
    maxWidth: 640,
    mx: 'auto',
  }}
>
  Plan, request, and approve leaves with clarity and speed—transparent calendars,
  role-based access, and export-ready reports.
</Typography>

              {/* Feature highlights */}
              <Grid
                container
                spacing={2}
                justifyContent="center"
                sx={{ mt: isMobile ? 3 : 4 }}
              >
                {[
                  {
                    icon: <CalendarMonth sx={{ color: BRAND }} />,
                    title: 'Unified Calendar',
                    
   desc: (
    <Typography variant="body2" sx={{ color: '#000' }}>
      Team-wide visibility with conflict checks.
    </Typography>
  ),
                  },
                  {
                    icon: <Security sx={{ color: BRAND }} />,
                    title: 'Role-Based Access',
                    
   desc: (
    <Typography variant="body2" sx={{ color: '#000' }}>
      Secure admin and user workflows.
    </Typography>
  ),
                  },
                  {
                    icon: <Speed sx={{ color: BRAND }} />,
                    title: 'Fast Approvals',
                 
   desc: (
    <Typography variant="body2" sx={{ color: '#000' }}>
      Single-click review and notifications.
    </Typography>
  ),
                  },
                  {
                    icon: <Assessment sx={{ color: BRAND }} />,
                    title: 'Insights & Reports',
                  
desc: (
  <Typography variant="body2" sx={{ color: '#000' }}>
    Smart summaries and easy exports.
  </Typography>
),
},

                ].map((f, idx) => (
                  <Grid item xs={12} sm={6} key={idx}>
                    <Grow in={!loading} timeout={650 + idx * 150}>
                      <Paper
                        variant="outlined"
                        sx={{
                          p: 2.2,
                          borderRadius: 2.5,
                          borderColor: '#eaeaea',
                          bgcolor: '#f7f7f9',
                          transition:
                            'transform 200ms ease, box-shadow 200ms ease, background-color 200ms ease',
                          '&:hover': {
                            transform: 'translateY(-3px)',
                            boxShadow:
                              '0 10px 30px rgba(0,0,0,0.08), 0 2px 6px rgba(0,0,0,0.06)',
                            bgcolor: '#ffffff',
                          },
                        }}
                      >
                        <Stack direction="row" spacing={2} alignItems="flex-start">
                          <Box
                            sx={{
                              display: 'grid',
                              placeItems: 'center',
                              width: 44,
                              height: 44,
                              borderRadius: 2,
                              bgcolor: '#ffffff',
                              border: '1px solid #eaeaea',
                            }}
                          >
                            {f.icon}
                          </Box>
                          <Box textAlign="left">
                            <Typography
                              variant="subtitle1"
                              sx={{ color: BRAND, fontWeight: 600 }}
                            >
                              {f.title}
                            </Typography>
                            <Typography
                              variant="body2"
                              sx={{ color: BRAND, opacity: 0.75 }}
                            >
                              {f.desc}
                            </Typography>
                          </Box>
                        </Stack>
                      </Paper>
                    </Grow>
                  </Grid>
                ))}
              </Grid>

              {/* Action buttons */}
              <Grid
                container
                spacing={2}
                justifyContent="center"
                sx={{ mt: isMobile ? 3 : 5 }}
              >
                <Grid item xs={12} sm={6}>
                  <Button
                    variant="contained"
                    onClick={() => navigate('/admin-login')}
                    fullWidth
                    size={isMobile ? 'medium' : 'large'}
                    endIcon={<ArrowForward />}
                    startIcon={<AdminPanelSettings />}
                    sx={{
                      py: 1.2,
                      borderRadius: 2.5,
                      textTransform: 'none',
                      fontWeight: 700,
                      letterSpacing: 0.3,
                      bgcolor: BRAND,
                      color: '#ffffff',
                      boxShadow:
                        '0 10px 24px rgba(0,0,0,0.12), 0 2px 6px rgba(0,0,0,0.08)',
                      '&:hover': {
                        bgcolor: '#132c66', // a slightly darker shade of BRAND
                        transform: 'translateY(-1px)',
                        boxShadow: '0 12px 28px rgba(0,0,0,0.16)',
                      },
                    }}
                  >
                    Admin
                  </Button>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Button
                    variant="outlined"
                    onClick={() => navigate('/user-login')}
                    fullWidth
                    size={isMobile ? 'medium' : 'large'}
                    endIcon={<ArrowForward sx={{ color: BRAND }} />}
                    startIcon={<Person sx={{ color: BRAND }} />}
                    sx={{
                      py: 1.2,
                      borderRadius: 2.5,
                      textTransform: 'none',
                      fontWeight: 700,
                      letterSpacing: 0.3,
                      borderColor: BRAND,
                      color: BRAND,
                      bgcolor: '#ffffff',
                      '&:hover': {
                        borderColor: '#132c66',
                        color: '#132c66',
                        bgcolor: '#f7f7f9',
                        transform: 'translateY(-1px)',
                      },
                    }}
                  >
                    User
                  </Button>
                </Grid>
              </Grid>
            </Paper>
          </Box>
        </Fade>
      </Container>
    </Box>
  );
};

export default LandingPage;
