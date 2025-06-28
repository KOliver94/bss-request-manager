import Grid from '@mui/material/Grid';
import PropTypes from 'prop-types';

import stylesModule from './GridContainer.module.scss';

export default function GridContainer({ children, className = '', ...rest }) {
  return (
    <Grid
      container
      {...rest}
      className={`${stylesModule.grid} ${className}`}
      sx={{
        width: '100%',
      }}
    >
      {children}
    </Grid>
  );
}

GridContainer.propTypes = {
  children: PropTypes.node,
  className: PropTypes.string,
};
