import { Outlet, useLocation, ScrollRestoration } from 'react-router';

import Footer from 'components/material-kit-react/Footer/Footer';
import Header from 'components/material-kit-react/Header/Header';
import HeaderLinks from 'components/material-kit-react/Header/HeaderLinks';

function Layout() {
  const location = useLocation();
  const isLoginPage = location.pathname.startsWith('/login');
  const isLandingPage = location.pathname.length === 1;
  const isNewRequestPage = location.pathname.startsWith('/new-request');

  return (
    <div>
      <Header
        color="transparent"
        brand="BSS Felkéréskezelő"
        rightLinks={
          <HeaderLinks
            hideLogin={isLoginPage}
            hideNewRequest={isNewRequestPage}
          />
        }
        absolute={isLoginPage}
        fixed={!isLoginPage}
        changeColorOnScroll={
          !isLoginPage
            ? {
                height: isLandingPage ? 400 : 200,
                color: 'white',
              }
            : null
        }
      />
      <Outlet />
      <ScrollRestoration />
      {!isLoginPage && <Footer />}
    </div>
  );
}

export default Layout;
