import { Dispatch, SetStateAction } from 'react';

import { Button } from 'primereact/button';
import { Calendar } from 'primereact/calendar';
import { Divider } from 'primereact/divider';
import { InputText } from 'primereact/inputtext';
import { MultiSelect } from 'primereact/multiselect';
import { Controller, useForm } from 'react-hook-form';

import { AdminRequestsListStatusEnum } from 'api/endpoints/admin-api';
import { adminApi } from 'api/http';
import { RequestAdminList } from 'api/models';
import { RequestStatusTag } from 'components/StatusTag/StatusTag';
import { REQUEST_STATUSES } from 'components/StatusTag/statusTagConsts';
import { SearchStatusDropdownType } from 'pages/SearchPage';

interface IRequesterSearchForm {
  start_datetime_after: Date | null;
  start_datetime_before: Date | null;
  status: SearchStatusDropdownType[] | null;
  title: string;
}

type RequestSearchFormProps = {
  setRequestSearchResults: Dispatch<SetStateAction<RequestAdminList[]>>;
};

const RequestSearchForm = ({
  setRequestSearchResults,
}: RequestSearchFormProps) => {
  const defaultValues = {
    start_datetime_after: null,
    start_datetime_before: null,
    status: null,
    title: '',
  };

  const requestStatuses = () => {
    const array: SearchStatusDropdownType[] = [];
    Object.keys(REQUEST_STATUSES).forEach((status_key) => {
      const status_num = Number(status_key);
      array.push({ ...REQUEST_STATUSES[status_num], status: status_num });
    });
    return array;
  };

  const { control, handleSubmit, reset } = useForm<IRequesterSearchForm>({
    defaultValues,
  });

  const statusTemplate = (option: SearchStatusDropdownType) => {
    return <RequestStatusTag statusNum={option.status} />;
  };

  const onSubmit = async (data: IRequesterSearchForm) => {
    const title = data.title || undefined;
    const start_datetime_after = data.start_datetime_after
      ? data.start_datetime_after.toISOString().split('T')[0]
      : undefined;
    const start_datetime_before = data.start_datetime_before
      ? data.start_datetime_before.toISOString().split('T')[0]
      : undefined;
    const status = data.status
      ? data.status.map(({ status }) => status)
      : undefined;

    await adminApi
      .adminRequestsList(
        undefined,
        undefined,
        undefined,
        undefined,
        10000,
        undefined,
        title,
        start_datetime_after,
        start_datetime_before,
        status as AdminRequestsListStatusEnum[],
      )
      .then((response) => {
        setRequestSearchResults(response.data.results || []);
      });
  };

  return (
    <form className="formgrid grid p-fluid" onSubmit={handleSubmit(onSubmit)}>
      <Controller
        control={control}
        name="title"
        render={({ field }) => (
          <div className="field col-12 mb-4 md:col-6">
            <label className="font-medium text-900" htmlFor={field.name}>
              Esemény neve
            </label>
            <InputText {...field} type="text" />
          </div>
        )}
      />
      <Controller
        control={control}
        name="status"
        render={({ field }) => (
          <div className="field col-12 mb-4 md:col-6">
            <label className="font-medium text-900" htmlFor={field.name}>
              Státusz
            </label>
            <MultiSelect
              {...field}
              display="chip"
              id={field.name}
              itemTemplate={statusTemplate}
              name="status"
              onChange={(e) => field.onChange(e.value)}
              optionLabel="text"
              options={requestStatuses()}
              value={field.value}
            />
          </div>
        )}
      />
      <Controller
        control={control}
        name="start_datetime_after"
        render={({ field }) => (
          <div className="field col-12 mb-4 md:col-6 md:mb-0">
            <label className="font-medium text-900" htmlFor={field.name}>
              Kezdés időpontja későbbi mint
            </label>
            <Calendar {...field} mask="9999.99.99" showButtonBar showIcon />
          </div>
        )}
      />
      <Controller
        control={control}
        name="start_datetime_before"
        render={({ field }) => (
          <div className="field col-12 mb-0 md:col-6">
            <label className="font-medium text-900" htmlFor={field.name}>
              Kezdés időpontja korábbi mint
            </label>
            <Calendar {...field} mask="9999.99.99" showButtonBar showIcon />
          </div>
        )}
      />
      <Divider />
      <div className="col-12 flex flex-no-wrap justify-content-start md:col-4">
        <Button
          autoFocus
          className="mr-1"
          icon="pi pi-search"
          label="Keresés"
          type="submit"
        />
        <Button
          className="p-button-secondary p-button-text"
          icon="pi pi-refresh"
          label="Visszaállítás"
          onClick={() => {
            reset();
            setRequestSearchResults([]);
          }}
          type="reset"
        />
      </div>
    </form>
  );
};

export default RequestSearchForm;
