import Grid from '@mui/material/Grid';
import PropTypes from 'prop-types';

export default function GridContainer({
  children,
  className = '',
  sx = {},
  ...rest
}) {
  return (
    <Grid
      container
      {...rest}
      className={className}
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
  className: PropTypes.string,
  sx: PropTypes.object,
};
