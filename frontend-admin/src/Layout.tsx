import { ScrollTop } from 'primereact/scrolltop';
import { Outlet, ScrollRestoration, useNavigation } from 'react-router-dom';

import Header from 'components/Header/Header';
import LoadingPage from 'pages/LoadingPage';

type LayoutProps = {
  children?: JSX.Element;
};

const Layout = ({ children }: LayoutProps) => {
  const navigation = useNavigation();

  return (
    <div className="flex flex-column min-h-screen surface-ground">
      <Header />
      {navigation.state == 'loading' ? <LoadingPage /> : children ?? <Outlet />}
      <ScrollTop threshold={200} />
      <ScrollRestoration />
    </div>
  );
};

export default Layout;
