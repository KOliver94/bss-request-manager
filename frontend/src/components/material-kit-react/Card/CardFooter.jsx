import classNames from 'classnames';
import PropTypes from 'prop-types';

import stylesModule from './CardFooter.module.scss';

export default function CardFooter(props) {
  const { className, children, ...rest } = props;
  const cardFooterClasses = classNames({
    [stylesModule.cardFooter]: true,
    [className]: className !== undefined,
  });
  return (
    <div className={cardFooterClasses} {...rest}>
      {children}
    </div>
  );
}

CardFooter.propTypes = {
  className: PropTypes.string,
  children: PropTypes.node,
};
