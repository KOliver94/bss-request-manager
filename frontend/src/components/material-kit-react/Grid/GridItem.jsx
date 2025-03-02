import Grid from '@mui/material/Grid';
import PropTypes from 'prop-types';

import stylesModule from './GridItem.module.scss';

export default function GridItem({ children, className = '', ...rest }) {
  return (
    <Grid item {...rest} className={`${stylesModule.grid} ${className}`}>
      {children}
    </Grid>
  );
}

GridItem.propTypes = {
  children: PropTypes.node,
  className: PropTypes.string,
};
