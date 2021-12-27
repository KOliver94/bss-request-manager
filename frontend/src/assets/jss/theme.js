import { createTheme } from '@mui/material/styles';
import {
  primaryColor,
  roseColor as secondaryColor,
  dangerColor as errorColor,
  warningColor,
  infoColor,
  successColor,
} from 'assets/jss/material-kit-react';

const theme = createTheme({
  components: {
    MuiRating: {
      styleOverrides: {
        label: {
          color: 'inherit',
          fontSize: 'inherit',
        },
      },
    },
  },
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
  },
});

export default theme;
