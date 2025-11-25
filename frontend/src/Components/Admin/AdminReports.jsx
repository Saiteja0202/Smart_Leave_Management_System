import React, { useEffect, useState, useRef } from 'react';
import {
  Container, Typography, CircularProgress, Paper, Box, Grid, IconButton,
  Dialog, Select, MenuItem, InputLabel, FormControl, OutlinedInput,
  Checkbox, ListItemText, TextField, useMediaQuery, useTheme 
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import DownloadIcon from '@mui/icons-material/Download';
import ZoomOutMapIcon from '@mui/icons-material/ZoomOutMap';
import Swal from 'sweetalert2';
import { getAllUsers, getAllLeaveRequests } from '../ApiCenter/AdminApi';
import { BarChart, PieChart, LineChart } from '@mui/x-charts';
import html2canvas from 'html2canvas';

const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const AdminReports = () => {
  const adminId = sessionStorage.getItem('adminId');
  const [users, setUsers] = useState([]);
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [filteredRoles, setFilteredRoles] = useState(['ALL']);
  const [filteredTypes, setFilteredTypes] = useState([]);
  const [selectedYear, setSelectedYear] = useState("All");
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [loading, setLoading] = useState(true);
  const [openChart, setOpenChart] = useState(null);
  const [userSearch, setUserSearch] = useState('');
  const chartRefs = useRef({});

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  // Use 'md' breakpoint to switch the main chart grid from 2x2 to single column
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('md')); 

  // --- Data Fetching ---
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [usersRes, leavesRes] = await Promise.all([
          getAllUsers(),
          getAllLeaveRequests(adminId),
        ]);
        const allUsers = usersRes.data;
        setUsers(allUsers);
        setFilteredUsers(allUsers.map(u => u.userName));
        setLeaveRequests(leavesRes.data);
      } catch {
        Swal.fire('Error', 'Failed to fetch data', 'error');
      } finally {
        setLoading(false);
      }
    };
    if (adminId) fetchData();
  }, [adminId]);

  // --- Filtering Logic ---
  useEffect(() => {
    if (filteredRoles.includes('ALL') || filteredRoles.length === 0) {
      setFilteredUsers(users.map(u => u.userName));
    } else {
      const roleFiltered = users
        .filter(u => filteredRoles.includes(u.userRole))
        .map(u => u.userName);
      setFilteredUsers(roleFiltered);
    }
  }, [filteredRoles, users]);

  const handleUserChange = (event) => {
    const value = event.target.value;
    if (value.includes('ALL')) {
      if (filteredUsers.length === users.length) {
        setFilteredUsers([]);
      } else {
        setFilteredUsers(users.map(u => u.userName));
      }
    } else {
      setFilteredUsers(value);
    }
  };

  const availableYears = ["All", ...new Set(leaveRequests.map(r => new Date(r.startDate).getFullYear()))].sort((a, b) => {
    if (a === "All") return -1;
    if (b === "All") return 1;
    return a - b;
  });

  const filteredLeaves = leaveRequests.filter(r => {
    const yearMatch = selectedYear === "All" || new Date(r.startDate).getFullYear() === selectedYear;
    const userMatch = filteredUsers.includes(r.userName);
    const roleMatch = filteredRoles.includes('ALL') || filteredRoles.length === 0 || filteredRoles.includes(r.roleName);
    const typeMatch = filteredTypes.length === 0 || filteredTypes.includes(r.leaveType);
    const dateMatch =
      (!dateRange.start || new Date(r.startDate) >= new Date(dateRange.start)) &&
      (!dateRange.end || new Date(r.endDate) <= new Date(dateRange.end));
    return yearMatch && userMatch && roleMatch && typeMatch && dateMatch;
  });

  // --- Chart Data Processing ---
  const leaveCountsPerUser = filteredLeaves.reduce((acc, req) => {
    acc[req.userName] = (acc[req.userName] || 0) + 1;
    return acc;
  }, {});
  const leaveCountsData = Object.entries(leaveCountsPerUser).map(([user, count]) => ({ user, count }));

  const plannedCount = filteredLeaves.filter(r => r.leaveTypePlannedAndUnplanned === 'PLANNED').length;
  const unplannedCount = filteredLeaves.filter(r => r.leaveTypePlannedAndUnplanned === 'UNPLANNED').length;
  const plannedVsUnplannedData = [
    { label: 'Planned', value: plannedCount },
    { label: 'Unplanned', value: unplannedCount },
  ];

  const leaveTypeCount = filteredLeaves.reduce((acc, r) => {
    acc[r.leaveType] = (acc[r.leaveType] || 0) + 1;
    return acc;
  }, {});
  const leaveTypeData = Object.entries(leaveTypeCount).map(([type, count]) => ({ type, count }));

  const monthlyTrend = Array(12).fill(0);
  filteredLeaves.forEach(r => {
    const monthIndex = new Date(r.startDate).getMonth();
    monthlyTrend[monthIndex] += 1;
  });
  const monthlyTrendData = months.map((m, i) => ({ month: m, count: monthlyTrend[i] }));

  const charts = [
    { id: 'userChart', title: 'Leave Requests per User', type: 'bar', data: leaveCountsData, seriesLabel: 'Leaves', color: '#5c6bc0' },
    { id: 'plannedChart', title: 'Planned vs Unplanned Leaves', type: 'pie', data: plannedVsUnplannedData },
    { id: 'typeChart', title: 'Leave Type Distribution', type: 'bar', data: leaveTypeData, seriesLabel: 'Count', color: '#42a5f5' },
    { id: 'monthlyChart', title: 'Monthly Leave Trend', type: 'line', data: monthlyTrendData, seriesLabel: 'Leaves per Month', color: '#43a047' },
  ];

  const typeOptions = [...new Set(leaveRequests.map(r => r.leaveType))];
  const filteredUserList = users.filter(u =>
    `${u.firstName} ${u.lastName}`.toLowerCase().includes(userSearch.toLowerCase())
  );

  // --- Download Handlers ---
  const handleDownload = async (chartId, chartTitle) => {
    const chart = chartRefs.current[chartId];
    if (chart) {
      const canvas = await html2canvas(chart);
      const link = document.createElement('a');
      link.download = `${chartTitle}.png`;
      link.href = canvas.toDataURL();
      link.click();
    }
  };

  const handleModalDownload = async () => {
    const chart = document.getElementById('modal-chart-container');
    if (chart && openChart) {
      const canvas = await html2canvas(chart);
      const link = document.createElement('a');
      link.download = `${openChart.title}.png`;
      link.href = canvas.toDataURL();
      link.click();
    }
  };
  
  const chartHeight = isMobile ? 350 : 300;
  const modalChartHeight = isMobile ? 350 : 400;

  return (
    <Container maxWidth="xl" sx={{ mt: 5, mb: 6, px: isMobile ? 1 : 3 }}>
      <Box sx={{ background: 'linear-gradient(to right, #183c86, #5c6bc0)', borderRadius: 3, p: 2, mb: 4 }}>
        <Typography variant={isMobile ? "h6" : "h5"} align="center" sx={{ fontWeight: 'bold', color: 'white' }}>
          Admin Analytics Dashboard
        </Typography>
      </Box>

      {/* FILTERS SECTION - Responsive Grid Layout (stacks vertically on mobile) */}
      <Grid container spacing={isMobile ? 1 : 2} alignItems="center" sx={{ mb: 4 }}>
        
        {/* USERS */}
        <Grid item sx={{ minWidth: 200 }}>
          <FormControl fullWidth>
            <InputLabel>Users</InputLabel>
            <Select
              multiple
              value={filteredUsers}
              onChange={handleUserChange}
              input={<OutlinedInput label="Users" />}
              renderValue={() =>
                filteredUsers.length === users.length || filteredRoles.includes('ALL')
                  ? 'ALL'
                  : users
                      .filter((u) => filteredUsers.includes(u.userName))
                      .map((u) => `${u.firstName} ${u.lastName}`)
                      .join(', ')
              }
              MenuProps={{ PaperProps: { sx: { maxHeight: 300 } } }}
            >
              <MenuItem value="ALL">
                <Checkbox checked={filteredUsers.length === users.length} />
                <ListItemText primary="ALL" />
              </MenuItem>
              <Box sx={{ px: 2, py: 1 }}>
                <TextField
                  placeholder="Search user..."
                  size="small"
                  fullWidth
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                />
              </Box>
              {filteredUserList.map((u) => (
                <MenuItem key={u.userName} value={u.userName}>
                  <Checkbox checked={filteredUsers.includes(u.userName)} />
                  <ListItemText primary={`${u.firstName} ${u.lastName}`} />
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        {/* LEAVE TYPES */}
        <Grid item sx={{ minWidth: 200 }}>
          <FormControl fullWidth>
            <InputLabel>Leave Types</InputLabel>
            <Select
              multiple
              value={filteredTypes}
              onChange={(e) => setFilteredTypes(e.target.value)}
              input={<OutlinedInput label="Leave Types" />}
              renderValue={(selected) => selected.length ? selected.join(', ') : 'ALL'}
            >
              {typeOptions.map((type) => (
                <MenuItem key={type} value={type}>
                  <Checkbox checked={filteredTypes.includes(type)} />
                  <ListItemText primary={type} />
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        {/* YEAR */}
        <Grid item sx={{ minWidth: 200 }}>
          <FormControl fullWidth>
            <InputLabel>Year</InputLabel>
            <Select
              value={selectedYear}
              onChange={(e) => {
                const value = e.target.value;
                setSelectedYear(value === "All" ? "All" : Number(value));
              }}
              input={<OutlinedInput label="Year" />}
            >
              {availableYears.map((year) => (
                <MenuItem key={year} value={year}>
                  {year}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
      </Grid>

      {/* CHARTS GRID - Conditional Layout for Responsiveness */}
      {loading ? (
        <Box display="flex" justifyContent="center" minHeight="300px">
          <CircularProgress />
        </Box>
      ) : (
        <Grid
          container
          spacing={0}
          justifyContent="center"
          alignItems="stretch"
          sx={{
            // Original Desktop 2x2 CSS Grid
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gridTemplateRows: 'repeat(2, 420px)',
            gap: '24px',
            
            // Mobile/Tablet Override (switches to vertical stacking below 'md' breakpoint)
            [theme.breakpoints.down('md')]: {
              display: 'flex', 
              flexDirection: 'column',
              gap: theme.spacing(3),
              padding: theme.spacing(0),
            },
          }}
        >
          {charts.map((chart) => (
            <Paper
              key={chart.id}
              ref={(el) => (chartRefs.current[chart.id] = el)}
              sx={{
                p: isMobile ? 1 : 2,
                borderRadius: 3,
                height: 420,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'space-between',
                position: 'relative',
                boxShadow: 3,
              }}
            >
              {/* Chart Controls */}
              <Box sx={{ position: 'absolute', top: 10, right: 10, display: 'flex', gap: 1 }}>
                <IconButton onClick={() => setOpenChart(chart)} sx={{ color: '#183c86' }}>
                  <ZoomOutMapIcon fontSize="small" />
                </IconButton>
              </Box>

              <Typography
                variant={isMobile ? "subtitle1" : "h6"}
                sx={{ mb: 2, mt: 1, color: '#183c86', fontWeight: 600, textAlign: 'center' }}
              >
                {chart.title}
              </Typography>

              <Box sx={{ flexGrow: 1, width: '100%' }}>
                {chart.type === 'bar' && (
                  <BarChart
                    series={[{ data: chart.data.map((d) => d.count), label: chart.seriesLabel, color: chart.color }]}
                    xAxis={[{ data: chart.data.map((d) => d.user || d.type), scaleType: 'band' }]}
                    height={chartHeight}
                    margin={isMobile ? { top: 10, right: 10, bottom: 60, left: 20 } : undefined}
                  />
                )}
                {chart.type === 'pie' && (
                  <PieChart
                    series={[{ 
                        data: chart.data, 
                        innerRadius: isMobile ? 30 : 40, 
                        outerRadius: isMobile ? 100 : 120 
                    }]}
                    height={chartHeight}
                    margin={isMobile ? { top: 0, right: 0, bottom: 0, left: 0 } : undefined}
                  />
                )}
                {chart.type === 'line' && (
                  <LineChart
                    series={[{ data: chart.data.map((d) => d.count), label: chart.seriesLabel, color: chart.color }]}
                    xAxis={[{ data: chart.data.map((d) => d.month), scaleType: 'band' }]}
                    height={chartHeight}
                    grid={{ vertical: true, horizontal: true }}
                    margin={isMobile ? { top: 10, right: 10, bottom: 60, left: 20 } : undefined}
                  />
                )}
              </Box>
            </Paper>
          ))}
        </Grid>
      )}

      {/* MODAL POPUP WITH DOWNLOAD */}
      <Dialog 
        open={!!openChart} 
        onClose={() => setOpenChart(null)} 
        maxWidth="lg" 
        fullWidth
        fullScreen={isMobile}
      >
        {openChart && (
          <Box id="modal-chart-container" sx={{ p: isMobile ? 1 : 3, position: 'relative' }}>
            <Box sx={{ position: 'absolute', top: isMobile ? 4 : 8, right: isMobile ? 4 : 8, display: 'flex', gap: 1 }}>
              <IconButton onClick={handleModalDownload} sx={{ color: '#183c86' }}>
                <DownloadIcon />
              </IconButton>
              <IconButton onClick={() => setOpenChart(null)} sx={{ color: '#183c86' }}>
                <CloseIcon />
              </IconButton>
            </Box>

            <Typography variant={isMobile ? "h6" : "h5"} align="center" sx={{ mb: 2, color: '#183c86', fontWeight: 600, mt: isMobile ? 4 : 0 }}>
              {openChart.title}
            </Typography>

            {openChart.type === 'bar' && (
              <BarChart
                series={[{ data: openChart.data.map((d) => d.count), label: openChart.seriesLabel, color: openChart.color }]}
                xAxis={[{ data: openChart.data.map((d) => d.user || d.type), scaleType: 'band' }]}
                height={modalChartHeight}
                margin={isMobile ? { top: 10, right: 10, bottom: 60, left: 20 } : undefined}
              />
            )}
            {openChart.type === 'pie' && (
              <PieChart
                series={[{ 
                    data: openChart.data, 
                    innerRadius: isMobile ? 40 : 50, 
                    outerRadius: isMobile ? 120 : 150 
                }]}
                height={modalChartHeight}
                margin={isMobile ? { top: 10, right: 10, bottom: 10, left: 10 } : undefined}
              />
            )}
            {openChart.type === 'line' && (
              <LineChart
                series={[{ data: openChart.data.map((d) => d.count), label: openChart.seriesLabel, color: openChart.color }]}
                xAxis={[{ data: openChart.data.map((d) => d.month), scaleType: 'band' }]}
                height={modalChartHeight}
                grid={{ vertical: true, horizontal: true }}
                margin={isMobile ? { top: 10, right: 10, bottom: 60, left: 20 } : undefined}
              />
            )}
          </Box>
        )}
      </Dialog>
    </Container>
  );
};

export default AdminReports;