import {
  container,
  section,
  title,
  primaryColor,
} from 'assets/jss/material-kit-react';

const myRequestsPageStyle = {
  container: {
    zIndex: '12',
    color: '#FFFFFF',
    ...container,
  },
  section,
  title: {
    ...title,
    display: 'inline-block',
    position: 'relative',
    textAlign: 'center',
    marginTop: '30px',
    minHeight: '32px',
    color: '#FFFFFF',
    textDecoration: 'none',
  },
  subtitle: {
    fontSize: '1.313rem',
    maxWidth: '500px',
    margin: '10px auto 0',
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
  textCenter: {
    textAlign: 'center',
  },
  contentBox: {
    paddingTop: '15px',
    textAlign: 'center',
    color: 'black',
  },
  circularProgress: {
    marginTop: '70px',
    margin: '50px 30px',
    color: primaryColor,
  },
  notFound: {
    color: 'black',
  },
  table: {
    width: '80%',
  },
  pagination: {
    marginTop: '40px',
  },
};

export default myRequestsPageStyle;
