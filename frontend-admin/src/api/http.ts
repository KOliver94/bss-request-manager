import axios, { isAxiosError } from 'axios';
import type { AxiosResponse } from 'axios';
import { jwtDecode } from 'jwt-decode';

import {
  getAccessToken,
  getRefreshToken,
  isRefreshTokenExpired,
  setAccessToken,
  setRedirectedFrom,
  setRefreshToken,
  setRefreshTokenExpirationTime,
} from 'helpers/LocalStorageHelper';

import {
  AdminApiFactory,
  LoginApiFactory,
  LogoutApiFactory,
  RequestsApiFactory,
} from './api';
import { TokenRefresh } from './models';

// TODO: Create some validation view to check if all local storage elements exists otherwise redirect to login

const axiosInstance = axios.create({
  headers: {
    'Accept-Language': 'hu',
    Authorization: `Bearer ${getAccessToken()}`,
  },
});

const basePath = import.meta.env.VITE_API_URL;
let refreshTokenPromise: null | Promise<AxiosResponse<TokenRefresh>>;

async function fetchRefreshToken(refreshToken: string) {
  const response = await loginApi.loginRefreshCreate({
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
    const refreshToken = getRefreshToken();

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
        setRedirectedFrom(window.location.pathname);
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

          setAccessToken(accessToken);
          setRefreshToken(newRefreshToken);
          setRefreshTokenExpirationTime(jwtDecode(newRefreshToken).exp);

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

export const adminApi = AdminApiFactory(undefined, basePath, axiosInstance);
export const loginApi = LoginApiFactory(undefined, basePath, axiosInstance);
export const logoutApi = LogoutApiFactory(undefined, basePath, axiosInstance);
export const requestsApi = RequestsApiFactory(
  undefined,
  basePath,
  axiosInstance,
);
