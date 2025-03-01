import { useState, useEffect } from 'react';
// nodejs library that concatenates classes
import classNames from 'classnames';
// nodejs library to set properties for components
import PropTypes from 'prop-types';
import background from 'assets/img/header.webp';

import stylesModule from './Parallax.module.scss';

export default function Parallax(props) {
  let windowScrollTop;
  if (window.innerWidth >= 768) {
    windowScrollTop = window.scrollY / 3;
  } else {
    windowScrollTop = 0;
  }
  const [transform, setTransform] = useState(
    `translate3d(0,${windowScrollTop}px,0)`,
  );
  const resetTransform = () => {
    const scrollTop = window.scrollY / 3;
    setTransform(`translate3d(0,${scrollTop}px,0)`);
  };
  useEffect(() => {
    if (window.innerWidth >= 768) {
      window.addEventListener('scroll', resetTransform);
    }
    return function cleanup() {
      if (window.innerWidth >= 768) {
        window.removeEventListener('scroll', resetTransform);
      }
    };
  });

  const { filter, className, children, style, small } = props;

  const parallaxClasses = classNames({
    [stylesModule.parallax]: true,
    [stylesModule.filter]: filter,
    [stylesModule.small]: small,
    [className]: className !== undefined,
  });

  useEffect(() => {
    resetTransform();
  }, [small]);

  return (
    <div
      className={parallaxClasses}
      style={{
        ...style,
        backgroundImage: `url(${background})`,
        transform,
      }}
    >
      {children}
    </div>
  );
}

Parallax.propTypes = {
  className: PropTypes.string,
  filter: PropTypes.bool,
  children: PropTypes.node,
  style: PropTypes.string,
  small: PropTypes.bool,
};
