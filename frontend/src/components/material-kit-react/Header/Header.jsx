import { useState, useEffect } from 'react';
import { Link } from 'react-router';
// nodejs library that concatenates classes
import classNames from 'classnames';
// nodejs library to set properties for components
import PropTypes from 'prop-types';
// @mui components
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Button from '@mui/material/Button';
import Hidden from '@mui/material/Hidden';
import Drawer from '@mui/material/Drawer';
// @mui/icons-material
import Menu from '@mui/icons-material/Menu';

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
  return (
    <AppBar className={appBarClasses}>
      <Toolbar className={stylesModule.container}>
        {leftLinks !== undefined ? brandComponent : null}
        <div className={stylesModule.flex}>
          {leftLinks !== undefined ? (
            <Hidden mdDown implementation="css">
              {leftLinks}
            </Hidden>
          ) : (
            brandComponent
          )}
        </div>
        <Hidden mdDown implementation="css">
          {rightLinks}
        </Hidden>
        <Hidden mdUp>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            onClick={handleDrawerToggle}
            size="large"
          >
            <Menu />
          </IconButton>
        </Hidden>
      </Toolbar>
      <Hidden mdUp implementation="js">
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
      </Hidden>
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
