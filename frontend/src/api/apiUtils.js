import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// If axios instance has no Authorization header but we have token add the Header to the request
axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  const myConfig = config;
  if (!config.headers.Authorization && token) {
    myConfig.headers.Authorization = `Bearer ${token}`;
  }
  return myConfig;
});

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    const originalRequest = error.config;

    if (error.code === 'ECONNABORTED') {
      // console.error(`A timeout happened on url ${error.config.url}`);
    } else if (!error.response) {
      // console.error(`${error.message}`);
    }

    // If requests fail with 401 Unauthorized because JWT token is not valid try to get new token with refresh token.
    else if (
      error.response.status === 401 &&
      error.response.data.code === 'token_not_valid' &&
      error.config.url !== '/login/refresh' &&
      localStorage.getItem('refresh_token')
    ) {
      const refreshToken = localStorage.getItem('refresh_token');

      return axiosInstance
        .post('/login/refresh', { refresh: refreshToken })
        .then((response) => {
          const accessToken = response.data.access
            ? response.data.access
            : response.data.token;
          localStorage.setItem('access_token', accessToken);
          localStorage.setItem('refresh_token', response.data.refresh);

          axiosInstance.defaults.headers.Authorization = `Bearer ${accessToken}`;
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;

          return axiosInstance(originalRequest);
        })
        .catch(() => {
          // If an error occurs during token refresh log the user out.
          try {
            // Send the refresh token to the server to blacklist it.
            axiosInstance.post('/logout', {
              refresh: localStorage.getItem('refresh_token'),
            });
          } finally {
            // Remove tokens and auth header.
            axiosInstance.defaults.headers.Authorization = null;
            localStorage.clear();
            // console.error(`API call failed. User has been logged out. ${err}`);
            window.location.replace('/');
          }
        });
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
