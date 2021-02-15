const authSchScopes = [
  'basic',
  'mail',
  'displayName',
  'givenName',
  'sn',
  'mobile',
];

const facebookScopes = ['email'];
const facebookApiVersion = 'v9.0';

const googleScopes = [
  'https://www.googleapis.com/auth/userinfo.email',
  'https://www.googleapis.com/auth/userinfo.profile',
  'https://www.googleapis.com/auth/user.phonenumbers.read',
];

const redirectUri = `${window.location.protocol}//${window.location.host}/redirect`;

const createState = (state) => {
  return btoa(JSON.stringify(state));
};

export const getOauthCode = (location) => {
  return decodeURIComponent((location.search.match(/code=([^&]+)/) || [])[1]);
};

export const getOauthState = (location) => {
  return JSON.parse(
    atob(
      decodeURIComponent(
        (location.search.match(/state=([^&]+)/) || [])[1] || ''
      )
    ) || null
  );
};

export const getOauthUrlAuthSch = (paramState = {}) => {
  const state = { ...paramState, provider: 'authsch' };
  return `https://auth.sch.bme.hu/site/login?response_type=code&client_id=${
    process.env.REACT_APP_AUTHSCH_CLIENT_ID
  }&scope=${authSchScopes.join('+')}&state=${createState(state)}`;
};

export const getOauthUrlFacebook = (paramState = {}) => {
  const state = { ...paramState, provider: 'facebook' };
  return `https://www.facebook.com/${facebookApiVersion}/dialog/oauth?client_id=${
    process.env.REACT_APP_FACEBOOK_CLIENT_ID
  }&scope=${facebookScopes.join(
    '+'
  )}&redirect_uri=${redirectUri}&state=${createState(state)}`;
};

export const getOauthUrlGoogle = (paramState = {}) => {
  const state = { ...paramState, provider: 'google-oauth2' };
  return `https://accounts.google.com/o/oauth2/v2/auth?response_type=code&include_granted_scopes=true&client_id=${
    process.env.REACT_APP_GOOGLE_CLIENT_ID
  }&scope=${googleScopes.join(
    ' '
  )}&redirect_uri=${redirectUri}&state=${createState(state)}`;
};
