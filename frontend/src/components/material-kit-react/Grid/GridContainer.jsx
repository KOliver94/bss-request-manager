import Grid from '@mui/material/Grid';
import PropTypes from 'prop-types';

import stylesModule from './GridContainer.module.scss';

export default function GridContainer({ children, className = '', ...rest }) {
  return (
    <Grid container {...rest} className={`${stylesModule.grid} ${className}`}>
      {children}
    </Grid>
  );
}

GridContainer.propTypes = {
  children: PropTypes.node,
  className: PropTypes.string,
};
