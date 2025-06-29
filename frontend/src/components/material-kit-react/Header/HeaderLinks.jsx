import { useState, useEffect } from 'react';

import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import SendRoundedIcon from '@mui/icons-material/SendRounded';
import CircularProgress from '@mui/material/CircularProgress';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import { useSnackbar } from 'notistack';
import PropTypes from 'prop-types';
import { Link, useLocation, useNavigate } from 'react-router';

import { logoutUser } from 'api/loginApi';
import Button from 'components/material-kit-react/CustomButtons/Button';
import CustomDropdown from 'components/material-kit-react/CustomDropdown/CustomDropdown';
import { isAuthenticated, isPrivileged } from 'helpers/authenticationHelper';

import stylesModule from './HeaderLinks.module.scss';

function AdminButton() {
  if (isPrivileged()) {
    return (
      <Link to="/admin" className={stylesModule.dropdownLink} reloadDocument>
        <i className="fa-solid fa-screwdriver-wrench" /> Admin
      </Link>
    );
  }
  return null;
}

export default function HeaderLinks({
  hideNewRequest = false,
  hideLogin = false,
  closeDrawer,
}) {
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState('');
  const [avatar, setAvatar] = useState(null);
  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate();
  const location = useLocation();
  const nameFirstLetter =
    localStorage.getItem('name') &&
    localStorage.getItem('name').split(' ')[1] &&
    localStorage.getItem('name').split(' ')[1][0];

  async function handleLogout(event) {
    event.preventDefault();
    setLoading(true);

    logoutUser().finally(() => {
      enqueueSnackbar('Sikeres kijelentkezés', {
        variant: 'success',
      });
      navigate('/', { replace: true });
      setLoading(false);
      if (closeDrawer) {
        closeDrawer();
      }
    });
  }

  function storageEventHandler() {
    setName(localStorage.getItem('name') || '');
    setAvatar(localStorage.getItem('avatar') || null);
  }

  useEffect(() => {
    setName(localStorage.getItem('name') || '');
    setAvatar(localStorage.getItem('avatar') || null);
    window.addEventListener('storage', storageEventHandler, false);
  }, []);

  const handleLinkClick = () => {
    if (closeDrawer) {
      closeDrawer();
    }
  };

  return (
    <List className={stylesModule.list}>
      {isAuthenticated() && !hideLogin ? (
        <ListItem className={stylesModule.listItem}>
          <CustomDropdown
            noLiPadding
            buttonText={name}
            buttonProps={{
              className: stylesModule.navLinkUserProfile,
              color: 'transparent',
            }}
            buttonIcon={{
              type: 'Avatar',
              fallback: nameFirstLetter,
              imgSrc: avatar,
            }}
            dropdownList={[
              <AdminButton key="admin" />,
              { divider: isPrivileged() },
              <Link
                to="/profile"
                className={stylesModule.dropdownLink}
                key="my-profile"
                onClick={handleLinkClick}
              >
                <i className="fa-solid fa-circle-user" /> Profilom
              </Link>,
              <Link
                to="/my-requests"
                className={stylesModule.dropdownLink}
                key="my-requests"
                onClick={handleLinkClick}
              >
                <i className="fa-solid fa-list-check" /> Felkéréseim
              </Link>,
              { divider: true },
              <button
                type="button"
                onClick={handleLogout}
                className={stylesModule.dropdownLink}
                key="logout"
              >
                {loading ? (
                  <CircularProgress size={10} />
                ) : (
                  <i className="fa-solid fa-right-from-bracket" />
                )}{' '}
                Kijelentkezés
              </button>,
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
                onClick={handleLinkClick}
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

      {!hideNewRequest && (
        <ListItem className={stylesModule.listItem}>
          <Link
            to="/new-request"
            className={stylesModule.navReactRouterLink}
            onClick={handleLinkClick}
          >
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
  hideNewRequest: PropTypes.bool,
  hideLogin: PropTypes.bool,
  closeDrawer: PropTypes.func,
};
