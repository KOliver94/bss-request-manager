import { useEffect } from 'react';
import { Link, useRouteError, isRouteErrorResponse } from 'react-router';
import Paper from '@mui/material/Paper';
import changePageTitle from 'src/helpers/pageTitleHelper';
import getErrorDetails from 'src/helpers/errorPageConstants';

import stylesModule from './ErrorPage.module.scss';

export default function ErrorPage() {
  const error = useRouteError();
  let errorDetails = getErrorDetails('internal');

  if (isRouteErrorResponse(error)) {
    if (error.status === 404) {
      errorDetails = getErrorDetails('notfound');
    }
  }

  useEffect(() => {
    changePageTitle('Hoppá! Hiba történt');
  }, []);

  return (
    <Paper className={stylesModule.errorContainer} elevation={15}>
      <div className={stylesModule.error}>
        <div className={stylesModule.errorCode}>
          <h1>{errorDetails.code}</h1>
        </div>
        <h2>{errorDetails.title}</h2>
        <p>
          {errorDetails.body}{' '}
          {errorDetails.isException ? (
            <a href="/">Vissza a főoldalra</a>
          ) : (
            <Link to="/">Vissza a főoldalra</Link>
          )}
        </p>
        <div className={stylesModule.errorSocial}>
          <a aria-label="Weboldal" href="https://bsstudio.hu">
            <i className="fa-solid fa-earth-europe" />
          </a>
          <a aria-label="Facebook" href="https://facebook.com/bsstudio">
            <i className="fa-brands fa-facebook" />
          </a>
          <a
            aria-label="Instagram"
            href="https://instagram.com/budavari_schonherz_studio"
          >
            <i className="fa-brands fa-instagram" />
          </a>
          <a aria-label="TikTok" href="https://tiktok.com/@bsstudio_">
            <i className="fa-brands fa-tiktok" />
          </a>
          <a aria-label="YouTube" href="https://youtube.com/bsstudi0">
            <i className="fa-brands fa-youtube" />
          </a>
        </div>
      </div>
    </Paper>
  );
}
