import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
// nodejs library that concatenates classes
import classNames from 'classnames';
// @material-ui/core components
import { makeStyles } from '@material-ui/core/styles';
import CircularProgress from '@material-ui/core/CircularProgress';
import Stepper from '@material-ui/core/Stepper';
import Step from '@material-ui/core/Step';
import StepLabel from '@material-ui/core/StepLabel';
// background
import background from 'assets/img/BSS_csoportkep_2019osz.jpg';
// core components
import Button from 'components/material-kit-react/CustomButtons/Button';
import Header from 'components/material-kit-react/Header/Header';
import Footer from 'components/material-kit-react/Footer/Footer';
import GridContainer from 'components/material-kit-react/Grid/GridContainer';
import GridItem from 'components/material-kit-react/Grid/GridItem';
import HeaderLinks from 'components/material-kit-react/Header/HeaderLinks';
import Parallax from 'components/material-kit-react/Parallax/Parallax';
// Notistack
import { useSnackbar } from 'notistack';
// Form
import RequestCreatorForm from 'components/RequestCreatorForm/RequestCreatorForm';
// API calls
import { getUserMe } from 'api/userApi';
import { createRequest } from 'api/requestApi';

import styles from 'assets/jss/material-kit-react/views/requestCreatorPage';

const useStyles = makeStyles(styles);

const steps = [
  'Személyes adatok',
  'Felkérés részletei',
  'További információk',
  'Összegzés',
];

const formInitialState = {
  // Personal Data
  requester_first_name: '',
  requester_last_name: '',
  requester_email: '',
  requester_mobile: '',
  // Request Details
  title: '',
  start_datetime: null,
  end_datetime: null,
  place: '',
  type: '',
  // Other Information
  comment_text: '',
};

export default function RequestCreatorPage({
  isAuthenticated,
  setIsAuthenticated,
}) {
  const classes = useStyles();
  const { enqueueSnackbar } = useSnackbar();

  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState(formInitialState);
  const [loading, setLoading] = useState(true);

  const handleNext = () => {
    setActiveStep(activeStep + 1);
  };

  const handleBack = () => {
    setActiveStep(activeStep - 1);
  };

  const handleReset = () => {
    window.location.reload();
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await createRequest(formData).then(() => {
        handleNext();
        setLoading(false);
      });
    } catch (e) {
      enqueueSnackbar('Nem várt hiba történt. Kérlek próbáld újra később.', {
        variant: 'error',
        autoHideDuration: 5000,
      });
      setLoading(false);
    }
  };

  useEffect(() => {
    async function loadUserData() {
      try {
        await getUserMe().then((result) => {
          const newData = {
            requester_first_name: result.data.first_name,
            requester_last_name: result.data.last_name,
            requester_email: result.data.email,
            requester_mobile: result.data.profile.phone_number,
          };
          setFormData((prevState) => ({ ...prevState, ...newData }));
        });
      } finally {
        setLoading(false);
      }
    }

    if (isAuthenticated) {
      setLoading(true);
      loadUserData();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated]);

  return (
    <div>
      <Header
        color="transparent"
        brand="BSS Felkérés kezelő"
        rightLinks={
          <HeaderLinks
            isAuthenticated={isAuthenticated}
            setIsAuthenticated={setIsAuthenticated}
            hideNewRequest
          />
        }
        fixed
        changeColorOnScroll={{
          height: 200,
          color: 'white',
        }}
      />
      <Parallax small filter image={background}>
        <div className={classes.container}>
          <GridContainer justify="center">
            <GridItem xs={12} sm={12} md={6}>
              <h1 className={classes.title}>Új felkérés beküldése</h1>
            </GridItem>
          </GridContainer>
        </div>
      </Parallax>
      <div className={classNames(classes.main, classes.mainRaised)}>
        <div className={classNames(classes.container, classes.section)}>
          <GridContainer justify="center">
            <GridItem xs={12} sm={12} md={6}>
              <Stepper
                activeStep={activeStep}
                className={classes.stepper}
                alternativeLabel
              >
                {steps.map((label) => (
                  <Step key={label}>
                    <StepLabel
                      StepIconProps={{
                        classes: {
                          root: classes.stepIcon,
                          active: classes.activeIcon,
                          completed: classes.completedIcon,
                        },
                      }}
                    >
                      {label}
                    </StepLabel>
                  </Step>
                ))}
              </Stepper>
            </GridItem>
          </GridContainer>
          {loading && activeStep === 0 ? (
            <GridContainer justify="center">
              <CircularProgress
                className={classes.circularProgress}
                size={60}
              />
            </GridContainer>
          ) : (
            <>
              <GridContainer justify="center">
                <GridItem xs={12} sm={12} md={6} className={classes.contentBox}>
                  <RequestCreatorForm
                    step={activeStep}
                    formData={formData}
                    setFormData={setFormData}
                    handleNext={handleNext}
                    handleBack={handleBack}
                  />
                </GridItem>
              </GridContainer>
              <GridContainer justify="center">
                <GridItem xs={12} sm={12} md={4} className={classes.textCenter}>
                  {activeStep < steps.length ? (
                    <>
                      {activeStep === steps.length - 1 && (
                        <>
                          <div className={classes.wrapper}>
                            <Button onClick={handleBack} disabled={loading}>
                              Vissza
                            </Button>
                            <Button
                              onClick={handleSubmit}
                              color="success"
                              disabled={loading}
                            >
                              Küldés
                            </Button>
                            {loading && (
                              <CircularProgress
                                size={24}
                                className={classes.buttonProgress}
                              />
                            )}
                          </div>
                        </>
                      )}
                    </>
                  ) : (
                    <>
                      <Button onClick={handleReset} color="primary">
                        Új felkérés beküldése
                      </Button>
                    </>
                  )}
                </GridItem>
              </GridContainer>
            </>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}

RequestCreatorPage.propTypes = {
  isAuthenticated: PropTypes.bool.isRequired,
  setIsAuthenticated: PropTypes.func.isRequired,
};
