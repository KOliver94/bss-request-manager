import { useState, useRef } from 'react';
// nodejs library that concatenates classes
import classNames from 'classnames';
// nodejs library to set properties for components
import PropTypes from 'prop-types';

// @mui components
import makeStyles from '@mui/styles/makeStyles';
import MenuItem from '@mui/material/MenuItem';
import MenuList from '@mui/material/MenuList';
import ClickAwayListener from '@mui/material/ClickAwayListener';
import Paper from '@mui/material/Paper';
import Grow from '@mui/material/Grow';
import Divider from '@mui/material/Divider';
import Icon from '@mui/material/Icon';
import Popper from '@mui/material/Popper';
import Avatar from '@mui/material/Avatar';

// core components
import Button from 'components/material-kit-react/CustomButtons/Button.js';

import styles from 'assets/jss/material-kit-react/components/customDropdownStyle.js';

const useStyles = makeStyles(styles);

export default function CustomDropdown(props) {
  const [open, setOpen] = useState(false);
  const anchorRef = useRef(null);
  const handleClose = (param) => {
    setOpen(false);
    if (props && props.onClick) {
      props.onClick(param);
    }
  };
  const handleCloseAway = (event) => {
    if (anchorRef.current && anchorRef.current.contains(event.target)) {
      return;
    }
    setOpen(false);
  };
  const classes = useStyles();
  const {
    buttonText,
    buttonIcon,
    dropdownList,
    buttonProps,
    dropup,
    dropdownHeader,
    caret,
    hoverColor,
    left,
    rtlActive,
    noLiPadding,
  } = props;
  const caretClasses = classNames({
    [classes.caret]: true,
    [classes.caretActive]: open,
    [classes.caretRTL]: rtlActive,
  });
  const dropdownItem = classNames({
    [classes.dropdownItem]: true,
    [classes[hoverColor + 'Hover']]: true,
    [classes.noLiPadding]: noLiPadding,
    [classes.dropdownItemRTL]: rtlActive,
  });
  let icon;
  switch (typeof buttonIcon) {
    case 'object':
      if (buttonIcon.type === 'Avatar') {
        icon = (
          <Avatar className={classes.buttonAvatar} src={buttonIcon.imgSrc} />
        );
        break;
      }
      icon = <props.buttonIcon className={classes.buttonIcon} />;
      break;
    case 'string':
      icon = <Icon className={classes.buttonIcon}>{props.buttonIcon}</Icon>;
      break;
    default:
      icon = null;
      break;
  }
  return (
    <div>
      <div>
        <Button
          ref={anchorRef}
          aria-label="Notifications"
          aria-owns={open ? 'menu-list' : null}
          aria-haspopup="true"
          {...buttonProps}
          onClick={() => {
            setOpen(!open);
          }}
        >
          {icon}
          {buttonText !== undefined ? buttonText : null}
          {caret ? <b className={caretClasses} /> : null}
        </Button>
      </div>
      <Popper
        open={open}
        anchorEl={anchorRef.current}
        transition
        disablePortal
        placement={
          dropup
            ? left
              ? 'top-start'
              : 'top'
            : left
            ? 'bottom-start'
            : 'bottom'
        }
        className={classNames({
          [classes.popperClose]: !open,
          [classes.popperResponsive]: true,
        })}
      >
        {({ TransitionProps }) => (
          <Grow
            {...TransitionProps}
            in={open}
            id="menu-list"
            style={
              dropup
                ? { transformOrigin: '0 100% 0' }
                : { transformOrigin: '0 0 0' }
            }
          >
            <Paper className={classes.dropdown}>
              <ClickAwayListener onClickAway={handleCloseAway}>
                <MenuList role="menu" className={classes.menuList}>
                  {dropdownHeader !== undefined ? (
                    <MenuItem
                      onClick={() => handleClose(dropdownHeader)}
                      className={classes.dropdownHeader}
                    >
                      {dropdownHeader}
                    </MenuItem>
                  ) : null}
                  {dropdownList.map((prop, key) => {
                    if (prop.divider) {
                      return (
                        <Divider
                          key={key}
                          className={classes.dropdownDividerItem}
                        />
                      );
                    } else {
                      return (
                        <MenuItem
                          key={key}
                          onClick={() => handleClose(prop)}
                          className={dropdownItem}
                        >
                          {prop}
                        </MenuItem>
                      );
                    }
                  })}
                </MenuList>
              </ClickAwayListener>
            </Paper>
          </Grow>
        )}
      </Popper>
    </div>
  );
}

CustomDropdown.defaultProps = {
  caret: true,
  hoverColor: 'primary',
};

CustomDropdown.propTypes = {
  hoverColor: PropTypes.oneOf([
    'black',
    'primary',
    'info',
    'success',
    'warning',
    'danger',
    'rose',
  ]),
  buttonText: PropTypes.node,
  buttonIcon: PropTypes.oneOfType([PropTypes.object, PropTypes.string]),
  dropdownList: PropTypes.array,
  buttonProps: PropTypes.object,
  dropup: PropTypes.bool,
  dropdownHeader: PropTypes.node,
  rtlActive: PropTypes.bool,
  caret: PropTypes.bool,
  left: PropTypes.bool,
  noLiPadding: PropTypes.bool,
  // function that returns the selected item
  onClick: PropTypes.func,
};
