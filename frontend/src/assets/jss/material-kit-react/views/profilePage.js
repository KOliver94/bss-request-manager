import {
  container,
  title,
  primaryColor,
  successColor,
} from 'assets/jss/material-kit-react';

import imagesStyle from 'assets/jss/material-kit-react/imagesStyles';

const profilePageStyle = {
  container,
  section: {
    paddingBottom: '70px',
  },
  field: {
    padding: '0 16px',
  },
  profile: {
    textAlign: 'center',
  },
  avatar: {
    maxWidth: '160px',
    width: '100%',
    height: '160px',
    margin: '0 auto',
    transform: 'translate3d(0, -50%, 0)',
  },
  name: {
    marginTop: '-80px',
  },
  ...imagesStyle,
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
  title: {
    ...title,
    display: 'inline-block',
    position: 'relative',
    marginTop: '15px',
    marginBottom: '0px',
    minHeight: '32px',
    textDecoration: 'none',
  },
  socials: {
    marginTop: '0',
    width: '100%',
    transform: 'none',
    left: '0',
    top: '0',
    height: '100%',
    lineHeight: '41px',
    fontSize: '20px',
    color: '#999',
  },
  circularProgress: {
    margin: '50px 30px',
    color: primaryColor,
  },
  textCenter: {
    textAlign: 'center',
  },
  button: {
    marginTop: '15px',
  },
  gridItemMobile: {
    paddingTop: '15px',
    paddingBottom: '15px',
  },
  gridItemMobileNoTopPadding: {
    paddingBottom: '15px',
  },
  gridEnd: {
    textAlign: 'end',
  },
  alertAd: {
    marginTop: 18,
    marginBottom: 2,
    textAlign: 'left',
    alignItems: 'center',
  },
  alertAdMobile: {
    marginTop: 0,
    marginBottom: 2,
    textAlign: 'left',
    alignItems: 'center',
  },
  accordionAvatar: {
    display: 'inherit',
  },
  alertAvatar: {
    textAlign: 'justify',
  },
  cardMediaAvatar: {
    height: 'auto',
  },
  selectedIconAvatar: {
    color: successColor,
  },
  smallAvatar: {
    color: 'inherit',
  },
  textAvatar: {
    fontSize: '0.9rem',
    fontWeight: 450,
  },
  accordion: {
    '&>:first-child': {
      marginTop: '18px',
    },
  },
};

export default profilePageStyle;
