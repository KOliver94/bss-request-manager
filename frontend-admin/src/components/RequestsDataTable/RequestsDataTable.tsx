import { forwardRef, lazy, Suspense, useState } from 'react';

import { DefinedUseQueryResult, useQuery } from '@tanstack/react-query';
import { Badge } from 'primereact/badge';
import { Column } from 'primereact/column';
import {
  DataTable,
  DataTableExpandedRows,
  DataTableProps,
  DataTableValueArray,
} from 'primereact/datatable';
import { ProgressBar } from 'primereact/progressbar';
import { Skeleton } from 'primereact/skeleton';

import { RequestAdminList } from 'api/models';
import { requestsListQuery } from 'api/queries';
import LinkButton from 'components/LinkButton/LinkButton';
import { RequestStatusTag } from 'components/StatusTag/StatusTag';
import User from 'components/User/User';
import { dateTimeToLocaleString } from 'helpers/DateToLocaleStringCoverters';
import useMobile from 'hooks/useMobile';

const AvatarGroupCrew = lazy(() => import('components/Avatar/AvatarGroupCrew'));
const VideosDataTable = lazy(
  () => import('components/VideosDataTable/VideosDataTable'),
);

interface RequestAdminListDates // TODO: Rename?
  extends Omit<RequestAdminList, 'created' | 'start_datetime'> {
  created: Date;
  start_datetime: Date;
}

const RequestsDataTable = forwardRef<
  React.Ref<HTMLTableElement>,
  DataTableProps<DataTableValueArray>
>((props, ref) => {
  const getRequests = ({
    data: requests,
  }: DefinedUseQueryResult<RequestAdminList[]>): RequestAdminListDates[] => {
    return [...(requests || [])].map((request) => {
      return {
        ...request,
        created: new Date(request.created),
        start_datetime: new Date(request.start_datetime),
      };
    });
  };
  const data = getRequests(useQuery(requestsListQuery()));
  const isMobile = useMobile();

  const [expandedRows, setExpandedRows] = useState<DataTableExpandedRows>({});

  const crewBodyTemplate = ({ crew }: RequestAdminListDates) => {
    return (
      crew && (
        <Suspense fallback={<Skeleton />}>
          <AvatarGroupCrew className="justify-content-center" crew={crew} />
        </Suspense>
      )
    );
  };

  const dateBodyTemplate = ({ start_datetime }: RequestAdminListDates) => {
    return dateTimeToLocaleString(start_datetime, isMobile);
  };

  const responsibleBodyTemplate = ({ responsible }: RequestAdminListDates) => {
    return (
      responsible && (
        <User
          className="justify-content-center"
          imageUrl={responsible.avatar_url}
          name={responsible.full_name}
        />
      )
    );
  };

  const statusBodyTemplate = ({
    status,
    status_by_admin,
  }: RequestAdminListDates) => {
    return <RequestStatusTag modified={status_by_admin} statusNum={status} />;
  };

  const titleBodyTemplate = ({ created, title }: RequestAdminListDates) => {
    const twoWeeksEarlier = new Date();
    twoWeeksEarlier.setDate(new Date().getDate() - 2 * 7);

    return (
      <div className="align-items-center flex">
        <div className="hyphenate p-overlay-badge">
          {title}
          {created >= twoWeeksEarlier && (
            <Badge className="p-badge-new-request" severity="info"></Badge>
          )}
        </div>
      </div>
    );
  };

  const actionBodyTemplate = ({ id }: RequestAdminListDates) => {
    return (
      <LinkButton
        buttonProps={{
          'aria-label': 'Ugrás a felkéréshez',
          className: 'p-button-info p-button-outlined',
          icon: 'pi pi-sign-in',
        }}
        linkProps={{ to: `/requests/${id}` }}
      />
    );
  };

  const rowExpansionTemplate = ({ id, video_count }: RequestAdminListDates) => {
    return (
      video_count && (
        <Suspense fallback={<ProgressBar mode="indeterminate" />}>
          <VideosDataTable requestId={id} />
        </Suspense>
      )
    );
  };

  return (
    <DataTable
      dataKey="id"
      emptyMessage="Nem található felkérés."
      expandedRows={expandedRows}
      onRowToggle={(e: { data: DataTableExpandedRows }) => {
        setExpandedRows(e.data);
      }}
      paginator
      rowExpansionTemplate={rowExpansionTemplate}
      rows={25}
      rowsPerPageOptions={[10, 25, 50, 100]}
      showGridlines
      sortField="start_datetime"
      sortOrder={-1}
      stripedRows
      value={data}
      {...props}
      {...ref}
    >
      <Column
        expander={(rowData: RequestAdminListDates) => rowData.video_count > 0}
        style={{ width: '3em' }}
      />
      <Column
        body={titleBodyTemplate}
        field="title"
        header="Esemény neve"
        sortable
      />
      <Column
        align="center"
        body={statusBodyTemplate}
        field="status"
        header="Státusz"
        sortable
      />
      <Column
        align="center"
        body={dateBodyTemplate}
        dataType="date"
        field="start_datetime"
        header="Kezdés ideje"
        sortable
        style={{ whiteSpace: 'nowrap' }}
      />
      <Column
        alignHeader="center"
        body={responsibleBodyTemplate}
        field="responsible"
        header="Felelős"
        sortable
        sortField="responsible.full_name"
      />
      <Column
        alignHeader="center"
        body={crewBodyTemplate}
        field="crew"
        header="Stáb"
      />
      <Column
        body={actionBodyTemplate}
        bodyStyle={{ overflow: 'visible', textAlign: 'center' }}
        headerStyle={{ textAlign: 'center', width: '4rem' }}
      />
    </DataTable>
  );
});
RequestsDataTable.displayName = 'RequestsDataTable';

export default RequestsDataTable;
