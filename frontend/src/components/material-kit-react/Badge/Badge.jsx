// nodejs library to set properties for components
import PropTypes from 'prop-types';

import stylesModule from './Badge.module.scss';

export default function Badge(props) {
  const { color, children } = props;
  return (
    <span className={stylesModule.badge + ' ' + stylesModule[color]}>
      {children}
    </span>
  );
}

Badge.defaultProps = {
  color: 'gray',
};

Badge.propTypes = {
  color: PropTypes.oneOf([
    'primary',
    'warning',
    'danger',
    'success',
    'info',
    'rose',
    'gray',
  ]),
  children: PropTypes.node,
};
