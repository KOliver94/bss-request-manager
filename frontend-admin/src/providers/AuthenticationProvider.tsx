import React from 'react';

import {
  getAccessToken,
  isRefreshTokenExpired,
  setRedirectedFrom,
} from 'helpers/LocalStorageHelper';

type AuthenticationProviderProps = {
  children: React.JSX.Element;
};

export const AuthenticationProvider = ({
  children,
}: AuthenticationProviderProps) => {
  if (
    (!getAccessToken() || isRefreshTokenExpired()) &&
    window.location.pathname.startsWith('/admin')
  ) {
    localStorage.clear();
    setRedirectedFrom(window.location.pathname);
    window.location.replace('/login');
    return;
  }

  return children;
};
