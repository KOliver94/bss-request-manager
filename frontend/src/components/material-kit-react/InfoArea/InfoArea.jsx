// nodejs library to set properties for components
import PropTypes from 'prop-types';
// nodejs library that concatenates classes
import classNames from 'classnames';

import stylesModule from './InfoArea.module.scss';

export default function InfoArea(props) {
  const { title, description, iconColor, vertical } = props;
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
        <props.icon className={iconClasses} />
      </div>
      <div className={stylesModule.descriptionWrapper}>
        <h4 className={stylesModule.title}>{title}</h4>
        <p className={stylesModule.description}>{description}</p>
      </div>
    </div>
  );
}

InfoArea.defaultProps = {
  iconColor: 'gray',
};

InfoArea.propTypes = {
  icon: PropTypes.object.isRequired,
  title: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  iconColor: PropTypes.oneOf([
    'primary',
    'warning',
    'danger',
    'success',
    'info',
    'rose',
    'gray',
  ]),
  vertical: PropTypes.bool,
};
