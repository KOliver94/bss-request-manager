import Grid from '@mui/material/Grid';
import PropTypes from 'prop-types';

export default function GridItem({ children, sx = {}, ...rest }) {
  return (
    <Grid
      {...rest}
      sx={{
        position: 'relative',
        width: '100%',
        minHeight: '1px',
        paddingRight: '15px',
        paddingLeft: '15px',
        flexBasis: 'auto',
        ...sx,
      }}
    >
      {children}
    </Grid>
  );
}

GridItem.propTypes = {
  children: PropTypes.node,
  sx: PropTypes.object,
};
