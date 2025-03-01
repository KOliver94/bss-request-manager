import classNames from 'classnames';
import PropTypes from 'prop-types';

import stylesModule from './Card.module.scss';

export default function Card(props) {
  const { className, children, plain, carousel, ...rest } = props;
  const cardClasses = classNames({
    [stylesModule.card]: true,
    [stylesModule.cardPlain]: plain,
    [stylesModule.cardCarousel]: carousel,
    [className]: className !== undefined,
  });
  return (
    <div className={cardClasses} {...rest}>
      {children}
    </div>
  );
}

Card.propTypes = {
  className: PropTypes.string,
  plain: PropTypes.bool,
  carousel: PropTypes.bool,
  children: PropTypes.node,
};
