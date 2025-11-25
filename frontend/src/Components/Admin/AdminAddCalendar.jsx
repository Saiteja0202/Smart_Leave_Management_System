import { useState, useEffect } from 'react';
import {
  Box, Button, Typography, CircularProgress, Container, Paper,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField,
  TablePagination
} from '@mui/material';
import Swal from 'sweetalert2';
import {
  uploadCalendar, updateCalendar, getAllHolidays,
  addCountryCalendar, updateSingleHoliday
} from '../ApiCenter/AdminApi';

const AdminAddCalendar = () => {
  const [file, setFile] = useState(null);
  const [holidays, setHolidays] = useState([]);
  const [allHolidays, setAllHolidays] = useState([]);
  const [loading, setLoading] = useState(false);
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [selectedHoliday, setSelectedHoliday] = useState(null);
  const [newHoliday, setNewHoliday] = useState({
    countryName: '', calendarYear: '', holidayName: '', holidayDate: '', cityName: ''
  });

  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [sortField, setSortField] = useState('holidayId');
  const [sortOrder, setSortOrder] = useState('asc');

  const adminId = sessionStorage.getItem('adminId');

  useEffect(() => { fetchAllHolidays(); }, []);

  const handleFileChange = (e) => setFile(e.target.files[0]);

  const handleUpload = async () => {
    if (!file) return Swal.fire('Error', 'Please select an Excel file', 'error');
    setLoading(true);
    try {
      const res = await uploadCalendar(adminId, file);
      setHolidays(res.data);
      Swal.fire('Success', 'Excel file parsed successfully', 'success');
      setFile(null);
    } catch {
      Swal.fire('Error', 'Failed to upload Excel file', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    if (holidays.length === 0) return Swal.fire('Error', 'No holidays to update', 'error');
    setLoading(true);
    try {
      const res = await updateCalendar(adminId, holidays);
      Swal.fire('Success', res.data, 'success');
      setHolidays([]);
      fetchAllHolidays();
    } catch {
      Swal.fire('Error', 'Failed to update calendar', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchAllHolidays = async () => {
    try {
      const res = await getAllHolidays(adminId);
      setAllHolidays(res.data);
    } catch {
      Swal.fire('Error', 'Failed to fetch holidays', 'error');
    }
  };

  const handleAddHoliday = async () => {
    try {
      await addCountryCalendar(adminId, newHoliday);
      Swal.fire('Success', 'Holiday added successfully', 'success');
      setOpenAddDialog(false);
      setNewHoliday({ countryName: '', calendarYear: '', holidayName: '', holidayDate: '', cityName: '' });
      fetchAllHolidays();
    } catch {
      Swal.fire('Error', 'Failed to add holiday', 'error');
    }
  };

  const handleEditHoliday = async () => {
    try {
      await updateSingleHoliday(adminId, selectedHoliday.holidayId, selectedHoliday);
      Swal.fire('Success', 'Holiday updated successfully', 'success');
      setOpenEditDialog(false);
      setSelectedHoliday(null);
      fetchAllHolidays();
    } catch {
      Swal.fire('Error', 'Failed to update holiday', 'error');
    }
  };

  const filteredHolidays = allHolidays
    .filter(h => Object.values(h).some(val => String(val).toLowerCase().includes(search.toLowerCase())))
    .sort((a, b) => {
      const valA = a[sortField];
      const valB = b[sortField];
      return sortOrder === 'asc' ? (valA > valB ? 1 : -1) : (valA < valB ? 1 : -1);
    });

  const handleSort = (field) => {
    const order = sortField === field && sortOrder === 'asc' ? 'desc' : 'asc';
    setSortField(field);
    setSortOrder(order);
  };

  return (
    <Container maxWidth="xl">
      <Paper sx={{ p: 4, mt: 4, boxShadow: 4, borderRadius: 3 }}>
        <Typography variant="h5" sx={{ p: 2, mb: 3, fontWeight: 'bold', color: 'white', background: 'linear-gradient(to right, #183c86, #5c6bc0)', borderRadius: 2 }}>
          Upload & Manage Calendar
        </Typography>

        <Box sx={{ mb: 3 }}>
          <input type="file" accept=".xlsx,.xls" onChange={handleFileChange} />
        </Box>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 3 }}>
  <Button variant="contained" onClick={handleUpload} disabled={loading}>
    {loading ? <CircularProgress size={24} /> : 'Upload'}
  </Button>
  <Button variant="contained" onClick={handleUpdate} disabled={loading || holidays.length === 0}>
    {loading ? <CircularProgress size={24} /> : 'Update'}
  </Button>
  <Button variant="contained" onClick={() => setOpenAddDialog(true)}>Add Holiday</Button>

  {/* ✅ Download Template aligned with other buttons */}
  <Button
    variant="contained"
    color="primary"
    href="/All_Holidays_Calendar.xlsx"
    download
  >
    Download Template
  </Button>
</Box>

        <TextField
          label="Search Holidays"
          variant="outlined"
          fullWidth
          sx={{ mb: 3 }}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        {filteredHolidays.length > 0 ? (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: '#183c86' }}>
                  {[
                    { label: 'ID', field: 'holidayId' },
                    { label: 'Country', field: 'countryName' },
                    { label: 'Holiday Name', field: 'holidayName' },
                    { label: 'Date', field: 'holidayDate' },
                    { label: 'Day', field: 'holidayDay' },
                    { label: 'Year', field: 'calendarYear' },
                    { label: 'City', field: 'cityName' },
                    { label: 'Actions', field: null }
                  ].map(({ label, field }, i) => (
                    <TableCell
                      key={i}
                      sx={{ color: 'white', fontWeight: 'bold', cursor: field ? 'pointer' : 'default' }}
                      onClick={() => field && handleSort(field)}
                    >
                      {label}
                      {field && sortField === field && (sortOrder === 'asc' ? ' ↑' : ' ↓')}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredHolidays.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((holiday) => (
                  <TableRow key={holiday.holidayId}>
                    <TableCell>{holiday.holidayId}</TableCell>
                    <TableCell>{holiday.countryName}</TableCell>
                    <TableCell>{holiday.holidayName}</TableCell>
                    <TableCell>{holiday.holidayDate}</TableCell>
                    <TableCell>{holiday.holidayDay}</TableCell>
                    <TableCell>{holiday.calendarYear}</TableCell>
                    <TableCell>{holiday.cityName}</TableCell>
                    <TableCell>
                      <Button onClick={() => { setSelectedHoliday(holiday); setOpenEditDialog(true); }}>
                        Edit
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <TablePagination
              component="div"
              count={filteredHolidays.length}
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
        ) : (
          <Typography>No holidays found in database.</Typography>
        )}

        {/* Add Holiday Dialog */}
        <Dialog open={openAddDialog} onClose={() => setOpenAddDialog(false)} fullWidth>
          <DialogTitle>Add New Holiday</DialogTitle>
          <DialogContent>
            {Object.keys(newHoliday).map((field) => (
              <TextField
                key={field}
                margin="dense"
                label={field.replace(/([A-Z])/g, ' $1')}
                type={field === 'holidayDate' ? 'date' : 'text'}
                InputLabelProps={field === 'holidayDate' ? { shrink: true } : undefined}
                fullWidth
                value={newHoliday[field]}
                onChange={(e) => setNewHoliday({ ...newHoliday, [field]: e.target.value })}
              />
            ))}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenAddDialog(false)}>Cancel</Button>
            <Button onClick={handleAddHoliday}>Add</Button>
          </DialogActions>
        </Dialog>

        {/* Edit Holiday Dialog */}
        <Dialog open={openEditDialog} onClose={() => setOpenEditDialog(false)} fullWidth>
          <DialogTitle>Edit Holiday</DialogTitle>
          <DialogContent>
            {selectedHoliday &&
              Object.keys(selectedHoliday)
                .filter((field) =>
                  ['countryName', 'calendarYear', 'holidayName', 'holidayDate', 'cityName', 'holidayDay'].includes(field)
                )
                .map((field) => (
                  <TextField
                    key={field}
                    margin="dense"
                    label={field.replace(/([A-Z])/g, ' $1')}
                    type={field === 'holidayDate' ? 'date' : 'text'}
                    InputLabelProps={field === 'holidayDate' ? { shrink: true } : undefined}
                    fullWidth
                    value={selectedHoliday[field]}
                    onChange={(e) =>
                      setSelectedHoliday({ ...selectedHoliday, [field]: e.target.value })
                    }
                  />
                ))}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenEditDialog(false)}>Cancel</Button>
            <Button onClick={handleEditHoliday}>Save</Button>
          </DialogActions>
        </Dialog>
      </Paper>
    </Container>
  );
};

export default AdminAddCalendar;
