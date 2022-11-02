import { Outlet, ScrollRestoration } from 'react-router-dom';

import Header from 'components/Header/Header';

const Layout = () => {
  return (
    <div className="flex flex-column min-h-screen surface-ground">
      <Header />
      <Outlet />
      <ScrollRestoration />
    </div>
  );
};

export default Layout;
