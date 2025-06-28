import { useState, useEffect } from 'react';

import Menu from '@mui/icons-material/Menu';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Drawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import Toolbar from '@mui/material/Toolbar';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import { Link } from 'react-router';

import stylesModule from './Header.module.scss';

export default function Header({
  color = 'white',
  rightLinks,
  leftLinks,
  brand,
  fixed,
  absolute,
  changeColorOnScroll,
}) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };
  const headerColorChange = () => {
    const windowsScrollTop = window.pageYOffset;
    if (windowsScrollTop > changeColorOnScroll.height) {
      document.body
        .getElementsByTagName('header')[0]
        .classList.remove(stylesModule[color]);
      document.body
        .getElementsByTagName('header')[0]
        .classList.add(stylesModule[changeColorOnScroll.color]);
    } else {
      document.body
        .getElementsByTagName('header')[0]
        .classList.add(stylesModule[color]);
      document.body
        .getElementsByTagName('header')[0]
        .classList.remove(stylesModule[changeColorOnScroll.color]);
    }
  };
  const appBarClasses = classNames({
    [stylesModule.appBar]: true,
    [stylesModule[color]]: color,
    [stylesModule.absolute]: absolute,
    [stylesModule.fixed]: fixed,
  });
  const brandComponent = (
    <Link to="/" className={stylesModule.titleLink}>
      <Button className={stylesModule.title}>{brand}</Button>
    </Link>
  );

  useEffect(() => {
    if (changeColorOnScroll) {
      window.addEventListener('scroll', headerColorChange);
    }
    return function cleanup() {
      if (changeColorOnScroll) {
        window.removeEventListener('scroll', headerColorChange);
      }
    };
  });

  return (
    <AppBar className={appBarClasses}>
      <Toolbar className={stylesModule.container}>
        {leftLinks !== undefined ? brandComponent : null}
        <div className={stylesModule.flex}>
          {leftLinks !== undefined ? (
            <Box sx={{ display: { xs: 'none', md: 'block' } }}>{leftLinks}</Box>
          ) : (
            brandComponent
          )}
        </div>
        <Box sx={{ display: { xs: 'none', md: 'block' } }}>{rightLinks}</Box>
        <Box sx={{ display: { xs: 'block', md: 'none' } }}>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            onClick={handleDrawerToggle}
            size="large"
          >
            <Menu />
          </IconButton>
        </Box>
      </Toolbar>
      <Box sx={{ display: { xs: 'block', md: 'none' } }}>
        <Drawer
          variant="temporary"
          anchor="right"
          open={mobileOpen}
          classes={{
            paper: stylesModule.drawerPaper,
          }}
          onClose={handleDrawerToggle}
        >
          <div className={stylesModule.appResponsive}>
            {leftLinks}
            {rightLinks}
          </div>
        </Drawer>
      </Box>
    </AppBar>
  );
}

Header.propTypes = {
  color: PropTypes.oneOf([
    'primary',
    'info',
    'success',
    'warning',
    'error',
    'transparent',
    'white',
    'secondary',
    'dark',
  ]),
  rightLinks: PropTypes.node,
  leftLinks: PropTypes.node,
  brand: PropTypes.string,
  fixed: PropTypes.bool,
  absolute: PropTypes.bool,
  // this will cause the sidebar to change the color from
  // props.color (see above) to changeColorOnScroll.color
  // when the window.pageYOffset is higher or equal to
  // changeColorOnScroll.height and then when it is smaller than
  // changeColorOnScroll.height change it back to
  // props.color (see above)
  changeColorOnScroll: PropTypes.shape({
    height: PropTypes.number.isRequired,
    color: PropTypes.oneOf([
      'primary',
      'info',
      'success',
      'warning',
      'error',
      'transparent',
      'white',
      'secondary',
      'dark',
    ]).isRequired,
  }),
};
