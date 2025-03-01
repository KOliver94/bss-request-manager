import PropTypes from 'prop-types';

import stylesModule from './Badge.module.scss';

export default function StatusBadge(props) {
  const { color, children } = props;
  return (
    <span className={stylesModule.badge} style={{ backgroundColor: color }}>
      {children}
    </span>
  );
}

StatusBadge.propTypes = {
  // eslint-disable-next-line consistent-return
  color(props, propName, componentName) {
    if (!/^#[0-9a-fA-F]{6}$/.test(props[propName])) {
      return new Error(
        `Invalid prop \`${propName}\` supplied to` +
          ` \`${componentName}\`. Must be a valid color code.`,
      );
    }
  },
  children: PropTypes.node,
};
