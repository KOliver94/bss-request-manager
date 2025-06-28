import { createTheme } from '@mui/material/styles';
import { huHU } from '@mui/x-date-pickers/locales';

import variables from '../scss/theme.module.scss';

const {
  primary,
  secondary,
  error,
  warning,
  info,
  success,
  xs,
  sm,
  md,
  lg,
  xl,
} = variables;

const theme = createTheme(
  {
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
    breakpoints: {
      values: {
        xs: Number(xs.slice(0, -2)),
        sm: Number(sm.slice(0, -2)),
        md: Number(md.slice(0, -2)),
        lg: Number(lg.slice(0, -2)),
        xl: Number(xl.slice(0, -2)),
      },
    },
    palette: {
      primary: {
        main: primary,
      },
      secondary: {
        main: secondary,
      },
      error: {
        main: error,
      },
      warning: {
        main: warning,
      },
      info: {
        main: info,
      },
      success: {
        main: success,
      },
    },
  },
  huHU,
);

export default theme;
