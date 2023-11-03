import { forwardRef } from 'react';
// nodejs library to set properties for components
import PropTypes from 'prop-types';
// nodejs library that concatenates classes
import classNames from 'classnames';

// @mui components
import Button from '@mui/material/Button';

import stylesModule from './Button.module.scss';

const RegularButton = forwardRef((props, ref) => {
  const {
    color,
    round,
    children,
    fullWidth,
    disabled,
    simple,
    size,
    block,
    link,
    justIcon,
    className,
    ...rest
  } = props;

  const btnClasses = classNames({
    [stylesModule.button]: true,
    [stylesModule[size]]: size,
    [stylesModule[color]]: color,
    [stylesModule.round]: round,
    [stylesModule.fullWidth]: fullWidth,
    [stylesModule.disabled]: disabled,
    [stylesModule.simple]: simple,
    [stylesModule.block]: block,
    [stylesModule.link]: link,
    [stylesModule.justIcon]: justIcon,
    [className]: className,
  });
  return (
    <Button {...rest} ref={ref} className={btnClasses}>
      {children}
    </Button>
  );
});

RegularButton.propTypes = {
  color: PropTypes.oneOf([
    'primary',
    'info',
    'success',
    'warning',
    'danger',
    'rose',
    'white',
    'authsch',
    'facebook',
    'twitter',
    'google',
    'github',
    'transparent',
  ]),
  size: PropTypes.oneOf(['sm', 'lg']),
  simple: PropTypes.bool,
  round: PropTypes.bool,
  fullWidth: PropTypes.bool,
  disabled: PropTypes.bool,
  block: PropTypes.bool,
  link: PropTypes.bool,
  justIcon: PropTypes.bool,
  children: PropTypes.node,
  className: PropTypes.string,
};

export default RegularButton;
