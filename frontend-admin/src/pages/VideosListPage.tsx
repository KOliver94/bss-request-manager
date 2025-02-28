import { useQuery } from '@tanstack/react-query';
import { classNames } from 'primereact/utils';
import { href, useParams } from 'react-router';

import { requestRetrieveQuery, requestVideosListQuery } from 'api/queries';
import LinkButton from 'components/LinkButton/LinkButton';
import VideosDataTable from 'components/VideosDataTable/VideosDataTable';
import useMobile from 'hooks/useMobile';
import { queryClient } from 'router';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function loader({ params }: any) {
  const query = requestVideosListQuery(Number(params.requestId));
  return (
    queryClient.getQueryData(query.queryKey) ??
    (await queryClient.fetchQuery(query))
  );
}

const VideosListPage = () => {
  const { requestId } = useParams();
  const { data } = useQuery(requestRetrieveQuery(Number(requestId)));
  const isMobile = useMobile();

  const videoDataHeader = (
    <div
      className={classNames(
        'align-items-center flex flex-wrap',
        isMobile ? 'justify-content-start' : ' justify-content-end',
      )}
    >
      <LinkButton
        buttonProps={{
          className: isMobile ? 'w-full' : '',
          icon: 'pi pi-plus',
          label: 'Új videó',
        }}
        linkProps={{
          className: isMobile ? 'w-full' : '',
          to: href('/requests/:requestId/videos/new', {
            requestId: data.id.toString(),
          }),
        }}
      />
    </div>
  );

  return (
    <div className="p-3 sm:p-5 surface-ground">
      <div className="font-medium mb-3 text-900 text-xl">
        {data.title} - Videók
      </div>
      <div className="border-round p-3 shadow-2 sm:p-4 surface-card">
        <VideosDataTable
          header={videoDataHeader}
          requestId={Number(requestId)}
        />
      </div>
    </div>
  );
};

export { VideosListPage as Component };
