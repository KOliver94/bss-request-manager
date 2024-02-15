export function isRefreshTokenExpired() {
  const expirationTime = Number(localStorage.getItem('refresh_exp'));
  return Number.isNaN(expirationTime) || expirationTime < Date.now() / 1000;
}

export function isAuthenticated() {
  if (!localStorage.getItem('access_token')) {
    return false;
  }

  if (isRefreshTokenExpired()) {
    const redirectedFrom = localStorage.getItem('redirectedFrom');
    localStorage.clear();
    if (redirectedFrom) localStorage.setItem('redirectedFrom', redirectedFrom);
    return false;
  }

  return true;
}

export function isPrivileged() {
  const role = localStorage.getItem('role');
  return role && ['admin', 'staff'].includes(role.toLowerCase());
}

export function isSelf(userId) {
  const ownUserId = localStorage.getItem('user_id');
  return userId.toString() === ownUserId;
}
