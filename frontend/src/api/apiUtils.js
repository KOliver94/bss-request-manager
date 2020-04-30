import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
  timeout: 5000,
  headers: {
    Authorization: `Bearer ${localStorage.getItem('access_token')}`,
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    const originalRequest = error.config;

    if (error.code === 'ECONNABORTED') {
      throw new Error('Connection timeout.');
    }

    // If requests fail with 401 Unauthorized because JWT token is not valid try to get new token with refresh token.
    if (
      error.response.status === 401 &&
      error.response.data.code === 'token_not_valid' &&
      localStorage.getItem('refresh_token')
    ) {
      const refreshToken = localStorage.getItem('refresh_token');

      return axiosInstance
        .post('/login/refresh', { refresh: refreshToken })
        .then((response) => {
          localStorage.setItem('access_token', response.data.access);
          localStorage.setItem('refresh_token', response.data.refresh);

          axiosInstance.defaults.headers.Authorization = `Bearer ${response.data.access}`;
          originalRequest.headers.Authorization = `Bearer ${response.data.access}`;

          return axiosInstance(originalRequest);
        })
        .catch((err) => {
          // If an error occures during token refresh log the user out.
          try {
            // Send the refresh token to the server to blacklist it.
            axiosInstance.post('/logout', {
              refresh: localStorage.getItem('refresh_token'),
            });
          } finally {
            // Remove tokens and auth header.
            axiosInstance.defaults.headers.Authorization = null;
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
            localStorage.removeItem('name');
            localStorage.removeItem('role');
            console.error(`API call failed. User has been logged out. ${err}`);
          }
        });
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
