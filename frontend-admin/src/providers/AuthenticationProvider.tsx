import { getAccessToken, setRedirectedFrom } from 'helpers/LocalStorageHelper';

type AuthenticationProviderProps = {
  children: JSX.Element;
};

export const AuthenticationProvider = ({
  children,
}: AuthenticationProviderProps) => {
  if (!getAccessToken() && window.location.pathname.startsWith('/admin')) {
    setRedirectedFrom(window.location.pathname);
    window.location.replace('/login');
  }

  return children;
};
