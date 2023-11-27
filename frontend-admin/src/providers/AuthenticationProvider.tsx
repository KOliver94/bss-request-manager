import {
  getAccessToken,
  getRefreshTokenExpirationTime,
  setRedirectedFrom,
} from 'helpers/LocalStorageHelper';

type AuthenticationProviderProps = {
  children: JSX.Element;
};

export const AuthenticationProvider = ({
  children,
}: AuthenticationProviderProps) => {
  const isRefreshTokenExpired = () => {
    const expirationTime = Number(getRefreshTokenExpirationTime());
    return !isNaN(expirationTime) && expirationTime < Date.now() / 1000;
  };

  if (
    (!getAccessToken() || isRefreshTokenExpired()) &&
    window.location.pathname.startsWith('/admin')
  ) {
    localStorage.clear();
    setRedirectedFrom(window.location.pathname);
    window.location.replace('/login');
  }

  return children;
};
