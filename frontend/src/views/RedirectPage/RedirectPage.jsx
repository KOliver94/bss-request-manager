import { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router';
import { getOauthCode, getOauthState } from 'helpers/oauthConstants';
import changePageTitle from 'helpers/pageTitleHelper';

export default function RedirectPage() {
  const location = useLocation();
  const code = getOauthCode(location);
  const state = getOauthState(location);

  const isValidOauthRedirect = () =>
    code &&
    state &&
    ['authsch', 'bss-login', 'google-oauth2', 'microsoft-graph'].includes(
      state.provider,
    ) &&
    ['login', 'profile'].includes(state.operation);

  useEffect(() => {
    changePageTitle('Átirányítás...');
  }, []);

  return (
    <>
      {isValidOauthRedirect() ? (
        <Navigate
          to={`/${state.operation}`}
          state={{ code, provider: state.provider }}
          replace
        />
      ) : (
        <Navigate to="/" replace />
      )}
    </>
  );
}
