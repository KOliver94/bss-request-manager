import { Link } from 'react-router-dom';
import 'assets/css/error-pages.css';

const NotFoundErrorPage = () => (
  <div id="error">
    <div className="error">
      <div className="error-code">
        <h1>404</h1>
      </div>
      <h2>Az oldal nem található</h2>
      <p>
        Az általad keresett oldal nem létezik. Lehet, hogy törlésre került,
        megváltozott a címe vagy ideiglenesen nem elérhető.{' '}
        <Link to="/">Vissza a főoldalra</Link>
      </p>
      <div className="error-social">
        <a href="https://bsstudio.hu">
          <i className="fa fa-globe-europe" />
        </a>
        <a href="https://facebook.com/bsstudio">
          <i className="fa fa-facebook" />
        </a>
        <a href="https://instagram.com/budavari_schonherz_studio">
          <i className="fa fa-instagram" />
        </a>
        <a href="https://youtube.com/bsstudi0">
          <i className="fa fa-youtube" />
        </a>
      </div>
    </div>
  </div>
);

export default NotFoundErrorPage;
