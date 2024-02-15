import { jwtDecode } from 'jwt-decode';
import { groups as getGroupName } from 'src/helpers/enumConstants';
import axiosInstance from './apiUtils';

async function handleLogin(response) {
  const accessToken = response.data.access;
  const refreshToken = response.data.refresh;

  // Set auth header and save the tokens.
  axiosInstance.defaults.headers.Authorization = `Bearer ${accessToken}`;
  localStorage.setItem('access_token', accessToken);
  localStorage.setItem('refresh_token', refreshToken);

  // Decode the JWT token and save the name of the user, his role and his avatar.
  const decoded = jwtDecode(accessToken);
  localStorage.setItem('avatar', decoded.avatar);
  localStorage.setItem('name', decoded.name);
  localStorage.setItem('user_id', decoded.user_id);
  localStorage.setItem('role', decoded.role);

  const groups = decoded.groups?.map((group) => getGroupName(group));
  localStorage.setItem('groups', JSON.stringify(groups || []));

  localStorage.setItem('refresh_exp', jwtDecode(refreshToken).exp);

  window.dispatchEvent(new Event('storage'));
  return response;
}

export async function loginLdap(loginDetails, config) {
  await axiosInstance.post('login', loginDetails, config).then(handleLogin);
}

export async function loginSocial(provider, code, config) {
  await axiosInstance
    .post('login/social', { provider, code }, config)
    .then(handleLogin);
}

export async function logoutUser() {
  await axiosInstance
    .post('logout', {
      refresh: localStorage.getItem('refresh_token'),
    })
    .then((response) => {
      return response;
    })
    .catch((error) => {
      throw error;
    })
    .finally(() => {
      axiosInstance.defaults.headers.Authorization = null;
      localStorage.clear();
    });
}
