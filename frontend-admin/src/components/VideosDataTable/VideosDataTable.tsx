import { forwardRef } from 'react';

import { Button } from 'primereact/button';
import { Column } from 'primereact/column';
import { DataTable, DataTableProps } from 'primereact/datatable';
import { Rating } from 'primereact/rating';
import { useNavigate } from 'react-router-dom';

import Avatar from 'components/Avatar/Avatar';
import { VideoStatusTag } from 'components/StatusTag/StatusTag';
import { UsersDataType } from 'components/UsersDataTable/UsersDataTable';

export type VideoDataType = {
  avg_rating: number;
  editor: UsersDataType;
  id: number;
  status: 1 | 2 | 3 | 4 | 5 | 6;
  status_by_admin: boolean;
  title: string;
};

interface VideosDataTableProps extends DataTableProps {
  requestId: number;
}

const VideosDataTable = forwardRef<
  React.Ref<HTMLTableElement>,
  VideosDataTableProps
>(({ requestId, ...props }, ref) => {
  const navigate = useNavigate();

  const editorBodyTemplate = ({ editor }: VideoDataType) => {
    return (
      editor && (
        <div className="align-items-center flex justify-content-center">
          <Avatar
            className="mr-2"
            image={editor.profile.avatar_url || undefined}
          />
          <div>{editor.full_name}</div>
        </div>
      )
    );
  };

  const statusBodyTemplate = ({ status, status_by_admin }: VideoDataType) => {
    return <VideoStatusTag modified={status_by_admin} statusNum={status} />;
  };

  const ratingBodyTemplate = ({ avg_rating }: VideoDataType) => {
    return (
      <Rating
        cancel={false}
        className="justify-content-center"
        tooltip={`${avg_rating || 'Nincs értékelés'}`}
        tooltipOptions={{ className: 'text-xs', position: 'bottom' }}
        readOnly
        value={Math.round(avg_rating)}
      />
    );
  };

  const actionBodyTemplate = ({ id }: VideoDataType) => {
    return (
      <div>
        <Button
          aria-label="Értékelés"
          className="mr-2 p-button-info p-button-outlined"
          icon="pi pi-star"
        />
        <Button
          aria-label="Ugrás a videóhoz"
          className="p-button-info p-button-outlined"
          icon="pi pi-sign-in"
          onClick={() => navigate(`/requests/${requestId}/videos/${id}`)}
          type="button"
        />
      </div>
    );
  };

  return (
    <DataTable
      dataKey="id"
      emptyMessage="Nem található videó."
      responsiveLayout="scroll"
      showGridlines
      sortField="title"
      sortOrder={1}
      stripedRows
      value={[]}
      {...props}
      {...ref}
    >
      <Column field="title" header="Videó címe" sortable />
      <Column
        align="center"
        body={statusBodyTemplate}
        field="status"
        header="Státusz"
        sortable
      />
      <Column
        alignHeader="center"
        body={editorBodyTemplate}
        field="editor"
        header="Vágó"
        sortable
        sortField="editor.full_name"
      />
      <Column
        alignHeader="center"
        body={ratingBodyTemplate}
        field="avg_rating"
        header="Értékelések"
        sortable
      />
      <Column
        body={actionBodyTemplate}
        bodyStyle={{ overflow: 'visible', textAlign: 'center' }}
        headerStyle={{ textAlign: 'center', width: '9rem' }}
      />
    </DataTable>
  );
});
VideosDataTable.displayName = 'VideosDataTable';

export default VideosDataTable;
