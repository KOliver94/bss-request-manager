// nodejs library to set properties for components
import PropTypes from 'prop-types';

// @mui components
import Grid from '@mui/material/Grid';

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
