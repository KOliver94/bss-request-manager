export function getAccessToken() {
  return localStorage.getItem('access_token') || '';
}

export function getAvatar() {
  return localStorage.getItem('avatar') || undefined;
}

export function getDarkMode() {
  return localStorage.getItem('dark-mode');
}

export function getGroups() {
  return JSON.parse(localStorage.getItem('groups') || '[]');
}

export function getName() {
  return localStorage.getItem('name') || '';
}

export function getRefreshToken() {
  return localStorage.getItem('refresh_token') || '';
}

export function getRole() {
  return localStorage.getItem('role') || '';
}

export function getUserId() {
  return Number(localStorage.getItem('user_id'));
}

export function isAdmin() {
  return getRole() === 'admin';
}

export function setAccessToken(accessToken: string) {
  localStorage.setItem('access_token', accessToken);
}

export function setDarkMode(darkMode: boolean) {
  localStorage.setItem('dark-mode', JSON.stringify(darkMode));
}

export function setRefreshToken(refreshToken: string) {
  localStorage.setItem('refresh_token', refreshToken);
}
