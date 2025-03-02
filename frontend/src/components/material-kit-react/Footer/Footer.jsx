import { List, ListItem } from '@mui/material';
import classNames from 'classnames';
import PropTypes from 'prop-types';

import Button from 'components/material-kit-react/CustomButtons/Button';

import stylesModule from './Footer.module.scss';

export default function Footer(props) {
  const { whiteFont } = props;
  const footerClasses = classNames({
    [stylesModule.footer]: true,
    [stylesModule.footerWhiteFont]: whiteFont,
  });
  return (
    <footer className={footerClasses}>
      <div className={stylesModule.container}>
        <div className={stylesModule.left}>
          <List className={stylesModule.list}>
            <ListItem className={stylesModule.inlineBlock}>
              <Button
                color="transparent"
                href="https://bsstudio.hu"
                target="_blank"
                className={stylesModule.socialIcon}
              >
                <i className="fa-solid fa-earth-europe" />
              </Button>
            </ListItem>
            <ListItem className={stylesModule.inlineBlock}>
              <Button
                color="transparent"
                href="https://facebook.com/bsstudio"
                target="_blank"
                className={stylesModule.socialIcon}
              >
                <i className="fa-brands fa-facebook" />
              </Button>
            </ListItem>
            <ListItem className={stylesModule.inlineBlock}>
              <Button
                color="transparent"
                href="https://instagram.com/budavari_schonherz_studio"
                target="_blank"
                className={stylesModule.socialIcon}
              >
                <i className="fa-brands fa-instagram" />
              </Button>
            </ListItem>
            <ListItem className={stylesModule.inlineBlock}>
              <Button
                color="transparent"
                href="https://tiktok.com/@bsstudio_"
                target="_blank"
                className={stylesModule.socialIcon}
              >
                <i className="fa-brands fa-tiktok" />
              </Button>
            </ListItem>
            <ListItem className={stylesModule.inlineBlock}>
              <Button
                color="transparent"
                href="https://youtube.com/bsstudi0"
                target="_blank"
                className={stylesModule.socialIcon}
              >
                <i className="fa-brands fa-youtube" />
              </Button>
            </ListItem>
          </List>
        </div>
        <div className={stylesModule.right}>
          &copy; {1900 + new Date().getYear()}, Budavári Schönherz Stúdió
        </div>
      </div>
    </footer>
  );
}

Footer.propTypes = {
  whiteFont: PropTypes.bool,
};
