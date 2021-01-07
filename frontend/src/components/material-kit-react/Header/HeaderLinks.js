import { useState } from 'react';
import PropTypes from 'prop-types';
// react components for routing our app without refresh
import { Link } from 'react-router-dom';
import { useLocation } from 'react-router-dom';

// @material-ui/core components
import { makeStyles } from '@material-ui/core/styles';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import CircularProgress from '@material-ui/core/CircularProgress';

// @material-ui/icons
import LockOutlinedIcon from '@material-ui/icons/LockOutlined';
import SendRoundedIcon from '@material-ui/icons/SendRounded';

// core components
import Button from 'components/material-kit-react/CustomButtons/Button.js';
import CustomDropdown from 'components/material-kit-react/CustomDropdown/CustomDropdown.js';

import styles from 'assets/jss/material-kit-react/components/headerLinksStyle.js';

import { useSnackbar } from 'notistack';
import { logoutUser, isPrivileged } from 'api/loginApi';

const useStyles = makeStyles(styles);

const AdminButton = () => {
  const classes = useStyles();
  if (isPrivileged()) {
    return (
      <Link to="/admin/requests" className={classes.dropdownLink}>
        <i className="fas fa-tools"></i> Admin
      </Link>
    );
  }
  return null;
};

export default function HeaderLinks({
  isAuthenticated = false,
  setIsAuthenticated,
  hideNewRequest = false,
  hideLogin = false,
  dataChangeTrigger = false,
}) {
  const classes = useStyles();
  const [loading, setLoading] = useState(false);
  const { enqueueSnackbar } = useSnackbar();
  const location = useLocation();

  async function handleLogout(event) {
    event.preventDefault();
    setLoading(true);

    try {
      await logoutUser();
      enqueueSnackbar('Sikeres kijelentkezés', {
        variant: 'success',
      });
    } catch (e) {
      enqueueSnackbar(e.message, {
        variant: 'error',
      });
    } finally {
      setIsAuthenticated(false);
      setLoading(false);
    }
  }

  return (
    <List className={classes.list}>
      {isAuthenticated ? (
        <ListItem className={classes.listItem}>
          <CustomDropdown
            noLiPadding
            buttonText={localStorage.getItem('name')}
            buttonProps={{
              className: classes.navLinkUserProfile,
              color: 'transparent',
            }}
            buttonIcon={{
              type: 'Avatar',
              imgSrc: localStorage.getItem('avatar'),
            }}
            dropdownList={[
              <AdminButton />,
              { divider: isPrivileged() },
              <Link to="/profile" className={classes.dropdownLink}>
                <i className="fas fa-user-circle"></i> Profilom
              </Link>,
              <Link to="/my-requests" className={classes.dropdownLink}>
                <i className="fas fa-tasks"></i> Felkéréseim
              </Link>,
              { divider: true },
              <Link
                to="/"
                onClick={handleLogout}
                className={classes.dropdownLink}
              >
                {loading ? (
                  <CircularProgress size={10} />
                ) : (
                  <i className="fas fa-sign-out-alt"></i>
                )}{' '}
                Kijelentkezés
              </Link>,
            ]}
          />
        </ListItem>
      ) : (
        <>
          {!hideLogin && (
            <ListItem className={classes.listItem}>
              <Link
                to={{ pathname: '/login', state: { from: location.pathname } }}
                className={classes.navReactRouterLink}
              >
                <Button color="transparent" className={classes.navLink}>
                  <LockOutlinedIcon className={classes.icons} /> Bejelentkezés
                </Button>
              </Link>
            </ListItem>
          )}
        </>
      )}

      {hideNewRequest ? (
        <></>
      ) : (
        <ListItem className={classes.listItem}>
          <Link to="/new-request" className={classes.navReactRouterLink}>
            <Button color="primary" className={classes.navLinkMain}>
              <SendRoundedIcon className={classes.icons} />
              Felkérés beküldése
            </Button>
          </Link>
        </ListItem>
      )}
    </List>
  );
}

HeaderLinks.propTypes = {
  isAuthenticated: PropTypes.bool,
  setIsAuthenticated: PropTypes.func,
  hideNewRequest: PropTypes.bool,
  hideLogin: PropTypes.bool,
  dataChangeTrigger: PropTypes.bool,
};
