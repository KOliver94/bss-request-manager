import { container, primaryColor } from 'assets/jss/material-kit-react';

const footerStyle = (theme) => ({
  block: {
    color: 'inherit',
    padding: '0.9375rem',
    fontWeight: '500',
    fontSize: '12px',
    textTransform: 'uppercase',
    borderRadius: '3px',
    textDecoration: 'none',
    position: 'relative',
    display: 'block',
  },
  left: {
    [theme.breakpoints.up('sm')]: {
      float: 'left!important',
    },
    padding: '15px 0',
    display: 'block',
  },
  right: {
    [theme.breakpoints.up('sm')]: {
      float: 'right!important',
    },
    padding: '15px 0',
    margin: '0',
  },
  footer: {
    padding: '0.9375rem 0',
    textAlign: 'center',
    display: 'flex',
    zIndex: '2',
    position: 'relative',
  },
  a: {
    color: primaryColor,
    textDecoration: 'none',
    backgroundColor: 'transparent',
  },
  footerWhiteFont: {
    '&,&:hover,&:focus': {
      color: '#FFFFFF',
    },
  },
  container,
  list: {
    marginBottom: '0',
    padding: '0',
    marginTop: '0',
  },
  inlineBlock: {
    display: 'inline-block',
    width: 'auto',
    lineHeight: 0,
    verticalAlign: 'text-bottom',
    padding: '0 10px',
    '&:nth-child(1)': {
      paddingLeft: 0,
    },
  },
  icon: {
    width: '18px',
    height: '18px',
    position: 'relative',
    top: '3px',
  },
  socialIcon: {
    padding: '0',
    margin: '0',
  },
});

export default footerStyle;
