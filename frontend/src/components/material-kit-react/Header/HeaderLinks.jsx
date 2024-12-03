import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
// react components for routing our app without refresh
import { Link, useLocation, useNavigate } from 'react-router';

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
import { logoutUser } from 'src/api/loginApi';
import {
  isAuthenticated,
  isPrivileged,
} from 'src/helpers/authenticationHelper';

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
              <AdminButton />,
              { divider: isPrivileged() },
              <Link to="/profile" className={stylesModule.dropdownLink}>
                <i className="fa-solid fa-circle-user" /> Profilom
              </Link>,
              <Link to="/my-requests" className={stylesModule.dropdownLink}>
                <i className="fa-solid fa-list-check" /> Felkéréseim
              </Link>,
              { divider: true },
              <button
                type="button"
                onClick={handleLogout}
                className={stylesModule.dropdownLink}
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
  hideNewRequest: PropTypes.bool,
  hideLogin: PropTypes.bool,
};
