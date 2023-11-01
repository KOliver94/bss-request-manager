import { useState } from 'react';
import PropTypes from 'prop-types';
// react components for routing our app without refresh
import { Link, useLocation } from 'react-router-dom';

// @mui components
import makeStyles from '@mui/styles/makeStyles';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import CircularProgress from '@mui/material/CircularProgress';

// @mui/icons-material
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import SendRoundedIcon from '@mui/icons-material/SendRounded';

// core components
import Button from 'src/components/material-kit-react/CustomButtons/Button';
import CustomDropdown from 'src/components/material-kit-react/CustomDropdown/CustomDropdown';

import styles from 'src/assets/jss/material-kit-react/components/headerLinksStyle.js';

import { useSnackbar } from 'notistack';
import { logoutUser, isPrivileged } from 'src/api/loginApi';

const useStyles = makeStyles(styles);

const AdminButton = () => {
  const classes = useStyles();
  if (isPrivileged()) {
    return (
      <Link to="/admin/requests" className={classes.dropdownLink}>
        <i className="fa-solid fa-screwdriver-wrench" /> Admin
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
  const nameFirstLetter =
    localStorage.getItem('name') &&
    localStorage.getItem('name').split(' ')[1] &&
    localStorage.getItem('name').split(' ')[1][0];

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
      {isAuthenticated && !hideLogin ? (
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
              fallback: nameFirstLetter,
              imgSrc: localStorage.getItem('avatar'),
            }}
            dropdownList={[
              <AdminButton />,
              { divider: isPrivileged() },
              <Link to="/profile" className={classes.dropdownLink}>
                <i className="fa-solid fa-circle-user" /> Profilom
              </Link>,
              <Link to="/my-requests" className={classes.dropdownLink}>
                <i className="fa-solid fa-list-check" /> Felkéréseim
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
                  <i className="fa-solid fa-right-from-bracket" />
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
                to="/login"
                state={{ from: location }}
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
