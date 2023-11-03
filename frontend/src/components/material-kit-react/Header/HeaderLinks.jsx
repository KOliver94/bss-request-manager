import { useState } from 'react';
import PropTypes from 'prop-types';
// react components for routing our app without refresh
import { Link, useLocation } from 'react-router-dom';

// @mui components
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import CircularProgress from '@mui/material/CircularProgress';

// @mui/icons-material
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import SendRoundedIcon from '@mui/icons-material/SendRounded';

// core components
import Button from 'src/components/material-kit-react/CustomButtons/Button';
import CustomDropdown from 'src/components/material-kit-react/CustomDropdown/CustomDropdown';

import { useSnackbar } from 'notistack';
import { logoutUser, isPrivileged } from 'src/api/loginApi';

import stylesModule from './HeaderLinks.module.scss';

const AdminButton = () => {
  if (isPrivileged()) {
    return (
      <Link to="/admin/requests" className={stylesModule.dropdownLink}>
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
    <List className={stylesModule.list}>
      {isAuthenticated && !hideLogin ? (
        <ListItem className={stylesModule.listItem}>
          <CustomDropdown
            noLiPadding
            buttonText={localStorage.getItem('name')}
            buttonProps={{
              className: stylesModule.navLinkUserProfile,
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
              <Link to="/profile" className={stylesModule.dropdownLink}>
                <i className="fa-solid fa-circle-user" /> Profilom
              </Link>,
              <Link to="/my-requests" className={stylesModule.dropdownLink}>
                <i className="fa-solid fa-list-check" /> Felkéréseim
              </Link>,
              { divider: true },
              <Link
                to="/"
                onClick={handleLogout}
                className={stylesModule.dropdownLink}
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
            <ListItem className={stylesModule.listItem}>
              <Link
                to="/login"
                state={{ from: location }}
                className={stylesModule.navReactRouterLink}
              >
                <Button color="transparent" className={stylesModule.navLink}>
                  <LockOutlinedIcon className={stylesModule.icons} />{' '}
                  Bejelentkezés
                </Button>
              </Link>
            </ListItem>
          )}
        </>
      )}

      {hideNewRequest ? (
        <></>
      ) : (
        <ListItem className={stylesModule.listItem}>
          <Link to="/new-request" className={stylesModule.navReactRouterLink}>
            <Button color="primary" className={stylesModule.navLinkMain}>
              <SendRoundedIcon className={stylesModule.icons} />
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
