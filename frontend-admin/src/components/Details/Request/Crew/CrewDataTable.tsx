import { useState } from 'react';

import { AutoCompleteChangeEvent } from 'primereact/autocomplete';
import { Button } from 'primereact/button';
import {
  Column,
  ColumnEditorOptions,
  ColumnSortEvent,
} from 'primereact/column';
import { confirmDialog } from 'primereact/confirmdialog';
import { DataTable, DataTableRowEditCompleteEvent } from 'primereact/datatable';
import { Ripple } from 'primereact/ripple';
import { classNames } from 'primereact/utils';

import AutoCompleteStaff from 'components/AutoCompleteStaff/AutoCompleteStaff';
import User from 'components/User/User';
import useMobile from 'hooks/useMobile';

import AddCrewDialog from './AddCrewDialog';
import AutoCompleteCrewPosition from './AutoCompleteCrewPosition';

type CrewDataType = {
  member: {
    full_name: string;
    avatar_url: string;
  };
  id: number;
  position: string;
};

type CrewDataTableProps = {
  requestId: number;
};

const CrewDataTable = ({ requestId }: CrewDataTableProps) => {
  const [addCrewDialogVisible, setAddCrewDialogVisible] =
    useState<boolean>(false);
  const [data, setData] = useState<CrewDataType[]>([
    { id: 1, member: { avatar_url: '', full_name: 'Test' }, position: 'Test' },
  ]);
  const [loading, setLoading] = useState<boolean>(false);
  const isMobile = useMobile();

  const deleteActionBodyTemplate = ({ member, id, position }: CrewDataType) => {
    return (
      <button
        className="p-link p-row-editor-init"
        disabled={loading}
        onClick={() => onRowDelete(id, member, position)}
        name="row-delete"
        type="button"
      >
        <span className="pi pi-fw p-row-editor-init-icon pi-trash"></span>
        <Ripple />
      </button>
    );
  };

  const handleDelete = (id: number) => {
    setLoading(true);
    console.log('Deleting crew member... ' + id);

    // TODO: Use real API call
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  };

  const header = (
    <div
      className={classNames(
        'align-items-center flex flex-wrap',
        isMobile ? 'justify-content-start' : ' justify-content-end'
      )}
    >
      <Button
        className={isMobile ? 'w-full' : ''}
        icon="pi pi-plus"
        label="Új stábtag"
        onClick={() => setAddCrewDialogVisible(true)}
      />
    </div>
  );

  const memberBodyTemplate = ({ member }: CrewDataType) => {
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

    data.sort((a: CrewDataType, b: CrewDataType) => {
      const _a = a.member.full_name;
      const _b = b.member.full_name;
      return order === -1
        ? _b.localeCompare(_a, 'hu')
        : _a.localeCompare(_b, 'hu');
    });

    return data;
  };

  const onRowDelete = (
    id: number,
    { full_name }: CrewDataType['member'],
    position: string
  ) => {
    confirmDialog({
      accept: () => handleDelete(id),
      acceptClassName: 'p-button-danger',
      header: 'Biztosan törölni akarod a stábtagot?',
      icon: 'pi pi-exclamation-triangle',
      message: `"${full_name} - ${position}" visszavonhatatlanul törlés fog kerülni!`,
      style: { width: isMobile ? '95vw' : '50vw' },
    });
  };

  const onRowEditComplete = (e: DataTableRowEditCompleteEvent) => {
    const _data = [...data];
    const { newData, index } = e;

    _data[index] = newData as CrewDataType;

    setData(_data);
    // TODO: Add API call
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
        onHide={() => setAddCrewDialogVisible(false)}
        requestId={requestId}
        visible={addCrewDialogVisible}
      />
    </>
  );
};

export default CrewDataTable;
