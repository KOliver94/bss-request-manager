import { container, section, title } from 'src/assets/jss/material-kit-react';

const pillsStyle = {
  section,
  container,
  title: {
    ...title,
    marginTop: '30px',
    minHeight: '32px',
    textDecoration: 'none',
  },
};

export default pillsStyle;
