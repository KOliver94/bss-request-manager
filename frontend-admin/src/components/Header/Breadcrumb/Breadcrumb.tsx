import { Fragment } from 'react';

import { useNavigate } from 'react-router-dom';

type BreadcrumbProps = {
  breadcrumbs?: {
    name: string;
    path?: string;
  }[];
};

const Breadcrumb = ({ breadcrumbs }: BreadcrumbProps) => {
  const navigate = useNavigate();

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
                onClick={() => navigate(breadcrumb.path || '/')}
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

export default Breadcrumb;
