import axios, { isAxiosError } from 'axios';

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

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (!isAxiosError(error)) {
      return Promise.reject(error);
    }

    const originalRequest = error.config;
    const refreshToken = localStorage.getItem('refresh_token');

    // If requests fail with 401 Unauthorized because JWT token is not valid try to get new token with refresh token.
    if (
      error.response?.status === 401 &&
      error.response.data?.code === 'token_not_valid' &&
      !error.config?.url?.includes('login/refresh') &&
      originalRequest &&
      refreshToken
    ) {
      try {
        const response = axiosInstance.post('login/refresh', {
          refresh: refreshToken,
        });
        const accessToken = response.data.access;
        localStorage.setItem('access_token', accessToken);
        localStorage.setItem('refresh_token', response.data.refresh);

        axiosInstance.defaults.headers.Authorization = `Bearer ${accessToken}`;
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return await axiosInstance(originalRequest);
      } catch {
        // If an error occurs during token refresh log the user out.
        // Remove tokens and auth header.
        axiosInstance.defaults.headers.Authorization = null;
        localStorage.clear();
        window.location.href = '/';
      }
    }

    return Promise.reject(error);
  },
);

export default axiosInstance;
