import { createRoutesFromElements, Outlet, Route } from 'react-router-dom';

import App from './App';
import Layout from './Layout';

const routes = createRoutesFromElements(
  <Route path="/" element={<Layout />}>
    <Route index element={<App />} />
    <Route
      path="requests"
      element={<Outlet />}
      handle={{
        crumb: () => 'Felkérések',
      }}
    >
      <Route index element={<App />} />
      <Route
        path="new"
        element={<App />}
        handle={{
          crumb: () => 'Új',
        }}
      />
      <Route
        path=":id"
        element={<App />}
        handle={{
          crumb: () => 'Teszt felkérés',
        }}
      >
        <Route
          path="videos"
          element={<App />}
          handle={{
            crumb: () => 'Videók',
          }}
        />
      </Route>
    </Route>
    <Route
      path="search"
      element={<App />}
      handle={{
        crumb: () => 'Keresés',
      }}
    />
    <Route
      path="users"
      element={<App />}
      handle={{
        crumb: () => 'Felhasználók',
      }}
    />
  </Route>
);

export default routes;
