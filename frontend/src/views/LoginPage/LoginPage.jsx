import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import PropTypes from 'prop-types';
// @mui components
import makeStyles from '@mui/styles/makeStyles';
import CircularProgress from '@mui/material/CircularProgress';
import InputAdornment from '@mui/material/InputAdornment';
import Icon from '@mui/material/Icon';
import Tooltip from '@mui/material/Tooltip';
// @mui/icons-material
import People from '@mui/icons-material/People';
// notistack (MUI Snackbars)
import { useSnackbar } from 'notistack';
// core components
import Header from 'components/material-kit-react/Header/Header';
import HeaderLinks from 'components/material-kit-react/Header/HeaderLinks';
import Footer from 'components/material-kit-react/Footer/Footer';
import GridContainer from 'components/material-kit-react/Grid/GridContainer';
import GridItem from 'components/material-kit-react/Grid/GridItem';
import Button from 'components/material-kit-react/CustomButtons/Button';
import Card from 'components/material-kit-react/Card/Card';
import CardBody from 'components/material-kit-react/Card/CardBody';
import CardHeader from 'components/material-kit-react/Card/CardHeader';
import CardFooter from 'components/material-kit-react/Card/CardFooter';
import CustomInput from 'components/material-kit-react/CustomInput/CustomInput';
// API calls and helpers
import { loginLdap, loginSocial, isPrivileged } from 'api/loginApi';
import {
  getOauthUrlAuthSch,
  getOauthUrlFacebook,
  getOauthUrlGoogle,
} from 'helpers/oauthConstants';
import changePageTitle from 'helpers/pageTitleHelper';

import styles from 'assets/jss/material-kit-react/views/loginPage';
import background from 'assets/img/bg7.jpg';

const useStyles = makeStyles(styles);

export default function LoginPage({ isAuthenticated, setIsAuthenticated }) {
  const [cardAnimation, setCardAnimation] = useState('cardHidden');
  const [loginDetails, setLoginDetails] = useState({});
  const [loading, setLoading] = useState(false);

  const classes = useStyles();
  const navigate = useNavigate();
  const location = useLocation();
  const { enqueueSnackbar } = useSnackbar();

  const { from } = location.state || {
    from: { pathname: localStorage.getItem('redirectedFrom') || '/' },
  };
  const { code, provider } = { ...location.state };

  const handleLogin = useCallback(
    async (type, data) => {
      setLoading(true);

      const handleSuccess = () => {
        setIsAuthenticated(true);
        localStorage.removeItem('redirectedFrom');
        enqueueSnackbar('Sikeres bejelentkezés', {
          variant: 'success',
        });
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
        setLoading(false);
        navigate({ replace: true });
      }
    },
    [enqueueSnackbar, navigate, setIsAuthenticated]
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
    if (from.pathname) {
      localStorage.setItem('redirectedFrom', from.pathname);
    } else if (from) {
      localStorage.setItem('redirectedFrom', from);
    }
  };

  useEffect(() => {
    changePageTitle('Bejelentkezés');
    const timer = setTimeout(() => setCardAnimation(''), 700);
    return () => {
      clearTimeout(timer);
    };
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      if (from.pathname === '/' && isPrivileged()) {
        from.pathname = '/admin/requests';
      }
      navigate(from, { replace: true });
    }
  });

  useEffect(() => {
    if (code && provider) {
      setLoading(true);
      handleLogin(provider, code);
    }
  }, [code, provider, handleLogin]);

  return (
    <div>
      <Header
        absolute
        color="transparent"
        brand="BSS Felkéréskezelő"
        rightLinks={<HeaderLinks hideLogin />}
      />
      <div
        className={classes.pageHeader}
        style={{
          backgroundImage: `url(${background})`,
          backgroundSize: 'cover',
          backgroundPosition: 'top center',
        }}
      >
        <div className={classes.container}>
          <GridContainer justifyContent="center">
            <GridItem xs={12} sm={12} md={4}>
              <Card className={classes[cardAnimation]}>
                <form className={classes.form} onSubmit={handleSubmit}>
                  <CardHeader color="primary" className={classes.cardHeader}>
                    <h4>Bejelentkezés felkérőknek</h4>
                    <div className={classes.socialLine}>
                      <Tooltip
                        title="AuthSCH"
                        classes={{ tooltip: classes.tooltip }}
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
                            <i className="fab icon-sch" />
                          </Button>
                        </span>
                      </Tooltip>
                      <Tooltip
                        title="Facebook"
                        classes={{ tooltip: classes.tooltip }}
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
                        classes={{ tooltip: classes.tooltip }}
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
                  <p className={classes.divider}>valamint BSS Tagoknak</p>
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
                            <People className={classes.inputIconsColor} />
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
                            <Icon className={classes.inputIconsColor}>
                              lock_outline
                            </Icon>
                          </InputAdornment>
                        ),
                        autoComplete: 'off',
                      }}
                    />
                  </CardBody>
                  <CardFooter className={classes.cardFooter}>
                    {loading ? (
                      <div className={classes.circularProgressContainer}>
                        <CircularProgress
                          className={classes.circularProgress}
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
    </div>
  );
}

LoginPage.propTypes = {
  isAuthenticated: PropTypes.bool.isRequired,
  setIsAuthenticated: PropTypes.func.isRequired,
};
