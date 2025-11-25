import axios from 'axios';

import Swal from 'sweetalert2';
 
const axiosInstance = axios.create({

  baseURL: 'http://localhost:8765',

  headers: {

    'Content-Type': 'application/json',

  },

});
 
// Request interceptor to attach token

axiosInstance.interceptors.request.use(

  (config) => {

    const token = sessionStorage.getItem('token');

    if (token) {

      config.headers.Authorization = `Bearer ${token}`;

    }

    return config;

  },

  (error) => Promise.reject(error)

);
 
// Response interceptor to handle token expiration

axiosInstance.interceptors.response.use(

  (response) => response,

  (error) => {

    if (error.response && error.response.status === 401) {

      Swal.fire({

        icon: 'warning',

        title: 'Session Expired',

        text: 'Your session has expired. Please log in again.',

        confirmButtonText: 'Go to Login',

      }).then(() => {

        sessionStorage.removeItem('token');

        window.location.href = '/';

      });

    }

    return Promise.reject(error);

  }

);
 
export default axiosInstance;

 