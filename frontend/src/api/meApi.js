import axiosInstance from './apiUtils';

export async function getMe() {
  return axiosInstance.get('me');
}

export async function updateMe(userData) {
  return axiosInstance.patch('me', userData);
}

export async function getMeWorkedOn(fromDate, toDate, responsible) {
  return axiosInstance.get('me/worked_on', {
    params: {
      start_datetime_after: fromDate,
      start_datetime_before: toDate,
      is_responsible: responsible,
    },
  });
}

export async function connectSocial(provider, code) {
  return axiosInstance.post(`me/social/${provider}`, { code });
}

export async function disconnectSocial(provider) {
  return axiosInstance.delete(`me/social/${provider}`);
}
