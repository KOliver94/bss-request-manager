import {
  createBrowserRouter,
  createRoutesFromElements,
  Outlet,
  Route,
} from 'react-router-dom';

import Layout from 'Layout';

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<Layout />}>
      <Route index lazy={() => import('App')} />
      <Route
        path="requests"
        element={<Outlet />}
        handle={{
          crumb: () => 'Felkérések',
        }}
      >
        <Route index lazy={() => import('pages/RequestsListPage')} />
        <Route
          path="new"
          lazy={() => import('components/RequestCreator/RequestCreator')}
          handle={{
            crumb: () => 'Új',
          }}
        />
        <Route
          path=":requestId"
          handle={{
            crumb: () => 'Teszt felkérés',
          }}
        >
          <Route index lazy={() => import('pages/RequestDetailsPage')} />
          <Route
            path="videos"
            handle={{
              crumb: () => 'Videók',
            }}
          >
            <Route
              path="new"
              lazy={() => import('components/VideoCreator/VideoCreator')}
              handle={{
                crumb: () => 'Új videó',
              }}
            />
            <Route
              path=":videoId"
              lazy={() => import('pages/VideoDetailsPage')}
              handle={{
                crumb: () => 'Teszt videó',
              }}
            />
          </Route>
        </Route>
      </Route>
      <Route
        path="search"
        lazy={() => import('App')}
        handle={{
          crumb: () => 'Keresés',
        }}
      />
      <Route
        path="users"
        lazy={() => import('pages/UsersListPage')}
        handle={{
          crumb: () => 'Felhasználók',
        }}
      />
    </Route>,
  ),
  {
    basename: '/admin',
  },
);

if (import.meta.hot) {
  import.meta.hot.dispose(() => router.dispose());
}

export default router;
