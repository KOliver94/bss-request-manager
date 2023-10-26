import { useQuery } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';

import { requestRetrieveQuery, requestVideosListQuery } from 'api/queries';
import VideosDataTable from 'components/VideosDataTable/VideosDataTable';
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

  return (
    <div className="p-3 sm:p-5 surface-ground">
      <div className="font-medium mb-3 text-900 text-xl">
        {data?.title} - Videók
      </div>
      <div className="border-round p-3 shadow-2 sm:p-4 surface-card">
        <VideosDataTable requestId={Number(requestId)} />
      </div>
    </div>
  );
};

export { VideosListPage as Component };
