export function isRefreshTokenExpired() {
  const expirationTime = Number(localStorage.getItem('refresh_exp'));
  return Number.isNaN(expirationTime) || expirationTime < Date.now() / 1000;
}

export function isAuthenticated() {
  return !!localStorage.getItem('access_token') && !isRefreshTokenExpired();
}

export function isPrivileged() {
  const role = localStorage.getItem('role');
  return role && ['admin', 'staff'].includes(role.toLowerCase());
}

export function isSelf(userId) {
  const ownUserId = localStorage.getItem('user_id');
  return userId.toString() === ownUserId;
}
