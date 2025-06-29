import Grid from '@mui/material/Grid';
import PropTypes from 'prop-types';

export default function GridContainer({ children, sx = {}, ...rest }) {
  return (
    <Grid
      container
      {...rest}
      sx={{
        marginRight: '-15px',
        marginLeft: '-15px',
        width: 'auto',
        ...sx,
      }}
    >
      {children}
    </Grid>
  );
}

GridContainer.propTypes = {
  children: PropTypes.node,
  sx: PropTypes.object,
};
