// nodejs library that concatenates classes
import classNames from 'classnames';
// nodejs library to set properties for components
import PropTypes from 'prop-types';

import stylesModule from './CardBody.module.scss';

export default function CardBody(props) {
  const { className, children, ...rest } = props;
  const cardBodyClasses = classNames({
    [stylesModule.cardBody]: true,
    [className]: className !== undefined,
  });
  return (
    <div className={cardBodyClasses} {...rest}>
      {children}
    </div>
  );
}

CardBody.propTypes = {
  className: PropTypes.string,
  children: PropTypes.node,
};
