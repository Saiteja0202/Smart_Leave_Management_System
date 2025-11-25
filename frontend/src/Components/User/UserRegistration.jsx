import { useEffect, useState } from 'react';
import {
  Container, TextField, Button, Typography, Box, Link, CircularProgress,
  MenuItem, useMediaQuery, useTheme, IconButton, InputAdornment
} from '@mui/material';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';
import { getAllCountriesForUsers, registerUser, getAllCities } from '../ApiCenter/UserApi';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import axios from "axios";
// import { fetchPhoneCountries } from "./phoneCountries";
const UserRegistration = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    userName: '',
    email: '',
    password: '',
    address: '',
    gender: '',
    countryName: '',
    cityName: '',   
  });
  const [phoneCountries, setPhoneCountries] = useState([]);
  const [countryCode, setCountryCode] = useState("");
  const [localNumber, setLocalNumber] = useState("");
  // const [phoneValid, setPhoneValid] = useState(null);

  const [countries, setCountries] = useState([]);
  const [cities, setCities] = useState([]); 
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [usernameValid, setUsernameValid] = useState(null);
  const [emailValid, setEmailValid] = useState(null);
  const [passwordValid, setPasswordValid] = useState(null);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const navigate = useNavigate();

  const passwordRegex = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[\W_]).{8,}$/;
  const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9-]+\.[a-zA-Z]{2,}$/;
  const phoneRegex = /^\d{10}$/;
  const usernameRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{4,}$/;

  useEffect(() => {
    const fetchPhoneCountries = async () => {
      try {
        const res = await axios.get(
          "https://restcountries.com/v3.1/all?fields=name,idd"
        );
        const list = res.data
          .filter(c => c.idd?.root) 
          .map(c => ({
            name: c.name?.common ?? "Unknown",
            code: `${c.idd.root}${c.idd.suffixes?.[0] ?? ""}`,
          }))
          .filter(c => c.code && c.code.startsWith("+"))
          .sort((a, b) => a.name.localeCompare(b.name));
        setPhoneCountries(list);
      } catch (err) {
        console.error("Error fetching phone countries:", err.message);
        setPhoneCountries([]);
      }
    };
    fetchPhoneCountries();
  }, []);



  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const res = await getAllCountriesForUsers();
        setCountries(res.data);
      } catch {
        setCountries([]);
      }
    };
    fetchCountries();
  }, []);

  useEffect(() => {
    const fetchCities = async () => {
      if (formData.countryName) {
        try {
          const res = await getAllCities(formData.countryName);
          setCities(res.data);
        } catch {
          setCities([]);
        }
      } else {
        setCities([]);
      }
    };
    fetchCities();
  }, [formData.countryName]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    let updatedValue = name === 'gender' ? value.toUpperCase() : value;

    setFormData((prev) => ({
      ...prev,
      [name]: updatedValue,
    }));

    if (name === 'password') setPasswordValid(passwordRegex.test(value));
    if (name === 'userName') setUsernameValid(usernameRegex.test(value));
    if (name === 'email') setEmailValid(emailRegex.test(value));
  };

  const validateForm = () => {
    return (
      formData.firstName.trim() &&
      formData.lastName.trim() &&
      formData.address.trim() &&
      formData.gender &&
      formData.countryName &&
      formData.cityName && // ➕ Ensure city is selected
      emailRegex.test(formData.email) &&
      phoneRegex.test(localNumber) &&
      usernameRegex.test(formData.userName) &&
      passwordRegex.test(formData.password)
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const formattedData = {
      ...formData,
      phoneNumber: `${countryCode}-${localNumber}`,
    };

    try {
      const response = await registerUser(formattedData);
      await Swal.fire({
        icon: 'success',
        title: 'Registration Successful',
        text: response.data,
        confirmButtonColor: '#3085d6',
      });
      navigate('/user-login');
    } catch (error) {
      const status = error.response?.status;
      const message = error.response?.data || 'Registration failed. Please try again.';
      Swal.fire({
        icon: 'error',
        title: `Error ${status || ''}`,
        text: message,
        confirmButtonColor: '#d33',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="md">
      <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', px: 2 }}>
        <Box sx={{ width: '100%', maxWidth: 600, p: isMobile ? 3 : 5, boxShadow: 3, borderRadius: 3, backgroundColor: '#fff' }}>
          <Typography variant={isMobile ? 'h5' : 'h4'} align="center" gutterBottom>
            User Registration
          </Typography>
          <Typography align="center" sx={{ mt: 2 }}>
            Already have an account?{' '}
            <Link href="/user-login" underline="hover">
              Go to login
            </Link>
          </Typography>
          <form onSubmit={handleSubmit}>
            <TextField fullWidth label="First Name" name="firstName" value={formData.firstName} onChange={handleChange} margin="normal" required />
            <TextField fullWidth label="Last Name" name="lastName" value={formData.lastName} onChange={handleChange} margin="normal" required />

            <TextField
              fullWidth
              label="Username"
              name="userName"
              value={formData.userName}
              onChange={handleChange}
              margin="normal"
              required
              helperText="Must include 1 capital letter, 1 digit, and 1 symbol"
              error={usernameValid === false}
              sx={{
                '& .MuiOutlinedInput-root': {
                  '& fieldset': {
                    borderColor: usernameValid === true ? 'green' : usernameValid === false ? 'red' : undefined,
                  },
                },
              }}
            />

            <TextField
              fullWidth
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              margin="normal"
              required
              error={emailValid === false}
              sx={{
                '& .MuiOutlinedInput-root': {
                  '& fieldset': {
                    borderColor: emailValid === true ? 'green' : emailValid === false ? 'red' : undefined,
                  },
                },
              }}
            />

      <Box sx={{ display: "flex", gap: 2, flexDirection: isMobile ? "column" : "row", mt: 2 }}>
        <TextField
          select
          label="Country Code"
          value={countryCode}
          onChange={(e) => setCountryCode(e.target.value)}
          fullWidth
        >
          {(phoneCountries ?? []).map((c) => (
            <MenuItem key={`${c.name}-${c.code}`} value={c.code}>
              {c.name} ({c.code})
            </MenuItem>
          ))}
        </TextField>

        {/* Phone Number Input (no validation now) */}
        <TextField
          label="Phone Number"
          value={localNumber}
          onChange={(e) => setLocalNumber(e.target.value.replace(/\D/g, ""))}
          fullWidth
          placeholder="1234567890"
          helperText="Enter phone number"
        />
      </Box>

            <TextField fullWidth label="Address" name="address" value={formData.address} onChange={handleChange} margin="normal" required />

            <TextField fullWidth select label="Gender" name="gender" value={formData.gender} onChange={handleChange} margin="normal" required>
              <MenuItem value="MALE">Male</MenuItem>
              <MenuItem value="FEMALE">Female</MenuItem>
              <MenuItem value="OTHER">Other</MenuItem>
            </TextField>

            <TextField fullWidth select label="Country" name="countryName" value={formData.countryName} onChange={handleChange} margin="normal" required>
              {countries.map((country) => (
                <MenuItem key={country} value={country}>{country}</MenuItem>
              ))}
            </TextField>

            {/* ➕ New City Dropdown */}
            <TextField fullWidth select label="City" name="cityName" value={formData.cityName} onChange={handleChange} margin="normal" required>
              {cities.map((city) => (
                <MenuItem key={city} value={city}>{city}</MenuItem>
              ))}
            </TextField>

            <TextField
              fullWidth
              label="Password"
              name="password"
              type={showPassword ? 'text' : 'password'} 
              value={formData.password}
              onChange={handleChange}
              margin="normal"
              required
              helperText="Min 8 chars, 1 uppercase, 1 lowercase, 1 digit, 1 symbol"
              error={passwordValid === false}
              sx={{
                '& .MuiOutlinedInput-root': {
                  '& fieldset': {
                    borderColor: passwordValid === true ? 'green' : passwordValid === false ? 'red' : undefined,
                  },
                },
              }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowPassword((prev) => !prev)} edge="end">
                      {showPassword ? <Visibility /> : <VisibilityOff />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <Button
              fullWidth
              type="submit"
              variant="contained"
              color="primary"
              disabled={!validateForm() || loading}
              sx={{ mt: 2 }}
              size={isMobile ? 'medium' : 'large'}
            >
              {loading ? <CircularProgress size={24} /> : 'Register'}
            </Button>
          </form>
        </Box>
      </Box>
    </Container>
  );
};

export default UserRegistration;
