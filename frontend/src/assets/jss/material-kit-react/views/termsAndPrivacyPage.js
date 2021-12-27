import { container } from 'assets/jss/material-kit-react';

const termsAndPrivacyPageStyle = {
  container: {
    zIndex: '12',
    color: '#FFFFFF',
    ...container,
  },
  section: {
    padding: '70px 15px',
  },
  main: {
    background: '#FFFFFF',
    position: 'relative',
    zIndex: '3',
  },
  mainRaised: {
    margin: '-60px 30px 0px',
    borderRadius: '6px',
    boxShadow:
      '0 16px 24px 2px rgba(0, 0, 0, 0.14), 0 6px 30px 5px rgba(0, 0, 0, 0.12), 0 8px 10px -5px rgba(0, 0, 0, 0.2)',
  },
  text: {
    color: 'black',
    textAlign: 'justify',
    fontSize: '14px',
  },
  title: {
    textAlign: 'left',
  },
};

export default termsAndPrivacyPageStyle;
