import jwtDecode from 'jwt-decode';
import axiosInstance from './apiUtils';

async function handleLogin(response) {
  // Set auth header and save the tokens.
  axiosInstance.defaults.headers.Authorization = `Bearer ${response.data.access}`;
  localStorage.setItem('access_token', response.data.access);
  localStorage.setItem('refresh_token', response.data.refresh);

  // Decode the JWT token and save the name of the user and his role.
  const decoded = jwtDecode(response.data.access);
  localStorage.setItem('name', decoded.name);
  localStorage.setItem('role', decoded.role);
  return response;
}

export async function loginLdap(loginDetails) {
  await axiosInstance
    .post('/login', loginDetails)
    .then(handleLogin)
    .catch((error) => {
      if (error.response.status === 401) {
        throw new Error('Hibás felhasználónév vagy jelszó!');
      }
      throw new Error('Network response was not ok.');
    });
}

export async function loginSocial(provider, code) {
  await axiosInstance
    .post(`/login/social/${provider}`, { code })
    .then(handleLogin)
    .catch(() => {
      throw new Error('Network response was not ok.');
    });
}

export async function logoutUser() {
  await axiosInstance
    .post('/logout', {
      refresh: localStorage.getItem('refresh_token'),
    })
    .then((response) => {
      return response;
    })
    .catch((error) => {
      console.error(`API call failed. ${error}`);
      throw error;
    })
    .finally(() => {
      axiosInstance.defaults.headers.Authorization = null;
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('name');
      localStorage.removeItem('role');
    });
}

export function isAuthenticated() {
  return !!localStorage.getItem('access_token');
}

export function isAdminOrStaff() {
  const role = localStorage.getItem('role');
  return (
    role && (role.toLowerCase() === 'admin' || role.toLowerCase() === 'staff')
  );
}
