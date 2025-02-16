import { useState, useEffect, createRef } from 'react';
import { useNavigate } from 'react-router';
// nodejs library that concatenates classes
import classNames from 'classnames';
// @mui components
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import CircularProgress from '@mui/material/CircularProgress';
import MobileStepper from '@mui/material/MobileStepper';
import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import Typography from '@mui/material/Typography';
// core components
import Button from 'src/components/material-kit-react/CustomButtons/Button';
import GridContainer from 'src/components/material-kit-react/Grid/GridContainer';
import GridItem from 'src/components/material-kit-react/Grid/GridItem';
import Parallax from 'src/components/material-kit-react/Parallax/Parallax';
// Notistack
import { useSnackbar } from 'notistack';
// ReCAPTCHA
import ReCAPTCHA from 'react-google-recaptcha';
// Form
import RequestCreatorForm from 'src/components/RequestCreatorForm/RequestCreatorForm';
// API calls
import { isCancel } from 'axios';
import { getMe } from 'src/api/meApi';
import { createRequest } from 'src/api/requestApi';
import { isAuthenticated } from 'src/helpers/authenticationHelper';
import handleError from 'src/helpers/errorHandler';
import changePageTitle from 'src/helpers/pageTitleHelper';

import stylesModule from './RequestCreatorPage.module.scss';

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
  type_obj: null,
  type: '',
  // Other Information
  comment: '',
};

function RequestCreatorPage() {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const recaptchaRef = createRef();
  const theme = useTheme();
  const isMobileView = useMediaQuery(theme.breakpoints.down('md'));

  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState(formInitialState);
  const [loading, setLoading] = useState(true);
  const [requestId, setRequestId] = useState(0);

  const handleNext = () => {
    setActiveStep(activeStep + 1);
  };

  const handleBack = () => {
    setActiveStep(activeStep - 1);
  };

  const handleReset = () => {
    window.location.reload();
  };

  const handleShowCreated = () => {
    if (requestId) {
      navigate(`/my-requests/${requestId}`);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      formData.type = formData.type_obj.text;
      if (!isAuthenticated()) {
        formData.recaptcha = await recaptchaRef.current.executeAsync();
      }
      await createRequest(formData).then((response) => {
        handleNext();
        setLoading(false);
        setRequestId(response.data.id);
      });
    } catch (e) {
      enqueueSnackbar(handleError(e), {
        variant: 'error',
      });
      setLoading(false);
    }
  };

  useEffect(() => {
    const controller = new AbortController();

    async function loadUserData() {
      try {
        await getMe({
          signal: controller.signal,
        })
          .then((result) => {
            const userData = {
              requester_first_name: result.data.first_name,
              requester_last_name: result.data.last_name,
              requester_email: result.data.email,
              requester_mobile: result.data.profile.phone_number,
            };
            if (
              !userData.requester_first_name ||
              !userData.requester_last_name ||
              !userData.requester_email ||
              !userData.requester_mobile
            ) {
              const missingData = [];
              if (!userData.requester_last_name) {
                missingData.push('vezetéknév');
              }
              if (!userData.requester_first_name) {
                missingData.push('keresztnév');
              }
              if (!userData.requester_email) {
                missingData.push('e-mail cím');
              }
              if (!userData.requester_mobile) {
                missingData.push('telefonszám');
              }
              enqueueSnackbar(
                `Kérlek töltsd ki hiányzó adataidat (${missingData.join(
                  ', ',
                )})!`,
                {
                  variant: 'warning',
                },
              );
              navigate('/profile');
            }
            setFormData((prevState) => ({ ...prevState, ...userData }));
            setActiveStep(1);
          })
          .catch((e) => {
            if (isCancel(e)) {
              // Request was cancelled, continue
            }
          });
      } finally {
        setLoading(false);
      }
    }

    if (isAuthenticated()) {
      setLoading(true);
      loadUserData();
    } else {
      setLoading(false);
    }

    return () => {
      controller.abort();
    };
  }, [enqueueSnackbar, navigate]);

  useEffect(() => {
    changePageTitle('Felkérés beküldése');
  }, []);

  return (
    <>
      <Parallax small filter>
        <div className={stylesModule.container}>
          <GridContainer justifyContent="center">
            <GridItem xs={12} sm={12} md={6}>
              <h1 className={stylesModule.title}>Új felkérés beküldése</h1>
            </GridItem>
          </GridContainer>
        </div>
      </Parallax>
      <div className={classNames(stylesModule.main, stylesModule.mainRaised)}>
        <div
          className={classNames(stylesModule.container, stylesModule.section)}
        >
          <GridContainer justifyContent="center">
            <GridItem xs={12} sm={12} md={6}>
              {isMobileView ? (
                <>
                  <Typography
                    variant="h6"
                    align="center"
                    sx={{ color: 'black' }}
                  >
                    {steps.at(activeStep)}
                  </Typography>
                  <MobileStepper
                    variant="progress"
                    activeStep={activeStep}
                    steps={4}
                    position="static"
                    LinearProgressProps={{ sx: { width: 1 } }}
                    className={stylesModule.stepper}
                  />
                </>
              ) : (
                <Stepper
                  activeStep={activeStep}
                  className={stylesModule.stepper}
                  alternativeLabel
                >
                  {steps.map((label) => (
                    <Step key={label}>
                      <StepLabel
                        StepIconProps={{
                          classes: {
                            root: stylesModule.stepIcon,
                            active: stylesModule.activeIcon,
                            completed: stylesModule.completedIcon,
                          },
                        }}
                      >
                        {label}
                      </StepLabel>
                    </Step>
                  ))}
                </Stepper>
              )}
            </GridItem>
          </GridContainer>
          {loading && activeStep === 0 ? (
            <GridContainer justifyContent="center">
              <CircularProgress
                className={stylesModule.circularProgress}
                size={60}
              />
            </GridContainer>
          ) : (
            <>
              <GridContainer justifyContent="center">
                <GridItem
                  xs={12}
                  sm={12}
                  md={6}
                  className={stylesModule.contentBox}
                >
                  <RequestCreatorForm
                    step={activeStep}
                    formData={formData}
                    setFormData={setFormData}
                    handleNext={handleNext}
                    handleBack={handleBack}
                    setActiveStep={setActiveStep}
                    isAuthenticated={isAuthenticated()}
                  />
                </GridItem>
              </GridContainer>
              <GridContainer justifyContent="center">
                <GridItem xs={12} sm={12} className={stylesModule.textCenter}>
                  {activeStep < steps.length ? (
                    <>
                      {activeStep === steps.length - 1 && (
                        <div className={stylesModule.wrapper}>
                          <Button
                            onClick={handleBack}
                            disabled={loading}
                            className={stylesModule.button}
                          >
                            Vissza
                          </Button>
                          <Button
                            onClick={handleSubmit}
                            color="success"
                            disabled={loading}
                            className={stylesModule.button}
                          >
                            Küldés
                          </Button>
                          {loading && (
                            <CircularProgress
                              size={24}
                              className={stylesModule.buttonProgress}
                            />
                          )}
                        </div>
                      )}
                    </>
                  ) : (
                    <>
                      <Button onClick={handleReset} color="primary">
                        Új felkérés beküldése
                      </Button>
                      {isAuthenticated() && (
                        <Button onClick={handleShowCreated} color="secondary">
                          Felkérés megtekintése
                        </Button>
                      )}
                    </>
                  )}
                </GridItem>
              </GridContainer>
            </>
          )}
          {!isAuthenticated() && (
            <ReCAPTCHA
              ref={recaptchaRef}
              size="invisible"
              sitekey={import.meta.env.VITE_RECAPTCHA_SITE_KEY}
            />
          )}
        </div>
      </div>
    </>
  );
}

// eslint-disable-next-line import/prefer-default-export
export { RequestCreatorPage as Component };
