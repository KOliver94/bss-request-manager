import { useState } from 'react';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { isAxiosError } from 'axios';
import type { AutoCompleteChangeEvent } from 'primereact/autocomplete';
import { Button } from 'primereact/button';
import { Column } from 'primereact/column';
import type { ColumnEditorOptions, ColumnSortEvent } from 'primereact/column';
import { confirmDialog } from 'primereact/confirmdialog';
import { DataTable } from 'primereact/datatable';
import type { DataTableRowEditCompleteEvent } from 'primereact/datatable';
import { Ripple } from 'primereact/ripple';
import { classNames } from 'primereact/utils';

import { adminApi } from 'api/http';
import { CrewMemberAdminListRetrieve } from 'api/models';
import { requestCrewListQuery } from 'api/queries';
import AutoCompleteStaff from 'components/AutoCompleteStaff/AutoCompleteStaff';
import User from 'components/User/User';
import { getErrorMessage } from 'helpers/ErrorMessageProvider';
import useMobile from 'hooks/useMobile';
import { useToast } from 'providers/ToastProvider';

import AddCrewDialog from './AddCrewDialog';
import AutoCompleteCrewPosition from './AutoCompleteCrewPosition';

type CrewDataTableProps = {
  requestId: number;
};

const CrewDataTable = ({ requestId }: CrewDataTableProps) => {
  const isMobile = useMobile();
  const queryClient = useQueryClient();

  const { data } = useQuery(requestCrewListQuery(requestId));
  const { showToast } = useToast();

  const [addCrewDialogVisible, setAddCrewDialogVisible] =
    useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  const deleteActionBodyTemplate = ({
    member,
    id,
    position,
  }: CrewMemberAdminListRetrieve) => {
    return (
      <button
        className="p-link p-row-editor-init"
        disabled={loading}
        onClick={() => {
          onRowDelete(id, member, position);
        }}
        name="row-delete"
        type="button"
      >
        <span className="pi pi-fw p-row-editor-init-icon pi-trash"></span>
        <Ripple />
      </button>
    );
  };

  const handleDelete = async (id: number) => {
    setLoading(true);
    await adminApi
      .adminRequestsCrewDestroy(id, requestId)
      .then(async () => {
        await queryClient.invalidateQueries({
          queryKey: ['requests', requestId, 'crew'],
        });
      })
      .catch(async (error) => {
        if (isAxiosError(error) && error.response?.status === 404) {
          await queryClient.invalidateQueries({
            queryKey: ['requests', requestId, 'crew'],
          });
        }
        showToast({
          detail: getErrorMessage(error),
          life: 3000,
          severity: 'error',
          summary: 'Hiba',
        });
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const header = (
    <div
      className={classNames(
        'align-items-center flex flex-wrap',
        isMobile ? 'justify-content-start' : ' justify-content-end',
      )}
    >
      <Button
        className={isMobile ? 'w-full' : ''}
        icon="pi pi-plus"
        label="Új stábtag"
        onClick={() => {
          setAddCrewDialogVisible(true);
        }}
      />
    </div>
  );

  const memberBodyTemplate = ({ member }: CrewMemberAdminListRetrieve) => {
    return <User imageUrl={member.avatar_url} name={member.full_name} />;
  };

  const memberEditor = (options: ColumnEditorOptions) => {
    return (
      <AutoCompleteStaff
        className="w-full"
        disabled={loading}
        onChange={(e: AutoCompleteChangeEvent) =>
          options.editorCallback?.(e.value)
        }
        value={options.value}
      />
    );
  };

  const memberSortFunction = ({ data, order }: ColumnSortEvent) => {
    if (!order || Math.abs(order) !== 1) {
      return data;
    }

    data.sort(
      (a: CrewMemberAdminListRetrieve, b: CrewMemberAdminListRetrieve) => {
        const _a = a.member.full_name;
        const _b = b.member.full_name;
        return order === -1
          ? _b.localeCompare(_a, 'hu')
          : _a.localeCompare(_b, 'hu');
      },
    );

    return data;
  };

  const onRowDelete = (
    id: number,
    { full_name }: CrewMemberAdminListRetrieve['member'],
    position: string,
  ) => {
    confirmDialog({
      accept: () => handleDelete(id),
      acceptClassName: 'p-button-danger',
      breakpoints: { '768px': '95vw' },
      defaultFocus: 'reject',
      header: 'Biztosan törölni akarod a stábtagot?',
      icon: 'pi pi-exclamation-triangle',
      message: `"${full_name} - ${position}" visszavonhatatlanul törlés fog kerülni!`,
      style: { width: '50vw' },
    });
  };

  const onRowEditComplete = async (e: DataTableRowEditCompleteEvent) => {
    const { newData } = e;

    const { id, ...data } = newData as CrewMemberAdminListRetrieve;

    setLoading(true);
    await adminApi
      .adminRequestsCrewPartialUpdate(id, requestId, {
        ...data,
        member: data.member.id,
      })
      .then(async () => {
        await queryClient.invalidateQueries({
          queryKey: ['requests', requestId, 'crew'],
        });
      })
      .catch(async (error) => {
        if (isAxiosError(error) && error.response?.status === 404) {
          await queryClient.invalidateQueries({
            queryKey: ['requests', requestId, 'crew'],
          });
        }
        showToast({
          detail: getErrorMessage(error),
          life: 3000,
          severity: 'error',
          summary: 'Hiba',
        });
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const positionEditor = (options: ColumnEditorOptions) => {
    return (
      <AutoCompleteCrewPosition
        className="w-full"
        disabled={loading}
        onChange={(e: AutoCompleteChangeEvent) =>
          options.editorCallback?.(e.value)
        }
        value={options.value}
      />
    );
  };

  return (
    <>
      <DataTable
        dataKey="id"
        editMode="row"
        header={header}
        onRowEditComplete={onRowEditComplete}
        showGridlines
        sortField="member"
        sortOrder={1}
        stripedRows
        value={data}
      >
        <Column
          body={memberBodyTemplate}
          editor={(options) => memberEditor(options)}
          header="Név"
          field="member"
          sortable
          sortFunction={memberSortFunction}
          style={{ minWidth: '15rem', width: '40%' }}
        />
        <Column
          editor={(options) => positionEditor(options)}
          field="position"
          header="Pozíció"
          sortable
          style={{ minWidth: '15rem', width: '40%' }}
        />
        <Column
          bodyStyle={{ textAlign: 'center' }}
          headerStyle={{ minWidth: '8rem', width: '10%' }}
          rowEditor
        />
        <Column
          body={deleteActionBodyTemplate}
          bodyStyle={{ textAlign: 'center' }}
          headerStyle={{ minWidth: '4rem', width: '5%' }}
        />
      </DataTable>
      <AddCrewDialog
        onHide={() => {
          setAddCrewDialogVisible(false);
        }}
        requestId={requestId}
        visible={addCrewDialogVisible}
      />
    </>
  );
};

export default CrewDataTable;
