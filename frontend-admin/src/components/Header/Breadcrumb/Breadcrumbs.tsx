import { Fragment } from 'react';

import { useMatches, useNavigate } from 'react-router-dom';

type BreadcrumbsType = {
  name: string;
  path: string;
}[];

type ReactRouterUseMatchesType = {
  data: unknown;
  handle: {
    crumb: (data?: unknown) => string;
  };
  pathname: string;
}[];

const Breadcrumbs = () => {
  const navigate = useNavigate();
  const matches = useMatches() as ReactRouterUseMatchesType;

  const breadcrumbs: BreadcrumbsType = matches
    // first get rid of any matches that don't have handle and crumb
    .filter((match) => Boolean(match.handle?.crumb))
    // now map them into an array of elements, passing the loader
    // data to each one
    .map((match) => {
      return { name: match.handle.crumb(match.data), path: match.pathname };
    });

  return (
    <ul className="align-items-center border-bottom-1 border-top-1 flex font-medium list-none m-0 overflow-x-auto px-5 py-3 surface-border surface-section">
      {/* Home button */}
      <li className="pr-3">
        <a className="cursor-pointer" onClick={() => navigate('/')}>
          <i className="pi pi-home text-blue-500"></i>
        </a>
      </li>

      {breadcrumbs?.map((breadcrumb, index, array) => (
        <Fragment key={`breadcrumb-fragment-${index}`}>
          {/* Right arrow (>) */}
          <li className="px-2">
            <i className="pi pi-angle-right text-500"></i>
          </li>

          {/* Texts - Last item different, no redirect*/}
          <li className="px-2">
            {!Object.is(array.length - 1, index) ? (
              <a
                className="cursor-pointer text-blue-500 white-space-nowrap"
                onClick={() => navigate(breadcrumb.path)}
              >
                {breadcrumb.name}
              </a>
            ) : (
              <span className="text-900 white-space-nowrap">
                {breadcrumb.name}
              </span>
            )}
          </li>
        </Fragment>
      ))}
    </ul>
  );
};

export default Breadcrumbs;
