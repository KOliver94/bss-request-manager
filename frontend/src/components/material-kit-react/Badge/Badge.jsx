import PropTypes from 'prop-types';

import stylesModule from './Badge.module.scss';

export default function Badge({ color = 'gray', children }) {
  return (
    <span className={`${stylesModule.badge} ${stylesModule[color]}`}>
      {children}
    </span>
  );
}

Badge.propTypes = {
  color: PropTypes.oneOf([
    'primary',
    'warning',
    'error',
    'success',
    'info',
    'secondary',
    'gray',
  ]),
  children: PropTypes.node,
};
