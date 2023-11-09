import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
// @mui components
import CircularProgress from '@mui/material/CircularProgress';
import InputAdornment from '@mui/material/InputAdornment';
import Icon from '@mui/material/Icon';
import Tooltip from '@mui/material/Tooltip';
// @mui/icons-material
import People from '@mui/icons-material/People';
// notistack (MUI Snackbars)
import { useSnackbar } from 'notistack';
// core components
import GridContainer from 'src/components/material-kit-react/Grid/GridContainer';
import GridItem from 'src/components/material-kit-react/Grid/GridItem';
import Button from 'src/components/material-kit-react/CustomButtons/Button';
import Card from 'src/components/material-kit-react/Card/Card';
import CardBody from 'src/components/material-kit-react/Card/CardBody';
import CardHeader from 'src/components/material-kit-react/Card/CardHeader';
import CardFooter from 'src/components/material-kit-react/Card/CardFooter';
import CustomInput from 'src/components/material-kit-react/CustomInput/CustomInput';
import Footer from 'src/components/material-kit-react/Footer/Footer';
// API calls and helpers
import {
  loginLdap,
  loginSocial,
  isPrivileged,
  isAuthenticated,
} from 'src/api/loginApi';
import {
  getOauthUrlAuthSch,
  getOauthUrlFacebook,
  getOauthUrlGoogle,
} from 'src/helpers/oauthConstants';
import changePageTitle from 'src/helpers/pageTitleHelper';

import background from 'src/assets/img/login.jpg';
import stylesModule from './LoginPage.module.scss';

function LoginPage() {
  const [cardAnimation, setCardAnimation] = useState('cardHidden');
  const [loginDetails, setLoginDetails] = useState({});
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const { enqueueSnackbar } = useSnackbar();
  const { code, provider } = { ...location.state };

  const getRedirectedFrom = useCallback(() => {
    if (localStorage.getItem('redirectedFrom')) {
      return { pathname: localStorage.getItem('redirectedFrom') };
    }
    return location.state?.from || { pathname: '/' };
  }, [location]);

  const redirect = useCallback(() => {
    if (isAuthenticated()) {
      const redirectedFrom = getRedirectedFrom();
      localStorage.removeItem('redirectedFrom');

      if (isPrivileged()) {
        if (redirectedFrom.pathname === '/') {
          redirectedFrom.pathname = '/admin';
        } else if (redirectedFrom.pathname?.startsWith('/my-requests')) {
          redirectedFrom.pathname = redirectedFrom.pathname.replace(
            '/my-requests',
            '/admin/requests',
          );
        }
      }

      if (redirectedFrom.pathname?.startsWith('/admin')) {
        window.location.replace(redirectedFrom.pathname);
      } else {
        navigate(redirectedFrom, { replace: true });
      }
    }
  }, [navigate, getRedirectedFrom]);

  const handleLogin = useCallback(
    async (type, data) => {
      setLoading(true);

      const handleSuccess = () => {
        enqueueSnackbar('Sikeres bejelentkezés', {
          variant: 'success',
        });
        redirect();
      };

      try {
        if (type === 'ldap') {
          await loginLdap(data).then(() => {
            handleSuccess();
          });
        } else {
          await loginSocial(type, data).then(() => {
            handleSuccess();
          });
        }
      } catch (e) {
        enqueueSnackbar(e.message, {
          variant: 'error',
          anchorOrigin: {
            vertical: 'bottom',
            horizontal: 'center',
          },
        });
      } finally {
        setLoading(false);
      }
    },
    [enqueueSnackbar, redirect],
  );

  const handleSubmit = (event) => {
    event.preventDefault();
    handleLogin('ldap', loginDetails);
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setLoginDetails((prevLoginDetails) => ({
      ...prevLoginDetails,
      [name]: value,
    }));
  };

  const handleButtonClick = () => {
    if (getRedirectedFrom().pathname) {
      localStorage.setItem('redirectedFrom', getRedirectedFrom().pathname);
    } else if (getRedirectedFrom()) {
      localStorage.setItem('redirectedFrom', getRedirectedFrom());
    }
  };

  useEffect(() => {
    changePageTitle('Bejelentkezés');
    redirect();
    const timer = setTimeout(() => setCardAnimation(''), 700);
    return () => {
      clearTimeout(timer);
    };
  }, [redirect]);

  useEffect(() => {
    if (code && provider) {
      setLoading(true);
      handleLogin(provider, code);
    }
  }, [code, provider, handleLogin]);

  return (
    <div
      className={stylesModule.pageHeader}
      style={{
        backgroundImage: `url(${background})`,
        backgroundSize: 'cover',
        backgroundPosition: 'top center',
      }}
    >
      <div className={stylesModule.container}>
        <GridContainer justifyContent="center">
          <GridItem xs={12} sm={12} md={4}>
            <Card className={stylesModule[cardAnimation]}>
              <form className={stylesModule.form} onSubmit={handleSubmit}>
                <CardHeader color="primary" className={stylesModule.cardHeader}>
                  <h4>Bejelentkezés felkérőknek</h4>
                  <div className={stylesModule.socialLine}>
                    <Tooltip
                      title="AuthSCH"
                      classes={{ tooltip: stylesModule.tooltip }}
                      placement="top"
                      arrow
                    >
                      <span>
                        <Button
                          justIcon
                          href={getOauthUrlAuthSch({ operation: 'login' })}
                          onClick={handleButtonClick}
                          target="_self"
                          color="transparent"
                          disabled={loading}
                        >
                          <i className="fa-brands icon-sch" />
                        </Button>
                      </span>
                    </Tooltip>
                    <Tooltip
                      title="Facebook"
                      classes={{ tooltip: stylesModule.tooltip }}
                      placement="top"
                      arrow
                    >
                      <span>
                        <Button
                          justIcon
                          href={getOauthUrlFacebook({ operation: 'login' })}
                          onClick={handleButtonClick}
                          target="_self"
                          color="transparent"
                          disabled={loading}
                        >
                          <i className="fa-brands fa-facebook" />
                        </Button>
                      </span>
                    </Tooltip>
                    <Tooltip
                      title="Google"
                      classes={{ tooltip: stylesModule.tooltip }}
                      placement="top"
                      arrow
                    >
                      <span>
                        <Button
                          justIcon
                          href={getOauthUrlGoogle({ operation: 'login' })}
                          onClick={handleButtonClick}
                          target="_self"
                          color="transparent"
                          disabled={loading}
                        >
                          <i className="fa-brands fa-google" />
                        </Button>
                      </span>
                    </Tooltip>
                  </div>
                </CardHeader>
                <p className={stylesModule.divider}>valamint BSS Tagoknak</p>
                <CardBody>
                  <CustomInput
                    labelText="Felhasználónév"
                    id="username"
                    formControlProps={{
                      fullWidth: true,
                    }}
                    labelProps={{
                      variant: 'standard',
                    }}
                    inputProps={{
                      type: 'username',
                      name: 'username',
                      onChange: (e) => handleChange(e),
                      disabled: loading,
                      required: true,
                      endAdornment: (
                        <InputAdornment position="end">
                          <People className={stylesModule.inputIconsColor} />
                        </InputAdornment>
                      ),
                    }}
                  />
                  <CustomInput
                    labelText="Jelszó"
                    id="pass"
                    formControlProps={{
                      fullWidth: true,
                    }}
                    labelProps={{
                      variant: 'standard',
                    }}
                    inputProps={{
                      type: 'password',
                      name: 'password',
                      onChange: (e) => handleChange(e),
                      disabled: loading,
                      required: true,
                      endAdornment: (
                        <InputAdornment position="end">
                          <Icon className={stylesModule.inputIconsColor}>
                            lock_outline
                          </Icon>
                        </InputAdornment>
                      ),
                      autoComplete: 'off',
                    }}
                  />
                </CardBody>
                <CardFooter className={stylesModule.cardFooter}>
                  {loading ? (
                    <div className={stylesModule.circularProgressContainer}>
                      <CircularProgress
                        className={stylesModule.circularProgress}
                        size={30}
                      />
                    </div>
                  ) : (
                    <Button simple color="primary" size="lg" type="submit">
                      Küldés
                    </Button>
                  )}
                </CardFooter>
              </form>
            </Card>
          </GridItem>
        </GridContainer>
      </div>
      <Footer whiteFont />
    </div>
  );
}

// eslint-disable-next-line import/prefer-default-export
export { LoginPage as Component };
