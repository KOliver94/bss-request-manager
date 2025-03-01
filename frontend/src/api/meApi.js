import axiosInstance from 'api/apiUtils';

export async function getMe(config) {
  return axiosInstance.get('me', config);
}

export async function updateMe(userData) {
  return axiosInstance.patch('me', userData);
}

export async function getMeWorkedOn(fromDate, toDate, responsible, config) {
  return axiosInstance.get('me/worked_on', {
    ...config,
    params: {
      start_datetime_after: fromDate,
      start_datetime_before: toDate,
      is_responsible: responsible,
    },
  });
}

export async function connectSocial(provider, code, config) {
  return axiosInstance.post(`me/social/${provider}`, { code }, config);
}

export async function disconnectSocial(provider) {
  return axiosInstance.delete(`me/social/${provider}`);
}
