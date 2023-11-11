import { useState } from 'react';

import { Dropdown, DropdownChangeEvent } from 'primereact/dropdown';

import { requestsListQuery } from 'api/queries';
import RequestsDataTable from 'components/RequestsDataTable/RequestsDataTable';
import {
  Semester,
  getLatestSemester,
  getSemesters,
} from 'helpers/SemesterHelper';
import { queryClient } from 'router';

export async function loader() {
  const query = requestsListQuery(getLatestSemester());
  return (
    queryClient.getQueryData(query.queryKey) ??
    (await queryClient.fetchQuery(query))
  );
}

const RequestsListPage = () => {
  const [selectedSemester, setSelectedSemester] = useState<Semester | null>(
    getLatestSemester(),
  );

  return (
    <div className="p-3 sm:p-5 surface-ground">
      <div className="align-items-center flex font-medium mb-3 text-900 text-xl">
        <div>Felkérések</div>
        <Dropdown
          className="ml-2"
          filter
          onChange={(e: DropdownChangeEvent) => setSelectedSemester(e.value)}
          options={getSemesters()}
          optionLabel="name"
          placeholder="Félév választás"
          showClear
          value={selectedSemester}
        />
      </div>
      <div className="border-round p-3 shadow-2 sm:p-4 surface-card">
        <RequestsDataTable semester={selectedSemester} />
      </div>
    </div>
  );
};

export { RequestsListPage as Component };
