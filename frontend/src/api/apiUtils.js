import axios, { isAxiosError } from 'axios';
import { jwtDecode } from 'jwt-decode';
import { isRefreshTokenExpired } from 'helpers/authenticationHelper';

const axiosInstance = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL}/api/v1/`,
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

let refreshTokenPromise;

async function fetchRefreshToken(refreshToken) {
  const response = await axiosInstance.post('login/refresh', {
    refresh: refreshToken,
  });

  const accessToken = response.data.access;
  axiosInstance.defaults.headers.Authorization = `Bearer ${accessToken}`;
  refreshTokenPromise = null;

  return response;
}

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (!isAxiosError(error)) {
      return Promise.reject(error);
    }

    const originalRequest = error.config;
    const refreshToken = localStorage.getItem('refresh_token');

    if (
      error.response?.status === 401 &&
      error.response.data?.code === 'token_not_valid'
    ) {
      if (error.config?.url?.includes('logout') && originalRequest) {
        // If the access token expired on logout refresh the tokens
        // which will create a new refresh token so try to blacklist the new refresh token.
        refreshTokenPromise ??= fetchRefreshToken(refreshToken);
        const response = await refreshTokenPromise;

        const accessToken = response.data.access;
        const newRefreshToken = response.data.refresh;

        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        originalRequest.data = { refresh: newRefreshToken };
        return axiosInstance(originalRequest);
      }

      if (error.config?.url?.includes('/login/refresh')) {
        // This should be the case when the refresh token is not valid or blacklisted.
        // Redirect the user to the login page.
        axiosInstance.defaults.headers.Authorization = null;
        localStorage.clear();
        localStorage.setItem('redirectedFrom', window.location.pathname);
        window.location.href = '/login';
        return Promise.reject(error);
      }

      if (originalRequest && refreshToken && !isRefreshTokenExpired()) {
        // If requests fail with 401 Unauthorized because JWT token is not valid
        // try to get new token with refresh token.
        try {
          refreshTokenPromise ??= fetchRefreshToken(refreshToken);
          const response = await refreshTokenPromise;

          const accessToken = response.data.access;
          const newRefreshToken = response.data.refresh;

          localStorage.setItem('access_token', accessToken);
          localStorage.setItem('refresh_token', newRefreshToken);
          localStorage.setItem('refresh_exp', jwtDecode(newRefreshToken).exp);

          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return axiosInstance(originalRequest);
        } catch (err) {
          return Promise.reject(err);
        }
      }
    }
    return Promise.reject(error);
  },
);

export default axiosInstance;
