import { wrapCreateBrowserRouterV7 } from '@sentry/react';
import { QueryClient } from '@tanstack/react-query';
import { BlockUI } from 'primereact/blockui';
import { ProgressSpinner } from 'primereact/progressspinner';
import {
  createBrowserRouter,
  createRoutesFromElements,
  LoaderFunctionArgs,
  Outlet,
  Route,
} from 'react-router';
import { requestRetrieveQuery, requestVideoRetrieveQuery } from 'api/queries';
import Layout from 'Layout';
import ErrorPage from 'pages/ErrorPage';
import { loaderData as userProfileLoaderData } from 'pages/UserProfilePage';

export const queryClient = new QueryClient();

export type requestLoaderData = Awaited<ReturnType<typeof requestLoader>>;
export type videoLoaderData = Awaited<ReturnType<typeof videoLoader>>;

export async function requestLoader({ params }: LoaderFunctionArgs) {
  if (!params.requestId) {
    throw new Error('No request ID provided');
  }
  const requestData = await queryClient.ensureQueryData(
    requestRetrieveQuery(params.requestId),
  );
  return { requestId: params.requestId, requestTitle: requestData.title };
}

export async function videoLoader({ params }: LoaderFunctionArgs) {
  if (!params.requestId) {
    throw new Error('No request ID provided');
  }
  if (!params.videoId) {
    throw new Error('No video ID provided');
  }
  const videoData = await queryClient.ensureQueryData(
    requestVideoRetrieveQuery(params.requestId, params.videoId),
  );
  return {
    requestId: params.requestId,
    videoId: params.videoId,
    videoTitle: videoData.title,
  };
}

const sentryCreateBrowserRouter =
  wrapCreateBrowserRouterV7(createBrowserRouter);

const router = sentryCreateBrowserRouter(
  createRoutesFromElements(
    <Route
      path="/"
      element={<Layout />}
      hydrateFallbackElement={
        <BlockUI blocked={true} fullScreen template={<ProgressSpinner />} />
      }
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
            crumb: ({ requestTitle }: requestLoaderData) => requestTitle,
          }}
        >
          <Route
            index
            loader={requestLoader}
            lazy={() => import('pages/RequestDetailsPage')}
          />
          <Route
            path="edit"
            loader={requestLoader}
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
              loader={videoLoader}
              handle={{
                crumb: ({ videoTitle }: videoLoaderData) => videoTitle,
              }}
            >
              <Route
                index
                loader={videoLoader}
                lazy={() => import('pages/VideoDetailsPage')}
              />
              <Route
                path="edit"
                loader={videoLoader}
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
            crumb: ({ userFullName }: userProfileLoaderData) => userFullName,
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
