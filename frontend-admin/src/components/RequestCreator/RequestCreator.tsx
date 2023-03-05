import { Calendar } from 'primereact/calendar';
import { Checkbox } from 'primereact/checkbox';
import { Divider } from 'primereact/divider';
import { Dropdown } from 'primereact/dropdown';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { SelectButton } from 'primereact/selectbutton';
import { SplitButton } from 'primereact/splitbutton';
import { IconType } from 'primereact/utils';
import { Controller, SubmitHandler, useForm } from 'react-hook-form';

import AutoCompleteStaff, {
  StaffUser,
} from 'components/AutoCompleteStaff/AutoCompleteStaff';
import FormField from 'components/FormField/FormField';
import UsersDataTable, {
  UsersDataType,
} from 'components/UsersDataTable/UsersDataTable';
import useMobile from 'hooks/useMobile';

import NewRequesterForm from './NewRequesterForm';

export interface IRequestCreator {
  comment_text: string;
  create_more: boolean;
  deadline: Date | null;
  end_datetime: Date | null;
  place: string;
  responsible: StaffUser | null;
  requester: UsersDataType | null;
  requester_email: string;
  requester_first_name: string;
  requester_last_name: string;
  requester_mobile: string;
  requesterType: string;
  start_datetime: Date | null;
  title: string;
  type: string;
}

const RequestCreator = () => {
  const defaultValues = {
    comment_text: '',
    create_more: false,
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
    start_datetime: null,
    title: '',
    type: '',
  };

  const { control, handleSubmit, watch } = useForm<IRequestCreator>({
    defaultValues,
    mode: 'onChange',
  });
  const watchRequesterType = watch('requesterType');
  const isMobile = useMobile();

  const buttonOptions = [
    {
      icon: 'pi pi-bell',
      label: 'Mentés értesítéssel',
    },
    {
      icon: 'pi pi-replay',
      label: 'Visszaállítás',
    },
  ];

  const requesterTypeOptions = [
    { icon: 'pi pi-user', text: 'Kecskeméty Olivér', value: 'self' },
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

  const onSubmit: SubmitHandler<IRequestCreator> = (data) => {
    console.log(data);
  };

  return (
    <div className="p-3 sm:p-5 surface-ground">
      <div className="font-medium mb-3 text-900 text-xl">
        Felkérés létrehozása
      </div>
      <form className="border-round p-3 p-fluid shadow-2 sm:p-4 surface-card">
        <div className="formgrid grid p-fluid">
          <FormField
            className="col-12 mb-4"
            control={control}
            label="Esemény neve"
            name="title"
          >
            <InputText autoFocus type="text" />
          </FormField>
          <FormField
            className="col-12 mb-4 md:col-6"
            control={control}
            label="Kezdés időpontja"
            name="start_datetime"
          >
            <Calendar
              dateFormat="yy.mm.dd"
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
          >
            <Calendar
              dateFormat="yy.mm.dd"
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
          >
            <InputText type="text" />
          </FormField>
          <FormField
            className="col-12 mb-0 md:col-6"
            control={control}
            label="Típus"
            name="type"
          >
            <Dropdown editable options={typeOptions} />
          </FormField>
          <Divider align="center" type="dashed">
            <b>Opcionális mezők</b>
          </Divider>
          <FormField
            className="col-12 mb-0"
            control={control}
            label="Megjegyzések"
            name="comment_text"
          >
            <InputTextarea rows={isMobile ? 5 : 8} autoResize />
          </FormField>
          <Divider type="dashed" />
          <FormField
            className="col-12 mb-4 md:col-6 md:mb-0"
            control={control}
            label="Felelős"
            name="responsible"
          >
            <AutoCompleteStaff placeholder="Főszerkesztő" />
          </FormField>
          <FormField
            className="col-12 mb-0 md:col-6"
            control={control}
            label="Határidő"
            name="deadline"
          >
            <Calendar
              dateFormat="yy.mm.dd"
              mask="9999.99.99."
              placeholder="Az esemény vége után 3 hét"
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
                    id={field.name}
                    itemTemplate={requesterTypeOptionTemplate}
                    optionLabel="text"
                    optionValue="value"
                    options={requesterTypeOptions}
                    unselectable={false}
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
                  <UsersDataTable
                    selectionMode="single"
                    selection={field.value || undefined}
                    onSelectionChange={(e) => field.onChange(e.value)}
                  />
                </div>
              )}
            />
          )}
          {watchRequesterType === 'new' && (
            <NewRequesterForm control={control} />
          )}
          <Divider />

          <SplitButton
            className="col-12 md:col-3 w-auto"
            icon="pi pi-save"
            label="Mentés"
            model={buttonOptions}
            onClick={handleSubmit(onSubmit)}
          />
          <div className="col-12 field-checkbox md:col-3 md:mb-0 md:mt-0 mt-3">
            <Controller
              name="create_more"
              control={control}
              render={({ field }) => (
                <Checkbox
                  checked={field.value}
                  inputId={field.name}
                  onChange={(e) => field.onChange(e.checked)}
                />
              )}
            />
            <label htmlFor="create_more">Több létrehozása</label>
          </div>
        </div>
      </form>
    </div>
  );
};

export default RequestCreator;
