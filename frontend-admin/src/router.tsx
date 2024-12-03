import { wrapCreateBrowserRouter } from '@sentry/react';
import { QueryClient } from '@tanstack/react-query';
import {
  createBrowserRouter,
  createRoutesFromElements,
  Outlet,
  Route,
} from 'react-router';

import {
  RequestAdminRetrieve,
  UserAdminRetrieveUpdate,
  VideoAdminRetrieve,
} from 'api/models';
import { requestRetrieveQuery, requestVideoRetrieveQuery } from 'api/queries';
import Layout from 'Layout';
import ErrorPage from 'pages/ErrorPage';

export const queryClient = new QueryClient();

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function requestLoader({ params }: any) {
  const query = requestRetrieveQuery(Number(params.requestId));
  return (
    queryClient.getQueryData(query.queryKey) ??
    (await queryClient.fetchQuery(query))
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function requestVideoLoader({ params }: any) {
  const query = requestVideoRetrieveQuery(
    Number(params.requestId),
    Number(params.videoId),
  );
  return (
    queryClient.getQueryData(query.queryKey) ??
    (await queryClient.fetchQuery(query))
  );
}

const sentryCreateBrowserRouter = wrapCreateBrowserRouter(createBrowserRouter);

const router = sentryCreateBrowserRouter(
  createRoutesFromElements(
    <Route
      path="/"
      element={<Layout />}
      errorElement={
        <Layout>
          <ErrorPage />
        </Layout>
      }
    >
      <Route index lazy={() => import('pages/LandingPage')} />
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
          lazy={() => import('pages/RequestCreatorEditorPage')}
          handle={{
            crumb: () => 'Új',
          }}
        />
        <Route
          path=":requestId"
          loader={requestLoader}
          handle={{
            crumb: (data: RequestAdminRetrieve) => data.title,
          }}
        >
          <Route index lazy={() => import('pages/RequestDetailsPage')} />
          <Route
            path="edit"
            lazy={() => import('pages/RequestCreatorEditorPage')}
            handle={{
              crumb: () => 'Szerkesztés',
            }}
          />
          <Route
            path="videos"
            handle={{
              crumb: () => 'Videók',
            }}
          >
            <Route index lazy={() => import('pages/VideosListPage')} />
            <Route
              path="new"
              lazy={() => import('pages/VideoCreatorEditorPage')}
              handle={{
                crumb: () => 'Új videó',
              }}
            />
            <Route
              path=":videoId"
              loader={requestVideoLoader}
              handle={{
                crumb: (data: VideoAdminRetrieve) => data.title,
              }}
            >
              <Route index lazy={() => import('pages/VideoDetailsPage')} />
              <Route
                path="edit"
                lazy={() => import('pages/VideoCreatorEditorPage')}
                handle={{
                  crumb: () => 'Szerkesztés',
                }}
              />
            </Route>
          </Route>
        </Route>
      </Route>
      <Route
        path="search"
        lazy={() => import('pages/SearchPage')}
        handle={{
          crumb: () => 'Keresés',
        }}
      />
      <Route
        path="todos"
        lazy={() => import('pages/TodosPage')}
        handle={{
          crumb: () => 'Feladatok',
        }}
      />
      <Route
        path="users"
        handle={{
          crumb: () => 'Felhasználók',
        }}
      >
        <Route index lazy={() => import('pages/UsersListPage')} />
        <Route
          path=":userId"
          lazy={() => import('pages/UserProfilePage')}
          handle={{
            crumb: (data: UserAdminRetrieveUpdate) =>
              `${data.last_name} ${data.first_name}`,
          }}
        />
      </Route>
      <Route path="error" element={<ErrorPage />} />
    </Route>,
  ),
  {
    basename: '/admin',
  },
);

if (import.meta.hot) {
  import.meta.hot.dispose(() => {
    router.dispose();
  });
}

export default router;
