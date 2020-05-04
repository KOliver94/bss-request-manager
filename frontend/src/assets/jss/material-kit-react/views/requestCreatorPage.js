import {
  container,
  title,
  primaryColor,
  successColor,
} from 'assets/jss/material-kit-react';

const requestCreatorPage = {
  container: {
    zIndex: '12',
    color: '#FFFFFF',
    ...container,
  },
  section: {
    padding: '70px 0',
  },
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
  stepper: {
    margin: '5px 1px !important',
    padding: '0px',
  },
  stepIcon: {
    '&$activeIcon': {
      color: primaryColor,
    },
    '&$completedIcon': {
      color: successColor,
    },
  },
  activeIcon: {},
  completedIcon: {},
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
  wrapper: {
    position: 'relative',
  },
  buttonProgress: {
    color: primaryColor,
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginTop: -12,
    marginLeft: '40px',
  },
};

export default requestCreatorPage;
