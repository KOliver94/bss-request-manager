import jwtDecode from 'jwt-decode';
import axiosInstance from './apiUtils';

async function handleLogin(response) {
  const accessToken = response.data.access
    ? response.data.access
    : response.data.token;
  // Set auth header and save the tokens.
  axiosInstance.defaults.headers.Authorization = `Bearer ${accessToken}`;
  localStorage.setItem('access_token', accessToken);
  localStorage.setItem('refresh_token', response.data.refresh);

  // Decode the JWT token and save the name of the user and his role.
  const decoded = jwtDecode(accessToken);
  localStorage.setItem('name', decoded.name);
  localStorage.setItem('role', decoded.role);
  localStorage.setItem('user_id', decoded.user_id);
  return response;
}

export async function loginLdap(loginDetails) {
  await axiosInstance
    .post('/login', loginDetails)
    .then(handleLogin)
    .catch((error) => {
      if (error.response && error.response.status === 401) {
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
      localStorage.clear();
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

export function isAdmin() {
  const role = localStorage.getItem('role');
  return role && role.toLowerCase() === 'admin';
}
