import { createMuiTheme } from '@material-ui/core/styles';
import {
  primaryColor,
  roseColor as secondaryColor,
  dangerColor as errorColor,
  warningColor,
  infoColor,
  successColor,
  grayColor,
} from 'assets/jss/material-kit-react';

const theme = createMuiTheme({
  palette: {
    primary: {
      main: primaryColor,
    },
    secondary: {
      main: secondaryColor,
    },
    error: {
      main: errorColor,
    },
    warning: {
      main: warningColor,
    },
    info: {
      main: infoColor,
    },
    success: {
      main: successColor,
    },
    grey: {
      main: grayColor,
    },
  },
});

export default theme;
