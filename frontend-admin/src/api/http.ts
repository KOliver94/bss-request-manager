import axios from 'axios';

import { AdminApiFactory, LoginApiFactory, LogoutApiFactory } from './api';

// TODO: Create some validation view to check if all local storage elements exists otherwise redirect to login

const axiosInstance = axios.create({
  headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` },
});

const basePath = import.meta.env.VITE_API_URL;

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const refreshToken = localStorage.getItem('refresh_token');

    // If requests fail with 401 Unauthorized because JWT token is not valid try to get new token with refresh token.
    if (
      error.response?.status === 401 &&
      error.response?.data?.code === 'token_not_valid' &&
      !error.config?.url.includes('/login/refresh') &&
      refreshToken
    ) {
      try {
        const response = await LoginApiFactory(
          undefined,
          basePath,
        ).loginRefreshCreate({
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
        window.location.replace('/');
      }
    }
    return Promise.reject(error);
  },
);

export const adminApi = AdminApiFactory(undefined, basePath, axiosInstance);
export const logoutApi = LogoutApiFactory(undefined, basePath, axiosInstance);
