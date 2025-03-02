import classNames from 'classnames';
import PropTypes from 'prop-types';

import stylesModule from './CardHeader.module.scss';

export default function CardHeader(props) {
  const { className, children, color, plain, ...rest } = props;
  const cardHeaderClasses = classNames({
    [stylesModule.cardHeader]: true,
    [stylesModule[`${color}CardHeader`]]: color,
    [stylesModule.cardHeaderPlain]: plain,
    [className]: className !== undefined,
  });
  return (
    <div className={cardHeaderClasses} {...rest}>
      {children}
    </div>
  );
}

CardHeader.propTypes = {
  className: PropTypes.string,
  color: PropTypes.oneOf(['warning', 'success', 'error', 'info', 'primary']),
  plain: PropTypes.bool,
  children: PropTypes.node,
};
