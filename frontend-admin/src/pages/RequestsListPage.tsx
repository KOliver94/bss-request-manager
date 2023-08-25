import RequestsDataTable from 'components/RequestsDataTable/RequestsDataTable';

const RequestsListPage = () => {
  return (
    <div className="p-3 sm:p-5 surface-ground">
      <div className="font-medium mb-3 text-900 text-xl">Felkérések</div>
      <div className="border-round p-3 shadow-2 sm:p-4 surface-card">
        <RequestsDataTable />
      </div>
    </div>
  );
};

export { RequestsListPage as Component };
