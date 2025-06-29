import { forwardRef } from 'react';

import Button from '@mui/material/Button';
import classNames from 'classnames';
import PropTypes from 'prop-types';

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
RegularButton.displayName = 'RegularButton';

/* eslint-disable-next-line @typescript-eslint/no-deprecated */
RegularButton.propTypes = {
  color: PropTypes.oneOf([
    'primary',
    'info',
    'success',
    'warning',
    'error',
    'secondary',
    'white',
    'authsch',
    'facebook',
    'twitter',
    'google',
    'microsoft',
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
