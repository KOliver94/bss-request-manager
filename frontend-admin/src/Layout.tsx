import { ScrollTop } from 'primereact/scrolltop';
import { Outlet, ScrollRestoration } from 'react-router-dom';

import Header from 'components/Header/Header';

const Layout = () => {
  return (
    <div className="flex flex-column min-h-screen surface-ground">
      <Header />
      <Outlet />
      <ScrollTop threshold={200} />
      <ScrollRestoration />
    </div>
  );
};

export default Layout;
