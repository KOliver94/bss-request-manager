import axiosInstance from './apiUtils';

export async function getUser(userId) {
  return axiosInstance.get(`/users/${userId}`);
}

export async function updateUser(userId, userData) {
  return axiosInstance.patch(`/users/${userId}`, userData);
}

export async function getUserWorkedOn(userId, fromDate, toDate, responsible) {
  return axiosInstance.get(`/users/${userId}/worked`, {
    params: { from_date: fromDate, to_date: toDate, responsible },
  });
}

export async function connectSocial(provider, code, force = false) {
  return axiosInstance.post(`/users/me/social/${provider}`, { code, force });
}

export async function disconnectSocial(provider) {
  return axiosInstance.delete(`/users/me/social/${provider}`);
}

export async function listStaffUsers() {
  return axiosInstance.get(`/users/staff`);
}
