import React from 'react';
// nodejs library to set properties for components
import PropTypes from 'prop-types';
// nodejs library that concatenates classes
import classNames from 'classnames';
// material-ui core components
import { List, ListItem } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';

// core components
import Button from 'components/material-kit-react/CustomButtons/Button.js';

import styles from 'assets/jss/material-kit-react/components/footerStyle.js';

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
                <i className={classes.socialIcons + ' fas fa-globe-europe'} />
              </Button>
            </ListItem>
            <ListItem className={classes.inlineBlock}>
              <Button
                color="transparent"
                href="https://facebook.com/bsstudio"
                target="_blank"
                className={classes.socialIcon}
              >
                <i className={classes.socialIcons + ' fab fa-facebook'} />
              </Button>
            </ListItem>
            <ListItem className={classes.inlineBlock}>
              <Button
                color="transparent"
                href="https://instagram.com/budavari_schonherz_studio"
                target="_blank"
                className={classes.socialIcon}
              >
                <i className={classes.socialIcons + ' fab fa-instagram'} />
              </Button>
            </ListItem>
            <ListItem className={classes.inlineBlock}>
              <Button
                color="transparent"
                href="https://youtube.com/bsstudi0"
                target="_blank"
                className={classes.socialIcon}
              >
                <i className={classes.socialIcons + ' fab fa-youtube'} />
              </Button>
            </ListItem>
          </List>
        </div>
        <div className={classes.right}>
          &copy; {1900 + new Date().getYear()} , Budavári Schönherz Stúdió
        </div>
      </div>
    </footer>
  );
}

Footer.propTypes = {
  whiteFont: PropTypes.bool,
};
