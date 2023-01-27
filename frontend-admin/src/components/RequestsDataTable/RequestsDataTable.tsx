import { forwardRef, lazy, Suspense, useState } from 'react';

import { Badge } from 'primereact/badge';
import { Button } from 'primereact/button';
import { Column } from 'primereact/column';
import {
  DataTable,
  DataTableExpandedRows,
  DataTableProps,
} from 'primereact/datatable';
import { ProgressBar } from 'primereact/progressbar';
import { Skeleton } from 'primereact/skeleton';
import { useNavigate } from 'react-router-dom';

import Avatar from 'components/Avatar/Avatar';
import { RequestStatusTag } from 'components/StatusTag/StatusTag';
import { UsersDataType } from 'components/UsersDataTable/UsersDataTable';
import { dateTimeToLocaleString } from 'helpers/DateToLocaleStringCoverters';
import useMobile from 'hooks/useMobile';

const AvatarGroupCrew = lazy(
  () => import('components/AvatarGroupCrew/AvatarGroupCrew')
);
const VideosDataTable = lazy(
  () => import('components/VideosDataTable/VideosDataTable')
);

export type RequestDataType = {
  created: Date;
  crew?: {
    full_name: string;
    avatar_url: string | null;
  }[];
  end_datetime: Date;
  id: number;
  start_datetime: Date;
  status: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 9 | 10;
  status_by_admin?: boolean;
  responsible?: UsersDataType;
  title: string;
  videos: number;
};

type RequestDataList = [RequestDataType];

const RequestsDataTable = forwardRef<
  React.Ref<HTMLTableElement>,
  DataTableProps
>((props, ref) => {
  const isMobile = useMobile();
  const navigate = useNavigate();

  const [expandedRows, setExpandedRows] = useState<DataTableExpandedRows>({});

  const getRequests = (data: RequestDataList) => {
    return [...(data || [])].map((d) => {
      d.created = new Date(d.created);
      d.end_datetime = new Date(d.end_datetime);
      d.start_datetime = new Date(d.start_datetime);
      return d;
    });
  };

  const crewBodyTemplate = ({ crew }: RequestDataType) => {
    return (
      crew && (
        <Suspense fallback={<Skeleton />}>
          <AvatarGroupCrew className="justify-content-center" crew={crew} />
        </Suspense>
      )
    );
  };

  const dateBodyTemplate = ({ start_datetime }: RequestDataType) => {
    return dateTimeToLocaleString(start_datetime, isMobile);
  };

  const responsibleBodyTemplate = ({ responsible }: RequestDataType) => {
    return (
      responsible && (
        <div className="align-items-center flex justify-content-center">
          <Avatar
            className="mr-2"
            image={responsible.profile.avatar_url || undefined}
          />
          <div>{responsible.full_name}</div>
        </div>
      )
    );
  };

  const statusBodyTemplate = ({ status, status_by_admin }: RequestDataType) => {
    return <RequestStatusTag modified={status_by_admin} statusNum={status} />;
  };

  const titleBodyTemplate = ({ created, title }: RequestDataType) => {
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

  const actionBodyTemplate = ({ id }: RequestDataType) => {
    return (
      <Button
        aria-label="Ugrás a felkéréshez"
        className="p-button-info p-button-outlined"
        icon="pi pi-sign-in"
        onClick={() => navigate(`/requests/${id}`)}
        type="button"
      />
    );
  };

  const rowExpansionTemplate = ({ id, videos }: RequestDataType) => {
    return (
      videos && (
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
      onRowToggle={(e: { data: DataTableExpandedRows }) =>
        setExpandedRows(e.data)
      }
      paginator
      responsiveLayout="scroll"
      rowExpansionTemplate={rowExpansionTemplate}
      rows={25}
      rowsPerPageOptions={[10, 25, 50, 100]}
      showGridlines
      sortField="start_datetime"
      sortOrder={-1}
      stripedRows
      value={[]}
      {...props}
      {...ref}
    >
      <Column
        expander={(rowData) => rowData.videos > 0}
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
