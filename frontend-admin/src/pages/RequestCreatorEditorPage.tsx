import { Suspense, lazy, useEffect, useState } from 'react';

import { useMutation, useQuery } from '@tanstack/react-query';
import { Calendar } from 'primereact/calendar';
import { Checkbox } from 'primereact/checkbox';
import { Divider } from 'primereact/divider';
import { Dropdown } from 'primereact/dropdown';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { Message } from 'primereact/message';
import { ProgressBar } from 'primereact/progressbar';
import { SelectButton } from 'primereact/selectbutton';
import { SplitButton } from 'primereact/splitbutton';
import { IconType } from 'primereact/utils';
import { Controller, SubmitHandler, useForm } from 'react-hook-form';
import {
  useLoaderData,
  useNavigate,
  useParams,
  useRevalidator,
} from 'react-router-dom';

import { RequestAdminRetrieve, UserNestedDetail } from 'api/models';
import { requestCreateMutation, requestUpdateMutation } from 'api/mutations';
import { requestRetrieveQuery } from 'api/queries';
import AutoCompleteStaff from 'components/AutoCompleteStaff/AutoCompleteStaff';
import FormField from 'components/FormField/FormField';
import LastUpdatedAt from 'components/LastUpdatedAt/LastUpdatedAt';
import { getName } from 'helpers/LocalStorageHelper';
import useMobile from 'hooks/useMobile';
import { useToast } from 'providers/ToastProvider';
import { queryClient } from 'router';

const NewRequesterForm = lazy(
  () => import('components/RequestCreator/NewRequesterForm'),
);
const UsersDataTable = lazy(
  () => import('components/UsersDataTable/UsersDataTable'),
);

export interface IRequestCreator {
  comment: string;
  createMore: boolean;
  deadline: Date | null;
  end_datetime: Date | null;
  place: string;
  responsible: UserNestedDetail | null;
  requester: UserNestedDetail | null;
  requester_email: string;
  requester_first_name: string;
  requester_last_name: string;
  requester_mobile: string;
  requesterType: string;
  send_notification: boolean;
  start_datetime: Date | null;
  title: string;
  type: string;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function loader({ params }: any) {
  if (params.requestId) {
    const query = requestRetrieveQuery(Number(params.requestId));
    return (
      queryClient.getQueryData(query.queryKey) ??
      (await queryClient.fetchQuery(query))
    );
  }
  return null;
}

const RequestCreatorEditorPage = () => {
  const defaultValues = {
    comment: '',
    createMore: false,
    deadline: null,
    end_datetime: null,
    place: '',
    requester: null,
    requester_email: '',
    requester_first_name: '',
    requester_last_name: '',
    requester_mobile: '',
    requesterType: 'self',
    responsible: null,
    send_notification: false,
    start_datetime: null,
    title: '',
    type: '',
  };

  const { control, handleSubmit, reset, setError, setValue, watch } =
    useForm<IRequestCreator>({
      defaultValues,
      mode: 'onChange',
    });
  const { requestId } = useParams();
  const { showToast } = useToast();
  const { isPending, mutateAsync } = useMutation(
    requestId
      ? requestUpdateMutation(Number(requestId))
      : requestCreateMutation(),
  );
  const { data: queryData, dataUpdatedAt } = requestId
    ? useQuery({
        ...requestRetrieveQuery(Number(requestId)),
        refetchInterval: 1000 * 30,
      })
    : { data: undefined, dataUpdatedAt: new Date() };

  const [isDataChanged, setIsDataChanged] = useState<boolean>(false);

  const isMobile = useMobile();
  const loaderData = useLoaderData() as RequestAdminRetrieve;
  const navigate = useNavigate();
  const revalidator = useRevalidator();

  const watchCreateMore = watch('createMore');
  const watchRequesterType = watch('requesterType');

  useEffect(() => {
    if (loaderData) {
      setIsDataChanged(false);
      reset({
        ...defaultValues,
        ...loaderData,
        deadline: new Date(loaderData.deadline),
        end_datetime: new Date(loaderData.end_datetime),
        start_datetime: new Date(loaderData.start_datetime),
      });
    }
  }, [loaderData]);

  useEffect(() => {
    if (requestId && loaderData !== queryData) {
      setIsDataChanged(true);
    }
  }, [queryData]);

  const buttonOptions = [
    {
      command: () => {
        setValue('send_notification', true);
        handleSubmit(onSubmit)();
      },
      icon: 'pi pi-bell',
      label: 'Mentés értesítéssel',
    },
    {
      command: () => reset(),
      icon: 'pi pi-replay',
      label: 'Visszaállítás',
    },
  ];

  const requesterTypeOptions = [
    {
      icon: 'pi pi-user',
      text: loaderData ? loaderData.requester.full_name : getName(),
      value: 'self',
    },
    { icon: 'pi pi-search', text: 'Felhasználó keresése', value: 'search' },
    { icon: 'pi pi-plus', text: 'Új felhasználó hozzáadása', value: 'new' },
  ];

  const typeOptions = [
    'Zenés hangulatvideó',
    'Zenés hangulatvideó riportokkal',
    'Promóciós videó',
    'Élő közvetítés',
    'Előadás/rendezvény dokumentálás jellegű rögzítése',
  ];

  const requesterTypeOptionTemplate = (option: {
    icon: IconType<IRequestCreator>;
    text: string;
  }) => {
    return (
      <>
        <i className={`${option.icon} pr-2 `}></i>
        <span className="p-button-label p-c">{option.text}</span>
      </>
    );
  };

  const onReload = () => {
    revalidator.revalidate();
  };

  const onSubmit: SubmitHandler<IRequestCreator> = async (data) => {
    if (!data.start_datetime || !data.end_datetime) return;

    let requester = {};
    if (data.requesterType == 'search') {
      if (!data.requester) {
        showToast({
          detail: 'Nincs kijelölve felkérő',
          life: 3000,
          severity: 'error',
          summary: 'Hiba',
        });
        return;
      }
      requester = {
        requester: data.requester?.id,
      };
    } else if (data.requesterType == 'new') {
      requester = {
        requester_email: data.requester_email,
        requester_first_name: data.requester_first_name,
        requester_last_name: data.requester_last_name,
        requester_mobile: data.requester_mobile,
      };
    }

    let deadline = undefined;
    if (data.deadline) {
      const offset = data.deadline.getTimezoneOffset();
      deadline = new Date(data.deadline.getTime() - offset * 60 * 1000);
      deadline = deadline.toISOString().split('T')[0];
    }

    await mutateAsync({
      ...requester,
      comment: data.comment || undefined,
      deadline: deadline,
      end_datetime: data.end_datetime.toISOString(),
      place: data.place,
      responsible: data.responsible?.id || null,
      send_notification: data.send_notification,
      start_datetime: data.start_datetime.toISOString(),
      title: data.title,
      type: data.type,
    })
      .then(async (response) => {
        showToast({
          detail: `Felkérés ${requestId ? 'módosítva' : 'létrehozva'}`,
          life: 3000,
          severity: 'success',
          summary: 'Siker',
        });

        if (requestId) {
          await queryClient.invalidateQueries({
            queryKey: ['requests', Number(requestId)],
          });
        } else {
          await queryClient.invalidateQueries({ queryKey: ['requests'] });
        }

        if (watchCreateMore) {
          reset();
        } else {
          navigate('/requests/' + response.data.id);
        }
      })
      .catch((error) => {
        if (error?.response?.status === 400) {
          for (const [key, value] of Object.entries(error?.response?.data)) {
            // @ts-expect-error: Correct types will be sent in the API error response
            setError(key, { message: value, type: 'backend' });
          }
        } else {
          showToast({
            detail: error?.message,
            life: 3000,
            severity: 'error',
            summary: 'Hiba',
          });
        }
      })
      .finally(() => setValue('send_notification', false));
  };

  return (
    <div className="p-3 sm:p-5 surface-ground">
      <div className="font-medium mb-3 text-900 text-xl">
        Felkérés létrehozása
      </div>
      <form className="border-round p-3 p-fluid shadow-2 sm:p-4 surface-card">
        <div className="formgrid grid p-fluid">
          {isDataChanged && (
            <Message
              className="mb-4 w-full"
              severity="warn"
              text={
                <>
                  Változás történt az adatokban.{' '}
                  <a
                    className="cursor-pointer hover:dashed underline"
                    onClick={onReload}
                  >
                    Újratöltés
                  </a>
                </>
              }
            />
          )}
          <FormField
            className="col-12 mb-4"
            control={control}
            label="Esemény neve"
            name="title"
            rules={{
              maxLength: 200,
              required: true,
              validate: (value) => {
                return !!value.trim();
              },
            }}
          >
            <InputText autoFocus disabled={isPending} type="text" />
          </FormField>
          <FormField
            className="col-12 mb-4 md:col-6"
            control={control}
            label="Kezdés időpontja"
            name="start_datetime"
            rules={{ required: true }}
          >
            <Calendar
              dateFormat="yy.mm.dd"
              disabled={isPending}
              mask="9999.99.99 99:99"
              showButtonBar
              showIcon
              showOnFocus={false}
              showTime
            />
          </FormField>
          <FormField
            className="col-12 mb-4 md:col-6"
            control={control}
            label="Befejezés időpontja"
            name="end_datetime"
            rules={{ required: true }}
          >
            <Calendar
              dateFormat="yy.mm.dd"
              disabled={isPending}
              mask="9999.99.99 99:99"
              showButtonBar
              showIcon
              showOnFocus={false}
              showTime
            />
          </FormField>
          <FormField
            className="col-12 mb-4 md:col-6 md:mb-0"
            control={control}
            icon="pi-map-marker"
            label="Helyszín"
            name="place"
            rules={{
              maxLength: 150,
              required: true,
              validate: (value) => {
                return !!value.trim();
              },
            }}
          >
            <InputText disabled={isPending} type="text" />
          </FormField>
          <FormField
            className="col-12 mb-0 md:col-6"
            control={control}
            label="Típus"
            name="type"
            rules={{
              maxLength: 50,
              required: true,
              validate: (value) => {
                return !!value.trim();
              },
            }}
          >
            <Dropdown disabled={isPending} editable options={typeOptions} />
          </FormField>
          <Divider align="center" type="dashed">
            <b>Opcionális mezők</b>
          </Divider>
          {!requestId && (
            <>
              <FormField
                className="col-12 mb-0"
                control={control}
                label="Megjegyzések"
                name="comment"
              >
                <InputTextarea
                  autoResize
                  disabled={isPending}
                  rows={isMobile ? 5 : 8}
                />
              </FormField>
              <Divider type="dashed" />
            </>
          )}
          <FormField
            className="col-12 mb-4 md:col-6 md:mb-0"
            control={control}
            label="Felelős"
            name="responsible"
          >
            <AutoCompleteStaff disabled={isPending} />
          </FormField>
          <FormField
            className="col-12 mb-0 md:col-6"
            control={control}
            label="Határidő"
            name="deadline"
          >
            <Calendar
              dateFormat="yy.mm.dd"
              disabled={isPending}
              mask="9999.99.99."
              placeholder={
                requestId ? 'Nincs változás' : 'Az esemény vége után 3 hét'
              }
              showIcon
              showOnFocus={false}
            />
          </FormField>
          <Divider align="center" type="dashed">
            <b>Felkérő</b>
          </Divider>
          <Controller
            control={control}
            name="requesterType"
            render={({ field }) =>
              isMobile ? (
                <div className="col-12 mb-0">
                  <Dropdown
                    disabled={isPending}
                    id={field.name}
                    itemTemplate={requesterTypeOptionTemplate}
                    optionLabel="text"
                    optionValue="value"
                    options={requesterTypeOptions}
                    valueTemplate={requesterTypeOptionTemplate}
                    {...field}
                  />
                </div>
              ) : (
                <div className="col-12 mb-0">
                  <SelectButton
                    allowEmpty={false}
                    disabled={isPending}
                    id={field.name}
                    itemTemplate={requesterTypeOptionTemplate}
                    optionLabel="text"
                    optionValue="value"
                    options={requesterTypeOptions}
                    {...field}
                  />
                </div>
              )
            }
          />
          {watchRequesterType === 'search' && (
            <Controller
              name="requester"
              control={control}
              render={({ field }) => (
                <div className="col-12 field mb-0 mt-4">
                  <Suspense fallback={<ProgressBar mode="indeterminate" />}>
                    <UsersDataTable
                      onSelectionChange={(e) => {
                        if (!isPending) field.onChange(e.value);
                      }}
                      selection={field.value || undefined}
                      selectionMode="single"
                    />
                  </Suspense>
                </div>
              )}
            />
          )}
          {watchRequesterType === 'new' && (
            <Suspense fallback={<ProgressBar mode="indeterminate" />}>
              <NewRequesterForm control={control} disabled={isPending} />
            </Suspense>
          )}
          <Divider />

          <SplitButton
            className="col-12 md:col-3 w-auto"
            disabled={isPending}
            icon="pi pi-save"
            loading={isPending}
            label="Mentés"
            model={buttonOptions}
            onClick={handleSubmit(onSubmit)}
          />
          {!requestId && (
            <div className="col-12 field-checkbox md:col-3 md:mb-0 md:mt-0 mt-3">
              <Controller
                name="createMore"
                control={control}
                render={({ field }) => (
                  <Checkbox
                    checked={field.value}
                    disabled={isPending}
                    inputId={field.name}
                    onChange={(e) => field.onChange(e.checked)}
                  />
                )}
              />
              <label htmlFor="createMore">Több létrehozása</label>
            </div>
          )}
        </div>
      </form>
      {requestId && <LastUpdatedAt lastUpdatedAt={new Date(dataUpdatedAt)} />}
    </div>
  );
};

export { RequestCreatorEditorPage as Component };
