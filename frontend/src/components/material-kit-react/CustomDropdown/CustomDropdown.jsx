import { useState, useRef } from 'react';
// nodejs library that concatenates classes
import classNames from 'classnames';
// nodejs library to set properties for components
import PropTypes from 'prop-types';
// @mui components
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
import Button from 'components/material-kit-react/CustomButtons/Button';
// Helpers
import stringToColor from 'helpers/stringToColor';

import stylesModule from './CustomDropdown.module.scss';

export default function CustomDropdown({
  hoverColor = 'primary',
  buttonText,
  buttonIcon,
  dropdownList,
  buttonProps,
  dropup,
  dropdownHeader,
  rtlActive,
  caret = true,
  left,
  noLiPadding,
  onClick,
}) {
  const [open, setOpen] = useState(false);
  const anchorRef = useRef(null);
  const handleClose = (param) => {
    setOpen(false);
    if (onClick) {
      onClick(param);
    }
  };
  const handleCloseAway = (event) => {
    if (anchorRef.current && anchorRef.current.contains(event.target)) {
      return;
    }
    setOpen(false);
  };
  const caretClasses = classNames({
    [stylesModule.caret]: true,
    [stylesModule.caretActive]: open,
    [stylesModule.caretRTL]: rtlActive,
  });
  const dropdownItem = classNames({
    [stylesModule.dropdownItem]: true,
    [stylesModule[`${hoverColor}Hover`]]: true,
    [stylesModule.noLiPadding]: noLiPadding,
    [stylesModule.dropdownItemRTL]: rtlActive,
  });
  let icon;
  switch (typeof buttonIcon) {
    case 'object':
      if (buttonIcon.type === 'Avatar') {
        icon = (
          <Avatar
            sx={{
              bgcolor: stringToColor(buttonText),
            }}
            className={stylesModule.buttonAvatar}
            src={buttonIcon.imgSrc}
          >
            {buttonIcon.fallback}
          </Avatar>
        );
        break;
      }
      // eslint-disable-next-line no-case-declarations
      const ButtonIcon = buttonIcon;
      icon = <ButtonIcon className={stylesModule.buttonIcon} />;
      break;
    case 'string':
      icon = <Icon className={stylesModule.buttonIcon}>{buttonIcon}</Icon>;
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
          // eslint-disable-next-line no-nested-ternary
          dropup
            ? left
              ? 'top-start'
              : 'top'
            : left
              ? 'bottom-start'
              : 'bottom'
        }
        className={classNames({
          [stylesModule.popperClose]: !open,
          [stylesModule.popperResponsive]: true,
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
            <Paper className={stylesModule.dropdown}>
              <ClickAwayListener onClickAway={handleCloseAway}>
                <MenuList role="menu" className={stylesModule.menuList}>
                  {dropdownHeader !== undefined ? (
                    <MenuItem
                      onClick={() => handleClose(dropdownHeader)}
                      className={stylesModule.dropdownHeader}
                    >
                      {dropdownHeader}
                    </MenuItem>
                  ) : null}
                  {dropdownList.map((prop, key) => {
                    if (prop.divider !== undefined) {
                      if (prop.divider) {
                        return (
                          <Divider
                            // eslint-disable-next-line react/no-array-index-key
                            key={key}
                            className={stylesModule.dropdownDividerItem}
                          />
                        );
                      }
                      return null;
                    }
                    return (
                      <MenuItem
                        // eslint-disable-next-line react/no-array-index-key
                        key={key}
                        onClick={() => handleClose(prop)}
                        className={dropdownItem}
                      >
                        {prop}
                      </MenuItem>
                    );
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

CustomDropdown.propTypes = {
  hoverColor: PropTypes.oneOf([
    'black',
    'primary',
    'info',
    'success',
    'warning',
    'error',
    'secondary',
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
