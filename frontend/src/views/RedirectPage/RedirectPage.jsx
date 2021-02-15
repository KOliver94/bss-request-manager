import { Redirect, useLocation } from 'react-router-dom';
import { getOauthCode, getOauthState } from 'helpers/oauthConstants';

export default function RedirectPage() {
  const location = useLocation();
  const code = getOauthCode(location);
  const state = getOauthState(location);

  const isValidOauthRedirect = () =>
    code &&
    state &&
    ['authsch', 'facebook', 'google-oauth2'].includes(state.provider) &&
    ['login', 'profile'].includes(state.operation);

  return (
    <>
      {isValidOauthRedirect() ? (
        <Redirect
          to={{
            pathname: state.operation,
            state: { code, provider: state.provider },
          }}
        />
      ) : (
        <Redirect to="/" />
      )}
    </>
  );
}
