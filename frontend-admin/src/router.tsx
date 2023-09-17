import { QueryClient } from '@tanstack/react-query';
import {
  createBrowserRouter,
  createRoutesFromElements,
  Outlet,
  Route,
} from 'react-router-dom';

import { RequestAdminRetrieve, VideoAdminRetrieve } from 'api/models';
import { requestRetrieveQuery, requestVideoRetrieveQuery } from 'api/queries';
import Layout from 'Layout';

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
