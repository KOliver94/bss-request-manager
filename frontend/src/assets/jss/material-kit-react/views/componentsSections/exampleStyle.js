import { containerFluid } from 'assets/jss/material-kit-react';

import imagesStyle from 'assets/jss/material-kit-react/imagesStyles';

const exampleStyle = {
  section: {
    padding: '70px 0',
  },
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
