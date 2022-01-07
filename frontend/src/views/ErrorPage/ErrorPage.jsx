import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import changePageTitle from 'helpers/pageTitleHelper';
import getErrorDetails from 'helpers/errorPageConstants';
import 'assets/css/error-page.css';

export default function ErrorPage({ type }) {
  const errorDetails = getErrorDetails(type);

  useEffect(() => {
    changePageTitle('Hoppá! Hiba történt');
  }, []);

  return (
    <div id="error">
      <div className="error">
        <div className="error-code">
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
        <div className="error-social">
          <a href="https://bsstudio.hu">
            <i className="fa-solid fa-earth-europe" />
          </a>
          <a href="https://facebook.com/bsstudio">
            <i className="fa-brands fa-facebook" />
          </a>
          <a href="https://instagram.com/budavari_schonherz_studio">
            <i className="fa-brands fa-instagram" />
          </a>
          <a href="https://youtube.com/bsstudi0">
            <i className="fa-brands fa-youtube" />
          </a>
        </div>
      </div>
    </div>
  );
}

ErrorPage.propTypes = {
  type: PropTypes.oneOf(['internal', 'notfound']).isRequired,
};
