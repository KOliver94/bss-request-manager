// nodejs library to set properties for components
import PropTypes from 'prop-types';
// nodejs library that concatenates classes
import classNames from 'classnames';
// @mui components
import { List, ListItem } from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';

// core components
import Button from 'src/components/material-kit-react/CustomButtons/Button';

import styles from 'src/assets/jss/material-kit-react/components/footerStyle.js';

const useStyles = makeStyles(styles);

export default function Footer(props) {
  const classes = useStyles();
  const { whiteFont } = props;
  const footerClasses = classNames({
    [classes.footer]: true,
    [classes.footerWhiteFont]: whiteFont,
  });
  return (
    <footer className={footerClasses}>
      <div className={classes.container}>
        <div className={classes.left}>
          <List className={classes.list}>
            <ListItem className={classes.inlineBlock}>
              <Button
                color="transparent"
                href="https://bsstudio.hu"
                target="_blank"
                className={classes.socialIcon}
              >
                <i className="fa-solid fa-earth-europe" />
              </Button>
            </ListItem>
            <ListItem className={classes.inlineBlock}>
              <Button
                color="transparent"
                href="https://facebook.com/bsstudio"
                target="_blank"
                className={classes.socialIcon}
              >
                <i className="fa-brands fa-facebook" />
              </Button>
            </ListItem>
            <ListItem className={classes.inlineBlock}>
              <Button
                color="transparent"
                href="https://instagram.com/budavari_schonherz_studio"
                target="_blank"
                className={classes.socialIcon}
              >
                <i className="fa-brands fa-instagram" />
              </Button>
            </ListItem>
            <ListItem className={classes.inlineBlock}>
              <Button
                color="transparent"
                href="https://tiktok.com/@bsstudio_"
                target="_blank"
                className={classes.socialIcon}
              >
                <i className="fa-brands fa-tiktok" />
              </Button>
            </ListItem>
            <ListItem className={classes.inlineBlock}>
              <Button
                color="transparent"
                href="https://youtube.com/bsstudi0"
                target="_blank"
                className={classes.socialIcon}
              >
                <i className="fa-brands fa-youtube" />
              </Button>
            </ListItem>
          </List>
        </div>
        <div className={classes.right}>
          &copy; {1900 + new Date().getYear()}, Budavári Schönherz Stúdió
        </div>
      </div>
    </footer>
  );
}

Footer.propTypes = {
  whiteFont: PropTypes.bool,
};
