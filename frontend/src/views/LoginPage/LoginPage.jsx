import React, { useState, useEffect, useCallback } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import PropTypes from 'prop-types';
// @material-ui/core components
import { makeStyles } from '@material-ui/core/styles';
import CircularProgress from '@material-ui/core/CircularProgress';
import InputAdornment from '@material-ui/core/InputAdornment';
import Icon from '@material-ui/core/Icon';
// @material-ui/icons
import People from '@material-ui/icons/People';
// notistack (Material UI Snackbars)
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

import styles from 'assets/jss/material-kit-react/views/loginPage';

import background from 'assets/img/bg7.jpg';

import { loginLdap, loginSocial } from 'api/loginApi';

const useStyles = makeStyles(styles);

export default function LoginPage({ isAuthenticated, setIsAuthenticated }) {
  const [cardAnimaton, setCardAnimation] = useState('cardHidden');
  const [loginDetails, setloginDetails] = useState({});
  const [loading, setLoading] = useState(false);

  const classes = useStyles();
  const history = useHistory();
  const location = useLocation();
  const { enqueueSnackbar } = useSnackbar();

  const { from } = location.state || { from: { pathname: '/' } };

  const handleLogin = useCallback(
    async (type, data) => {
      setLoading(true);

      const handleSuccess = () => {
        setIsAuthenticated(true);
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
        history.replace('/login');
      } finally {
        setLoading(false);
      }
    },
    [enqueueSnackbar, history, setIsAuthenticated]
  );

  const handleSubmit = (event) => {
    event.preventDefault();
    handleLogin('ldap', loginDetails);
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setloginDetails((prevLoginDetails) => ({
      ...prevLoginDetails,
      [name]: value,
    }));
  };

  setTimeout(() => {
    setCardAnimation('');
  }, 700);

  useEffect(() => {
    if (isAuthenticated) {
      history.replace(from);
    }
  });

  useEffect(() => {
    const code = (location.search.match(/code=([^&]+)/) || [])[1];
    const state = (location.search.match(/state=([^&]+)/) || [])[1];
    if (code && ['authsch', 'facebook', 'google-oauth2'].includes(state)) {
      setLoading(true);
      handleLogin(state, decodeURIComponent(code));
    }
  }, [location.search, handleLogin]);

  return (
    <div>
      <Header
        absolute
        color="transparent"
        brand="BSS Felkérés kezelő"
        rightLinks={<HeaderLinks />}
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
          <GridContainer justify="center">
            <GridItem xs={12} sm={12} md={4}>
              <Card className={classes[cardAnimaton]}>
                <form className={classes.form} onSubmit={handleSubmit}>
                  <CardHeader color="primary" className={classes.cardHeader}>
                    <h4>Bejelentkezés felkérőknek</h4>
                    <div className={classes.socialLine}>
                      <Button
                        justIcon
                        href={process.env.REACT_APP_AUTHSCH_OAUTH_URL}
                        target="_self"
                        color="transparent"
                        disabled={loading}
                      >
                        <i className="fas fa-graduation-cap" />
                      </Button>
                      <Button
                        justIcon
                        href={process.env.REACT_APP_FACEBOOK_OAUTH_URL}
                        target="_self"
                        color="transparent"
                        disabled={loading}
                      >
                        <i className="fab fa-facebook" />
                      </Button>
                      <Button
                        justIcon
                        href={process.env.REACT_APP_GOOGLE_OAUTH_URL}
                        target="_self"
                        color="transparent"
                        disabled={loading}
                      >
                        <i className="fab fa-google" />
                      </Button>
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
