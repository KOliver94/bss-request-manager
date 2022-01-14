import { section, title } from 'assets/jss/material-kit-react';

const productStyle = {
  section: {
    ...section,
    textAlign: 'center',
  },
  title: {
    ...title,
    marginBottom: '1rem',
    marginTop: '30px',
    minHeight: '32px',
    textDecoration: 'none',
  },
  description: {
    color: '#999',
  },
};

export default productStyle;
