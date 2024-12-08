import { lazy, Suspense } from 'react';
import { wrapCreateBrowserRouterV7 } from '@sentry/react';
import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
} from 'react-router';
import AuthenticatedRoute from 'src/components/AuthenticatedRoute';
import ErrorPage from 'src/views/ErrorPage/ErrorPage';
import LoadingPage from 'src/views/LoadingPage/LoadingPage';
import RedirectPage from 'src/views/RedirectPage/RedirectPage';
import Layout from './Layout';

const MyRequestsPage = lazy(
  () => import('src/views/MyRequestsPage/MyRequestsPage'),
);
const ProfilePage = lazy(() => import('src/views/ProfilePage/ProfilePage'));
const RequestDetailPage = lazy(
  () => import('src/views/RequestDetailPage/RequestDetailPage'),
);

const sentryCreateBrowserRouter =
  wrapCreateBrowserRouterV7(createBrowserRouter);

const router = sentryCreateBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<Layout />} errorElement={<ErrorPage />}>
      <Route index lazy={() => import('src/views/LandingPage/LandingPage')} />
      <Route
        path="login"
        lazy={() => import('src/views/LoginPage/LoginPage')}
      />
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
        lazy={() => import('src/views/RequestCreatorPage/RequestCreatorPage')}
      />
      <Route
        path="privacy"
        lazy={() => import('src/views/PolicyPages/PrivacyPolicyPage')}
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
        lazy={() => import('src/views/PolicyPages/TermsOfServicePage')}
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
