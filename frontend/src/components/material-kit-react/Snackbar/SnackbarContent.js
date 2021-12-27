import { useState } from 'react';
// nodejs library to set properties for components
import PropTypes from 'prop-types';
// @mui components
import makeStyles from '@mui/styles/makeStyles';
import Snack from '@mui/material/SnackbarContent';
import IconButton from '@mui/material/IconButton';
import Icon from '@mui/material/Icon';
// @mui/icons-material
import Close from '@mui/icons-material/Close';
// core components

import styles from 'assets/jss/material-kit-react/components/snackbarContentStyle.js';

const useStyles = makeStyles(styles);

export default function SnackbarContent(props) {
  const { message, color, close, icon } = props;
  const classes = useStyles();
  let action = [];
  const closeAlert = () => {
    setAlert(null);
  };
  if (close !== undefined) {
    action = [
      <IconButton
        className={classes.iconButton}
        key="close"
        aria-label="Close"
        color="inherit"
        onClick={closeAlert}
        size="large"
      >
        <Close className={classes.close} />
      </IconButton>,
    ];
  }
  let snackIcon;
  switch (typeof icon) {
    case 'object':
      snackIcon = <props.icon className={classes.icon} />;
      break;
    case 'string':
      snackIcon = <Icon className={classes.icon}>{props.icon}</Icon>;
      break;
    default:
      snackIcon = null;
      break;
  }
  const [alert, setAlert] = useState(
    <Snack
      message={
        <div>
          {snackIcon}
          {message}
          {close !== undefined ? action : null}
        </div>
      }
      classes={{
        root: classes.root + ' ' + classes[color],
        message: classes.message + ' ' + classes.container,
      }}
    />
  );
  return alert;
}

SnackbarContent.propTypes = {
  message: PropTypes.node.isRequired,
  color: PropTypes.oneOf(['info', 'success', 'warning', 'danger', 'primary']),
  close: PropTypes.bool,
  icon: PropTypes.oneOfType([PropTypes.object, PropTypes.string]),
};
