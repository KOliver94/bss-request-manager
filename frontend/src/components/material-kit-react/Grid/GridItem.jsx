// nodejs library to set properties for components
import PropTypes from 'prop-types';
// @mui components
import Grid from '@mui/material/Grid';

import stylesModule from './GridItem.module.scss';

export default function GridItem(props) {
  const { children, className, ...rest } = props;
  return (
    <Grid item {...rest} className={stylesModule.grid + ' ' + className}>
      {children}
    </Grid>
  );
}

GridItem.defaultProps = {
  className: '',
};

GridItem.propTypes = {
  children: PropTypes.node,
  className: PropTypes.string,
};
