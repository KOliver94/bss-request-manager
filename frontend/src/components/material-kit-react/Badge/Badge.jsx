// nodejs library to set properties for components
import PropTypes from 'prop-types';

// @mui components
import makeStyles from '@mui/styles/makeStyles';

import styles from 'src/assets/jss/material-kit-react/components/badgeStyle.js';

const useStyles = makeStyles(styles);

export default function Badge(props) {
  const classes = useStyles();
  const { color, children } = props;
  return (
    <span className={classes.badge + ' ' + classes[color]}>{children}</span>
  );
}

Badge.defaultProps = {
  color: 'gray',
};

Badge.propTypes = {
  color: PropTypes.oneOf([
    'primary',
    'warning',
    'danger',
    'success',
    'info',
    'rose',
    'gray',
  ]),
  children: PropTypes.node,
};
