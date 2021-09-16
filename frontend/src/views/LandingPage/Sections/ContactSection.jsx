import { useState, createRef } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { useSnackbar } from 'notistack';

import GridContainer from 'components/material-kit-react/Grid/GridContainer';
import GridItem from 'components/material-kit-react/Grid/GridItem';
import CustomInput from 'components/material-kit-react/CustomInput/CustomInput';
import Button from 'components/material-kit-react/CustomButtons/Button';
import ReCAPTCHA from 'react-google-recaptcha';

import sendContactMessage from 'api/miscApi';
import handleError from 'helpers/errorHandler';

import styles from 'assets/jss/material-kit-react/views/landingPageSections/workStyle';

const useStyles = makeStyles(styles);
const emptyMessageData = {
  name: '',
  email: '',
  message: '',
  recaptcha: '',
};

export default function ContactSection() {
  const classes = useStyles();
  const { enqueueSnackbar } = useSnackbar();
  const recaptchaRef = createRef();
  const [loading, setLoading] = useState(false);
  const [messageData, setMessageData] = useState(emptyMessageData);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setMessageData((prevMailData) => ({
      ...prevMailData,
      [name]: value,
    }));
  };

  const handleCaptcha = (token) => {
    setMessageData((prevMailData) => ({
      ...prevMailData,
      recaptcha: token,
    }));
  };

  const sendMail = async (event) => {
    event.preventDefault();
    setLoading(true);
    recaptchaRef.current.reset();
    try {
      await sendContactMessage(messageData).then(() => {
        setMessageData(emptyMessageData);
        enqueueSnackbar('Üzenetedet elküldtük!', {
          variant: 'success',
          autoHideDuration: 5000,
        });
      });
    } catch (e) {
      enqueueSnackbar(handleError(e), {
        variant: 'error',
        autoHideDuration: 5000,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={classes.section}>
      <GridContainer justifyContent="center">
        <GridItem cs={12} sm={12} md={8}>
          <h2 className={classes.title}>Egyéb kérdések esetén</h2>
          <h4 className={classes.description}>
            Ha olyan kérésed lenne amire nem kaptál itt választ vagy egyéb
            ügyben szeretnél felkeresni minket, alább lehetőséged van üzenetet
            küldeni nekünk vagy írj a{' '}
            <a href="mailto:bssinfo@sch.bme.hu">bssinfo@sch.bme.hu</a>{' '}
            e&#8209;mail címre.
          </h4>
          <form onSubmit={sendMail}>
            <GridContainer>
              <GridItem xs={12} sm={12} md={6}>
                <CustomInput
                  labelText="Teljes neved"
                  id="name"
                  formControlProps={{
                    fullWidth: true,
                  }}
                  inputProps={{
                    name: 'name',
                    onChange: (e) => handleChange(e),
                    required: true,
                    value: messageData.name,
                  }}
                />
              </GridItem>
              <GridItem xs={12} sm={12} md={6}>
                <CustomInput
                  labelText="E-mail címed"
                  id="email"
                  formControlProps={{
                    fullWidth: true,
                  }}
                  inputProps={{
                    name: 'email',
                    type: 'email',
                    onChange: (e) => handleChange(e),
                    required: true,
                    value: messageData.email,
                  }}
                />
              </GridItem>
              <CustomInput
                labelText="Üzeneted"
                id="message"
                formControlProps={{
                  fullWidth: true,
                  className: classes.textArea,
                }}
                inputProps={{
                  multiline: true,
                  rows: 5,
                  name: 'message',
                  onChange: (e) => handleChange(e),
                  required: true,
                  value: messageData.message,
                }}
              />
              <GridItem>
                <ReCAPTCHA
                  ref={recaptchaRef}
                  sitekey={process.env.REACT_APP_RECAPTCHA_SITE_KEY}
                  onChange={handleCaptcha}
                />
              </GridItem>
              <GridItem xs={12} sm={12} md={4}>
                <Button
                  color="primary"
                  type="submit"
                  disabled={!messageData.recaptcha || loading}
                >
                  Küldés
                </Button>
              </GridItem>
            </GridContainer>
          </form>
        </GridItem>
      </GridContainer>
    </div>
  );
}
