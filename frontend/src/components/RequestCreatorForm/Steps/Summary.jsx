import PropTypes from 'prop-types';
import GridContainer from 'components/material-kit-react/Grid/GridContainer';
import GridItem from 'components/material-kit-react/Grid/GridItem';
import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import { format } from 'date-fns';
import { hu } from 'date-fns/locale';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles(() => ({
  root: {
    minWidth: 275,
    marginBottom: 8,
  },
  first: {
    minWidth: 275,
    marginBottom: 8,
    marginTop: 16,
  },
  content: {
    paddingBottom: 0,
    '&:last-child': {
      paddingBottom: 16,
    },
  },
  title: {
    fontSize: 14,
  },
  pos: {
    marginBottom: 12,
  },
  actions: {
    display: 'inherit',
  },
}));

function Summary({ formData, setActiveStep, isAuthenticated }) {
  const classes = useStyles();
  return (
    <GridContainer justifyContent="center">
      <GridItem>
        <Card className={classes.first} variant="outlined">
          <CardContent className={classes.content}>
            <Typography
              className={classes.title}
              color="textSecondary"
              gutterBottom
            >
              Felkérés
            </Typography>
            <Typography variant="h5" component="h2">
              {formData.title}
            </Typography>
            <Typography className={classes.pos} color="textSecondary">
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
                  }
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
                  }
                )}
              </strong>
              <br />
            </Typography>
          </CardContent>
          <CardActions className={classes.actions}>
            <Button size="small" onClick={() => setActiveStep(1)}>
              Módosítás
            </Button>
          </CardActions>
        </Card>
        <Card className={classes.root} variant="outlined">
          <CardContent className={classes.content}>
            <Typography
              className={classes.title}
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
            <CardActions className={classes.actions}>
              <Button size="small" onClick={() => setActiveStep(0)}>
                Módosítás
              </Button>
            </CardActions>
          )}
        </Card>
        {formData.comment_text && (
          <Card className={classes.root} variant="outlined">
            <CardContent className={classes.content}>
              <Typography
                className={classes.title}
                color="textSecondary"
                gutterBottom
              >
                Megjegyzés
              </Typography>
              <Typography variant="body2" component="p">
                {formData.comment_text}
              </Typography>
            </CardContent>
            <CardActions className={classes.actions}>
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
