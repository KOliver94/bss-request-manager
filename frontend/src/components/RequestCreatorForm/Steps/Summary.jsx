import React from 'react';
import PropTypes from 'prop-types';
import GridContainer from 'components/material-kit-react/Grid/GridContainer';
import GridItem from 'components/material-kit-react/Grid/GridItem';
import Typography from '@material-ui/core/Typography';
import { format } from 'date-fns';
import { hu } from 'date-fns/locale';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles(() => ({
  root: {
    textAlign: 'left',
  },
  title: {
    textAlign: 'left',
    textTransform: 'none',
  },
  container: {
    paddingBottom: '15px',
  },
}));

const Summary = ({ formData }) => {
  const classes = useStyles();
  return (
    <div className={classes.root}>
      <Typography variant="h6" className={classes.title} gutterBottom>
        Felkérés részletei
      </Typography>
      <GridContainer className={classes.container}>
        <GridItem xs={10} sm={6}>
          <p>{formData.title}</p>
          <p>{formData.place}</p>
          <p>{formData.type}</p>
        </GridItem>
        <GridItem xs={10} sm={6}>
          <p>
            Kezdés:{' '}
            {format(
              new Date(formData.start_datetime),
              'yyyy. MMMM d. (eeee) | H:mm',
              {
                locale: hu,
              }
            )}
          </p>
          <p>
            Befejezés:{' '}
            {format(
              new Date(formData.end_datetime),
              'yyyy. MMMM d. (eeee) | H:mm',
              {
                locale: hu,
              }
            )}
          </p>
        </GridItem>
      </GridContainer>
      <GridContainer className={classes.container}>
        <GridItem xs={10} sm={6}>
          <Typography variant="h6" className={classes.title} gutterBottom>
            Felkérő
          </Typography>
          <p>
            {`${formData.requester_first_name} ${formData.requester_last_name}`}
          </p>
          <p>{formData.requester_email}</p>
          <p>{formData.requester_mobile}</p>
        </GridItem>
        <GridItem xs={10} sm={6}>
          <Typography variant="h6" className={classes.title} gutterBottom>
            Megjegyzés
          </Typography>
          <p>{formData.comment_text}</p>
        </GridItem>
      </GridContainer>
    </div>
  );
};

Summary.propTypes = {
  formData: PropTypes.object.isRequired,
};

export default Summary;
