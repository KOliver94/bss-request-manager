import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
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

import { loginLdap } from 'api/loginApi';

const useStyles = makeStyles(styles);

export default function LoginPage({ setIsAuthenticated }) {
  const [cardAnimaton, setCardAnimation] = useState('cardHidden');
  const [loginDetails, setloginDetails] = useState({});
  const [loading, setLoading] = useState(false);

  const classes = useStyles();
  const history = useHistory();
  const { enqueueSnackbar } = useSnackbar();

  async function handleSubmit(event) {
    event.preventDefault();
    setLoading(true);

    try {
      await loginLdap(loginDetails);
      setIsAuthenticated(true);
      enqueueSnackbar('Sikeres bejelentkezés', {
        variant: 'success',
      });
      history.push('/');
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
  }

  function handleChange(event) {
    const { name, value } = event.target;
    setloginDetails((prevLoginDetails) => ({
      ...prevLoginDetails,
      [name]: value,
    }));
  }

  setTimeout(() => {
    setCardAnimation('');
  }, 700);

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
                        href="#pablo"
                        target="_blank"
                        color="transparent"
                        disabled={loading}
                        onClick={(e) => e.preventDefault()}
                      >
                        <i className="fas fa-graduation-cap" />
                      </Button>
                      <Button
                        justIcon
                        href="#pablo"
                        target="_blank"
                        color="transparent"
                        disabled={loading}
                        onClick={(e) => e.preventDefault()}
                      >
                        <i className="fab fa-facebook" />
                      </Button>
                      <Button
                        justIcon
                        href="#pablo"
                        target="_blank"
                        color="transparent"
                        disabled={loading}
                        onClick={(e) => e.preventDefault()}
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
  setIsAuthenticated: PropTypes.func.isRequired,
};
