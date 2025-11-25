import axiosInstance from './axiosInstance.jsx';
import axios from 'axios';

const BASE_URL = 'http://localhost:8765';

export const registerUser = (userData) =>
  axios.post(`${BASE_URL}/users/registration`, userData);

export const loginUser = (loginDetails) =>
  axios.post(`${BASE_URL}/users/login`, loginDetails);

export const updateUserDetails = (userId, updatedUser) =>
  axiosInstance.put(`/users/update/${userId}`, updatedUser);

export const getUserDetails = (userId) =>
  axiosInstance.get(`/users/get-user-details/${userId}`);

export const deleteAccount = (userId) =>
  axiosInstance.delete(`/users/delete-account/${userId}`);

export const generateOtpForPassword = (email) =>
  axios.post(`${BASE_URL}/users/forgot-password/generate-otp`, email);

export const generateOtpForUsername = (email) =>
  axios.post(`${BASE_URL}/users/forgot-username/generate-otp`, email);

export const verifyOtpForPassword = (otp) =>
  axios.post(`${BASE_URL}/users/forgot-password/verify-otp`, otp);

export const verifyOtpForUsername = (otp) =>
  axios.post(`${BASE_URL}/users/forgot-username/verify-otp`, otp);

export const getAllCities = (countryName) =>
  axios.get(`${BASE_URL}/users/get-all-cities/${countryName}`);


export const updatePassword = (userId, updatePasswordDetails) =>
  axiosInstance.put(`/users/update-password/${userId}`, updatePasswordDetails );

export const updateNewPassword = (userId, forgotDetails) =>
  axios.put(`${BASE_URL}/users/update-new-password/${userId}`, forgotDetails);

export const getAllCountriesForUsers = () =>
  axiosInstance.get(`/users/get-all-countries`);

export const getUserHolidays = (userId) =>
  axiosInstance.get(`/users/get-holidays/${userId}`);

export const getUserLeaveBalance = (userId) =>
  axiosInstance.get(`/users/get-leave-balance/${userId}`);

export const calculateLeaveDuration = (userId, startDate, endDate) =>
  axiosInstance.post(`/users/calculate-duration/${userId}`, { startDate, endDate });

export const applyLeave = (userId, leaveApplicationForm) =>
  axiosInstance.post(`/users/apply-leave/${userId}`, leaveApplicationForm);

export const getUserLeaveRequests = (userId) =>
  axiosInstance.get(`/users/get-leave-requests/${userId}`);

export const getAllUserLeaveRequests = (userId) =>
  axiosInstance.get(`/users/get-all-leave-requests/${userId}`);

export const getAllUserLeaveBalances = (userId) =>
  axiosInstance.get(`/users/get-all-users-leave-balance/${userId}`);

export const approveUserLeave = (userId, requesterId) =>
  axiosInstance.post(`/users/approve-leave/${userId}/${requesterId}`);

export const rejectUserLeave = (userId, requesterId) =>
  axiosInstance.post(`/users/reject-leave/${userId}/${requesterId}`);

export const cancelLeave = (userId, leaveId) =>
  axiosInstance.put(`/users/cancel-leave/${userId}/${leaveId}`);
