// nodejs library to set properties for components
import PropTypes from 'prop-types';

// @mui components
import makeStyles from '@mui/styles/makeStyles';
import LinearProgress from '@mui/material/LinearProgress';
// core components
import styles from 'assets/jss/material-kit-react/components/customLinearProgressStyle.js';

const useStyles = makeStyles(styles);

export default function CustomLinearProgress(props) {
  const classes = useStyles();
  const { color, ...rest } = props;
  return (
    <LinearProgress
      {...rest}
      classes={{
        root: classes.root + ' ' + classes[color + 'Background'],
        bar: classes.bar + ' ' + classes[color],
      }}
    />
  );
}

CustomLinearProgress.defaultProps = {
  color: 'gray',
};

CustomLinearProgress.propTypes = {
  color: PropTypes.oneOf([
    'primary',
    'warning',
    'danger',
    'success',
    'info',
    'rose',
    'gray',
  ]),
};
