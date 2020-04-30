import React from 'react';
// @material-ui/core components
import { makeStyles } from '@material-ui/core/styles';

// @material-ui/icons

// core components
import GridContainer from 'components/material-kit-react/Grid/GridContainer';
import GridItem from 'components/material-kit-react/Grid/GridItem';
import CustomInput from 'components/material-kit-react/CustomInput/CustomInput';
import Button from 'components/material-kit-react/CustomButtons/Button';

import styles from 'assets/jss/material-kit-react/views/landingPageSections/workStyle';

const useStyles = makeStyles(styles);

export default function ContactSection() {
  const classes = useStyles();
  return (
    <div className={classes.section}>
      <GridContainer justify="center">
        <GridItem cs={12} sm={12} md={8}>
          <h2 className={classes.title}>Egyéb kérdések esetén</h2>
          <h4 className={classes.description}>
            Ha olyan kérésed lenne amire nem kaptál itt választ vagy egyéb
            ügyben szeretnél felkeresni minket, alább lehetőséged van üzenetet
            küldeni nekünk vagy írj a{' '}
            <a href="mailto:bssinfo@sch.bme.hu">bssinfo@sch.bme.hu</a>{' '}
            e&#8209;mail címre.
          </h4>
          <form>
            <GridContainer>
              <GridItem xs={12} sm={12} md={6}>
                <CustomInput
                  labelText="Teljes neved"
                  id="name"
                  formControlProps={{
                    fullWidth: true,
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
                }}
              />
              <GridContainer justify="center">
                <GridItem xs={12} sm={12} md={4} className={classes.textCenter}>
                  <Button color="primary">Küldés</Button>
                </GridItem>
              </GridContainer>
            </GridContainer>
          </form>
        </GridItem>
      </GridContainer>
    </div>
  );
}
