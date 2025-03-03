import { lazy, Suspense } from 'react';

import Backdrop from '@mui/material/Backdrop';
import CircularProgress from '@mui/material/CircularProgress';
import { wrapCreateBrowserRouterV7 } from '@sentry/react';
import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
} from 'react-router';

import AuthenticatedRoute from 'components/AuthenticatedRoute';
import Layout from 'Layout';
import ErrorPage from 'views/ErrorPage/ErrorPage';
import LoadingPage from 'views/LoadingPage/LoadingPage';
import RedirectPage from 'views/RedirectPage/RedirectPage';

const MyRequestsPage = lazy(
  () => import('views/MyRequestsPage/MyRequestsPage'),
);
const ProfilePage = lazy(() => import('views/ProfilePage/ProfilePage'));
const RequestDetailPage = lazy(
  () => import('views/RequestDetailPage/RequestDetailPage'),
);

const sentryCreateBrowserRouter =
  wrapCreateBrowserRouterV7(createBrowserRouter);

const router = sentryCreateBrowserRouter(
  createRoutesFromElements(
    <Route
      path="/"
      element={<Layout />}
      errorElement={<ErrorPage />}
      hydrateFallbackElement={
        <Backdrop
          sx={(theme) => ({ color: '#fff', zIndex: theme.zIndex.drawer + 1 })}
          open={true}
        >
          <CircularProgress color="inherit" />
        </Backdrop>
      }
    >
      <Route index lazy={() => import('views/LandingPage/LandingPage')} />
      <Route path="login" lazy={() => import('views/LoginPage/LoginPage')} />
      <Route path="load" element={<LoadingPage />} />
      <Route path="my-requests">
        <Route
          index
          element={
            <AuthenticatedRoute>
              <Suspense fallback={<LoadingPage />}>
                <MyRequestsPage />
              </Suspense>
            </AuthenticatedRoute>
          }
        />
        <Route
          path=":id"
          element={
            <AuthenticatedRoute>
              <Suspense fallback={<LoadingPage />}>
                <RequestDetailPage />
              </Suspense>
            </AuthenticatedRoute>
          }
        />
      </Route>
      <Route
        path="new-request"
        lazy={() => import('views/RequestCreatorPage/RequestCreatorPage')}
      />
      <Route
        path="privacy"
        lazy={() => import('views/PolicyPages/PrivacyPolicyPage')}
      />
      <Route
        path="profile"
        element={
          <AuthenticatedRoute>
            <Suspense fallback={<LoadingPage />}>
              <ProfilePage />
            </Suspense>
          </AuthenticatedRoute>
        }
      />
      <Route path="/redirect" element={<RedirectPage />} />
      <Route
        path="terms"
        lazy={() => import('views/PolicyPages/TermsOfServicePage')}
      />
    </Route>,
  ),
);

if (import.meta.hot) {
  import.meta.hot.dispose(() => {
    router.dispose();
  });
}

export default router;
