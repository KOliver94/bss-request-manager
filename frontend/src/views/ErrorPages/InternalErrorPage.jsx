import 'assets/css/error-pages.css';

const InternalErrorPage = () => (
  <div id="error">
    <div className="error">
      <div className="error-code">
        <h1>500</h1>
      </div>
      <h2>Nem várt hiba történt</h2>
      <p>
        Az általad végzett művelet közben nem várt hiba történt. Kérlek próbáld
        újra később. <a href="/">Vissza a főoldalra</a>
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

export default InternalErrorPage;
