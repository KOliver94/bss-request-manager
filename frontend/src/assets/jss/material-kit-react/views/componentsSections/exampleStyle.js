import { containerFluid, section } from 'assets/jss/material-kit-react';

import imagesStyle from 'assets/jss/material-kit-react/imagesStyles';

const exampleStyle = {
  section,
  container: {
    ...containerFluid,
    textAlign: 'center !important',
  },
  ...imagesStyle,
  link: {
    textDecoration: 'none',
  },
};

export default exampleStyle;
