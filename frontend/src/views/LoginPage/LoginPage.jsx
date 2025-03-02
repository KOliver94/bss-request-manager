import { useState, useEffect, useCallback } from 'react';

import CircularProgress from '@mui/material/CircularProgress';
import Tooltip from '@mui/material/Tooltip';
import { isCancel } from 'axios';
import { useSnackbar } from 'notistack';
import { useNavigate, useLocation } from 'react-router';

import { loginSocial } from 'api/loginApi';
import background from 'assets/img/login.webp';
import Card from 'components/material-kit-react/Card/Card';
import CardFooter from 'components/material-kit-react/Card/CardFooter';
import CardHeader from 'components/material-kit-react/Card/CardHeader';
import Button from 'components/material-kit-react/CustomButtons/Button';
import Footer from 'components/material-kit-react/Footer/Footer';
import GridContainer from 'components/material-kit-react/Grid/GridContainer';
import GridItem from 'components/material-kit-react/Grid/GridItem';
import { isAuthenticated, isPrivileged } from 'helpers/authenticationHelper';
import {
  getOauthUrlAuthSch,
  getOauthUrlBssLogin,
  getOauthUrlGoogle,
  getOauthUrlMicrosoft,
} from 'helpers/oauthConstants';
import changePageTitle from 'helpers/pageTitleHelper';

import stylesModule from './LoginPage.module.scss';

function LoginPage() {
  const [cardAnimation, setCardAnimation] = useState('cardHidden');
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
        } else if (redirectedFrom.pathname?.startsWith('/my-requests/')) {
          redirectedFrom.pathname = redirectedFrom.pathname.replace(
            '/my-requests/',
            '/admin/requests/',
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
    async (type, data, signal) => {
      setLoading(true);

      const handleSuccess = () => {
        enqueueSnackbar('Sikeres bejelentkezés', {
          variant: 'success',
        });
        setLoading(false);
        redirect();
      };

      try {
        await loginSocial(type, data, { signal }).then(() => {
          handleSuccess();
        });
      } catch (e) {
        if (isCancel(e)) {
          return;
        }

        let message = 'Sikertelen bejelentkezés.';
        if (e.response && e.response.status === 401) {
          message = 'Hibás felhasználónév vagy jelszó!';
        }
        enqueueSnackbar(message, {
          variant: 'error',
          anchorOrigin: {
            vertical: 'bottom',
            horizontal: 'center',
          },
        });
        setLoading(false);
      }
    },
    [enqueueSnackbar, redirect],
  );

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
    const controller = new AbortController();

    if (code && provider) {
      setLoading(true);
      handleLogin(provider, code, controller.signal);
    }

    return () => {
      controller.abort();
    };
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
                  <Tooltip
                    title="Microsoft"
                    classes={{ tooltip: stylesModule.tooltip }}
                    placement="top"
                    arrow
                  >
                    <span>
                      <Button
                        justIcon
                        href={getOauthUrlMicrosoft({ operation: 'login' })}
                        onClick={handleButtonClick}
                        target="_self"
                        color="transparent"
                        disabled={loading}
                      >
                        <i className="fa-brands fa-microsoft" />
                      </Button>
                    </span>
                  </Tooltip>
                </div>
              </CardHeader>
              <p className={stylesModule.divider}>valamint BSS Tagoknak</p>
              <CardFooter className={stylesModule.cardFooter}>
                {loading ? (
                  <div className={stylesModule.circularProgressContainer}>
                    <CircularProgress
                      className={stylesModule.circularProgress}
                      size={30}
                    />
                  </div>
                ) : (
                  <Button
                    simple
                    color="primary"
                    size="lg"
                    href={getOauthUrlBssLogin({ operation: 'login' })}
                    onClick={handleButtonClick}
                    target="_self"
                  >
                    Bejelentkezés
                  </Button>
                )}
              </CardFooter>
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
