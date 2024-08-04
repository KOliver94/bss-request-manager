const authSchScopes = [
  'directory.sch.bme.hu:sAMAccountName',
  'email',
  'openid',
  'phone',
  'profile',
];

const bssLoginScopes = ['email', 'mobile', 'name', 'openid', 'profile'];

const googleScopes = [
  'https://www.googleapis.com/auth/userinfo.email',
  'https://www.googleapis.com/auth/userinfo.profile',
  'https://www.googleapis.com/auth/user.phonenumbers.read',
];

const microsoftScopes = ['https://graph.microsoft.com/.default'];

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
        (location.search.match(/state=([^&]+)/) || [])[1] || '',
      ),
    ) || null,
  );
};

export const getOauthUrlAuthSch = (paramState = {}) => {
  const state = { ...paramState, provider: 'authsch' };
  return `https://auth.sch.bme.hu/site/login?response_type=code&client_id=${
    import.meta.env.VITE_AUTHSCH_CLIENT_ID
  }&scope=${authSchScopes.join('+')}&state=${createState(state)}`;
};

export const getOauthUrlBssLogin = (paramState = {}) => {
  const state = { ...paramState, provider: 'bss-login' };
  return `https://login.bsstudio.hu/application/o/authorize/?response_type=code&client_id=${
    import.meta.env.VITE_BSS_CLIENT_ID
  }&scope=${bssLoginScopes.join(
    '+',
  )}&redirect_uri=${redirectUri}&state=${createState(state)}`;
};

export const getOauthUrlGoogle = (paramState = {}) => {
  const state = { ...paramState, provider: 'google-oauth2' };
  return `https://accounts.google.com/o/oauth2/v2/auth?response_type=code&include_granted_scopes=true&client_id=${
    import.meta.env.VITE_GOOGLE_CLIENT_ID
  }&scope=${googleScopes.join(
    ' ',
  )}&redirect_uri=${redirectUri}&state=${createState(state)}`;
};

export const getOauthUrlMicrosoft = (paramState = {}) => {
  const state = { ...paramState, provider: 'microsoft-graph' };
  return `https://login.microsoftonline.com/common/oauth2/v2.0/authorize?&response_type=code&response_mode=query&client_id=${
    import.meta.env.VITE_MICROSOFT_CLIENT_ID
  }&scope=${microsoftScopes.join(
    ' ',
  )}&redirect_uri=${redirectUri}&state=${createState(state)}`;
};
