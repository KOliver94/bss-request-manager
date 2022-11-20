import { ChangeEvent, useEffect, useState } from 'react';

import { FilterMatchMode, FilterOperator } from 'primereact/api';
import { Button } from 'primereact/button';
import {
  DataTableFilterMetaData,
  DataTableOperatorFilterMetaData,
} from 'primereact/datatable';
import { InputText } from 'primereact/inputtext';

import UsersDataTable from 'components/UsersDataTable/UsersDataTable';

const UsersListPage = () => {
  const [filters, setFilters] = useState<{
    global: DataTableFilterMetaData;
    [key: string]: DataTableFilterMetaData | DataTableOperatorFilterMetaData;
  }>({ global: { matchMode: FilterMatchMode.CONTAINS, value: null } });
  const [globalFilterValue, setGlobalFilterValue] = useState<string>('');

  const clearFilter = () => {
    initFilters();
  };

  const initFilters = () => {
    setFilters({
      email: {
        constraints: [{ matchMode: FilterMatchMode.CONTAINS, value: null }],
        operator: FilterOperator.AND,
      },
      full_name: {
        constraints: [{ matchMode: FilterMatchMode.CONTAINS, value: null }],
        operator: FilterOperator.AND,
      },
      global: { matchMode: FilterMatchMode.CONTAINS, value: null },
      is_staff: { matchMode: FilterMatchMode.EQUALS, value: null },
      'profile.phone_number': {
        constraints: [{ matchMode: FilterMatchMode.CONTAINS, value: null }],
        operator: FilterOperator.AND,
      },
    });
    setGlobalFilterValue('');
  };

  const onGlobalFilterChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const _filters = { ...filters };
    _filters['global'].value = value;

    setFilters(_filters);
    setGlobalFilterValue(value);
  };

  const renderHeader = () => {
    return (
      <div className="align-items-center flex justify-content-between">
        <Button
          type="button"
          icon="pi pi-filter-slash"
          label="Törlés"
          className="p-button-outlined"
          onClick={clearFilter}
        />
        <span className="p-input-icon-left">
          <i className="pi pi-search" />
          <InputText
            onChange={onGlobalFilterChange}
            placeholder="Keresés"
            value={globalFilterValue}
          />
        </span>
      </div>
    );
  };

  useEffect(() => {
    initFilters();
  }, []);

  return (
    <div className="p-3 sm:p-5 surface-ground">
      <div className="font-medium mb-3 text-900 text-xl">Felhasználók</div>
      <div className="border-round p-3 shadow-2 sm:p-4 surface-card">
        <UsersDataTable
          filters={filters}
          globalFilterFields={['full_name', 'email', 'profile.phone_number']}
          header={renderHeader()}
        />
      </div>
    </div>
  );
};

export default UsersListPage;
