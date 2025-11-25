import axiosInstance from './axiosInstance.jsx';
import axios from 'axios';

const BASE_URL = 'http://localhost:8765';

export const registerAdmin = (adminData) =>
  axios.post(`${BASE_URL}/admin/registration`, adminData);

export const registrationHistory = () =>
  axios.get(`${BASE_URL}/admin/get-registration-history`);

export const loginAdmin = (loginDetails) =>
  axios.post(`${BASE_URL}/admin/login`, loginDetails);

export const addNewRole = (adminId, roleData) =>
  axiosInstance.post(`/admin/add-newrole/${adminId}`, roleData);

export const addCountryCalendar = (adminId, calendarData) =>
  axiosInstance.post(`/admin/add-new-country-calendar/${adminId}`, calendarData);

export const addLeavePolicies = (adminId, leavePolicyData) =>
  axiosInstance.post(`/admin/add-new-leave-policies/${adminId}`, leavePolicyData);

export const promoteUser = (adminId, userId, roleName) =>
  axiosInstance.put(`/admin/promote/${adminId}/${userId}`,roleName);

export const approveLeave = (adminId, leaveId) =>
  axiosInstance.post(`/admin/approve/${adminId}/${leaveId}`);

export const rejectLeave = (adminId, leaveId) =>
  axiosInstance.post(`/admin/reject/${adminId}/${leaveId}`);

export const getAllUsers = () =>
  axiosInstance.get('/admin/get-all-users');

export const getAdminDetails = (adminId) =>
  axiosInstance.get(`/admin/get-admin-details/${adminId}`);

export const getAllLeaveRequests = (adminId) =>
  axiosInstance.get(`/admin/get-all-leave-requests/${adminId}`);

export const getAllUsersLeaveBalances = (adminId) =>
  axiosInstance.get(`/admin/get-all-leave-balance/${adminId}`);

export const getAllRoles = (adminId) =>
  axiosInstance.get(`/admin/get-all-roles/${adminId}`);

export const getAllLeavePolicies = (adminId) =>
  axiosInstance.get(`/admin/get-all-roles-based-leaves-policies/${adminId}`);

export const getAllHolidays = (adminId) =>
  axiosInstance.get(`/admin/get-all-holidays/${adminId}`);

export const deleteUser = (adminId, userId) =>
  axiosInstance.delete(`/admin/delete-user/${adminId}/${userId}`);

// export const updateCalendar = (adminId) =>
//   axiosInstance.put(`/admin/update-calendar/${adminId}`);

export const updateAdminDetails = (adminId, adminData) =>
  axiosInstance.put(`/admin/update/${adminId}`, adminData);

export const updateLeavePolicies = (adminId, roleBasedLeaveId, roleBasedLeavePolicies) =>
  axiosInstance.put(`/admin/update-leave-policy/${adminId}/${roleBasedLeaveId}`,roleBasedLeavePolicies);




export const uploadCalendar = (adminId, file) => {
  const formData = new FormData();
  formData.append('file', file);

  return axiosInstance.post(`/admin/upload-calendar/${adminId}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};


export const updateCalendar = (adminId, holidays) => {
  return axiosInstance.post(`/admin/update-calendar/${adminId}`, holidays, {
    headers: {
      'Content-Type': 'application/json',
    },
  });
};


export const updateSingleHoliday = (adminId, holidayId, holidayData) =>
  axiosInstance.put(`/admin/update-single-holiday/${adminId}/${holidayId}`, holidayData, {
    headers: { 'Content-Type': 'application/json' },
  });