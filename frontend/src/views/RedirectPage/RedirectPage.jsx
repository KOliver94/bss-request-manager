import { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { getOauthCode, getOauthState } from 'helpers/oauthConstants';
import changePageTitle from 'helpers/pageTitleHelper';

export default function RedirectPage() {
  const location = useLocation();
  const code = getOauthCode(location);
  const state = getOauthState(location);

  const isValidOauthRedirect = () =>
    code &&
    state &&
    ['authsch', 'facebook', 'google-oauth2'].includes(state.provider) &&
    ['login', 'profile'].includes(state.operation);

  useEffect(() => {
    changePageTitle('Átirányítás...');
  }, []);

  return (
    <>
      {isValidOauthRedirect() ? (
        <Navigate
          to={{
            pathname: state.operation,
            state: { code, provider: state.provider },
          }}
          replace
        />
      ) : (
        <Navigate to="/" replace />
      )}
    </>
  );
}
