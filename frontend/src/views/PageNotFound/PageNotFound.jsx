import React from 'react';
import { Link } from 'react-router-dom';
import 'assets/css/page-not-found.css';

const PageNotFound = () => (
  <div id="notfound">
    <div className="notfound">
      <div className="notfound-404">
        <h1>404</h1>
      </div>
      <h2>Az oldal nem található</h2>
      <p>
        Az általad keresett oldal nem létezik. Lehet, hogy törlésre került,
        megváltozott a címe vagy ideiglenesen nem elérhető.{' '}
        <Link to="/">Vissza a főoldalra</Link>
      </p>
      <div className="notfound-social">
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

export default PageNotFound;
