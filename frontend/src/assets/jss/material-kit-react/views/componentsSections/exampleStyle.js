import { containerFluid, section } from 'src/assets/jss/material-kit-react';

import imagesStyle from 'src/assets/jss/material-kit-react/imagesStyles';

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
