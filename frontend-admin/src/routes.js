import { createRoutesFromElements, Route } from 'react-router-dom';

import App from './App';

const routes = createRoutesFromElements(
  <Route path="/" element={<App />}>
    <Route path="requests" element={<App />} />
    <Route path="requests/new" element={<App />} />
    <Route path="search" element={<App />} />
    <Route path="users" element={<App />} />
  </Route>
);

export default routes;
