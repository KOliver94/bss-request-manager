import { forwardRef } from 'react';

import { Column, ColumnFilterElementTemplateOptions } from 'primereact/column';
import {
  DataTable,
  DataTableProps,
  DataTableValueArray,
} from 'primereact/datatable';
import { TriStateCheckbox } from 'primereact/tristatecheckbox';

import LinkButton from 'components/LinkButton/LinkButton';
import User from 'components/User/User';

import stylesModule from './UsersDataTable.module.css';

export type UsersDataType = {
  email: string;
  full_name: string;
  id: number;
  is_staff: boolean;
  profile: {
    avatar_url: string;
    phone_number: string;
  };
};

const UsersDataTable = forwardRef<
  React.Ref<HTMLTableElement>,
  DataTableProps<DataTableValueArray>
>((props, ref) => {
  const isStaffBodyTemplate = ({ is_staff }: UsersDataType) => {
    return (
      <i
        className={
          is_staff
            ? 'true-icon pi pi-check-circle text-green-500'
            : 'false-icon pi pi-times-circle text-pink-500'
        }
      ></i>
    );
  };

  const fullNameBodyTemplate = ({ full_name, profile }: UsersDataType) => {
    return <User imageUrl={profile.avatar_url} name={full_name} />;
  };

  const actionBodyTemplate = ({ id }: UsersDataType) => {
    return (
      <LinkButton
        buttonProps={{
          'aria-label': 'Ugrás a profilra',
          className: 'p-button-info p-button-outlined',
          icon: 'pi pi-id-card',
        }}
        linkProps={{ to: `/users/${id}` }}
      />
    );
  };

  const isStaffFilterTemplate = (
    options: ColumnFilterElementTemplateOptions
  ) => {
    function getLabel(value: boolean | null | undefined): string {
      if (value !== null) {
        if (value) return 'BSS tag';
        return 'Nem BSS tag';
      }
      return 'Bármelyik';
    }

    return (
      <div className="field-checkbox m-0">
        <TriStateCheckbox
          onChange={(e) => options.filterCallback(e.value)}
          value={options.value}
        />
        <label>{getLabel(options.value)}</label>
      </div>
    );
  };

  return (
    <DataTable
      dataKey="id"
      emptyMessage="Nem található felhasználó."
      paginator
      rows={25}
      rowsPerPageOptions={[10, 25, 50, 100]}
      showGridlines
      sortField="full_name"
      sortOrder={1}
      stripedRows
      value={[]}
      {...props}
      {...ref}
    >
      <Column
        body={fullNameBodyTemplate}
        field="full_name"
        filter
        filterMatchMode="contains"
        header="Név"
        sortable
      />
      <Column
        field="email"
        filter
        filterMatchMode="contains"
        header="E-mail"
        sortable
      />
      <Column
        field="profile.phone_number"
        filter
        filterMatchMode="contains"
        header="Telefonszám"
        sortable
      />
      <Column
        body={isStaffBodyTemplate}
        bodyClassName="text-center"
        dataType="boolean"
        field="is_staff"
        filter
        filterElement={isStaffFilterTemplate}
        filterMatchMode="equals"
        filterMenuClassName={stylesModule.isStaffFilter}
        header="BSS tag"
        showFilterMenuOptions={false}
        showFilterOperator={false}
        sortable
        style={{ minWidth: '8rem' }}
      />
      <Column
        body={actionBodyTemplate}
        bodyStyle={{ overflow: 'visible', textAlign: 'center' }}
        headerStyle={{ textAlign: 'center', width: '4rem' }}
      />
    </DataTable>
  );
});
UsersDataTable.displayName = 'UsersDataTable';

export default UsersDataTable;
