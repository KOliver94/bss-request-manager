import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import { format } from 'date-fns';
import { hu } from 'date-fns/locale';
import PropTypes from 'prop-types';

import GridContainer from 'components/material-kit-react/Grid/GridContainer';
import GridItem from 'components/material-kit-react/Grid/GridItem';

import stylesModule from './Summary.module.scss';

function Summary({ formData, setActiveStep, isAuthenticated }) {
  return (
    <GridContainer justifyContent="center">
      <GridItem>
        <Card className={stylesModule.first} variant="outlined">
          <CardContent className={stylesModule.content}>
            <Typography
              className={stylesModule.title}
              color="textSecondary"
              gutterBottom
            >
              Felkérés
            </Typography>
            <Typography variant="h5" component="h2">
              {formData.title}
            </Typography>
            <Typography className={stylesModule.pos} color="textSecondary">
              {formData.type_obj.text} - <i>{formData.place}</i>
            </Typography>
            <Typography variant="caption" component="p">
              Kezdés:{' '}
              <strong>
                {format(
                  new Date(formData.start_datetime),
                  'yyyy. MMMM d. (eee) @ H:mm',
                  {
                    locale: hu,
                  },
                )}
              </strong>
              <br />
              Befejezés:{' '}
              <strong>
                {format(
                  new Date(formData.end_datetime),
                  'yyyy. MMMM d. (eee) @ H:mm',
                  {
                    locale: hu,
                  },
                )}
              </strong>
              <br />
            </Typography>
          </CardContent>
          <CardActions className={stylesModule.actions}>
            <Button size="small" onClick={() => setActiveStep(1)}>
              Módosítás
            </Button>
          </CardActions>
        </Card>
        <Card className={stylesModule.root} variant="outlined">
          <CardContent className={stylesModule.content}>
            <Typography
              className={stylesModule.title}
              color="textSecondary"
              gutterBottom
            >
              Felkérő
            </Typography>
            <Typography variant="h5" component="h2">
              {`${formData.requester_last_name} ${formData.requester_first_name}`}
            </Typography>
            <Typography color="textSecondary">
              {formData.requester_email}
              <br />
              {formData.requester_mobile}
            </Typography>
          </CardContent>
          {!isAuthenticated && (
            <CardActions className={stylesModule.actions}>
              <Button size="small" onClick={() => setActiveStep(0)}>
                Módosítás
              </Button>
            </CardActions>
          )}
        </Card>
        {formData.comment && (
          <Card className={stylesModule.root} variant="outlined">
            <CardContent className={stylesModule.content}>
              <Typography
                className={stylesModule.title}
                color="textSecondary"
                gutterBottom
              >
                Megjegyzés
              </Typography>
              <Typography variant="body2" component="p">
                {formData.comment}
              </Typography>
            </CardContent>
            <CardActions className={stylesModule.actions}>
              <Button size="small" onClick={() => setActiveStep(2)}>
                Módosítás
              </Button>
            </CardActions>
          </Card>
        )}
      </GridItem>
    </GridContainer>
  );
}

Summary.propTypes = {
  formData: PropTypes.object.isRequired,
  setActiveStep: PropTypes.func.isRequired,
  isAuthenticated: PropTypes.bool.isRequired,
};

export default Summary;
