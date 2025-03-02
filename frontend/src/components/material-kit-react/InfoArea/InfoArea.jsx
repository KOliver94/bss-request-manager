import classNames from 'classnames';
import PropTypes from 'prop-types';

import stylesModule from './InfoArea.module.scss';

export default function InfoArea({
  icon: Icon,
  title,
  description,
  iconColor = 'gray',
  vertical,
}) {
  const iconWrapper = classNames({
    [stylesModule.iconWrapper]: true,
    [stylesModule[iconColor]]: true,
    [stylesModule.iconWrapperVertical]: vertical,
  });
  const iconClasses = classNames({
    [stylesModule.icon]: true,
    [stylesModule.iconVertical]: vertical,
  });
  return (
    <div className={stylesModule.infoArea}>
      <div className={iconWrapper}>
        <Icon className={iconClasses} />
      </div>
      <div className={stylesModule.descriptionWrapper}>
        <h4 className={stylesModule.title}>{title}</h4>
        <p className={stylesModule.description}>{description}</p>
      </div>
    </div>
  );
}

InfoArea.propTypes = {
  icon: PropTypes.object.isRequired,
  title: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  iconColor: PropTypes.oneOf([
    'primary',
    'warning',
    'error',
    'success',
    'info',
    'secondary',
    'gray',
  ]),
  vertical: PropTypes.bool,
};
