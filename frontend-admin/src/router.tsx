import {
  createBrowserRouter,
  createRoutesFromElements,
  Outlet,
  Route,
} from 'react-router-dom';

import App from 'App';
import RequestCreator from 'components/RequestCreator/RequestCreator';
import Layout from 'Layout';
import RequestsListPage from 'pages/RequestsListPage';
import UsersListPage from 'pages/UsersListPage';

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<Layout />}>
      <Route index element={<App />} />
      <Route
        path="requests"
        element={<Outlet />}
        handle={{
          crumb: () => 'Felkérések',
        }}
      >
        <Route index element={<RequestsListPage />} />
        <Route
          path="new"
          element={<RequestCreator />}
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
        element={<UsersListPage />}
        handle={{
          crumb: () => 'Felhasználók',
        }}
      />
    </Route>
  ),
  {
    basename: '/admin',
  }
);

if (import.meta.hot) {
  import.meta.hot.dispose(() => router.dispose());
}

export default router;
