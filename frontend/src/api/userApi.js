import axiosInstance from './apiUtils';

export async function getUserMe() {
  return axiosInstance.get('/users/me');
}

export async function updateUserMe(userData) {
  return axiosInstance.patch('/users/me', userData);
}

export async function listStaffUsers() {
  return axiosInstance.get(`/users/staff`);
}
