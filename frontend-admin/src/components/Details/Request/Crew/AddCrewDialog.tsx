import { forwardRef, useState } from 'react';

import { yupResolver } from '@hookform/resolvers/yup';
import { Button } from 'primereact/button';
import { Dialog, DialogProps } from 'primereact/dialog';
import { Controller, useForm } from 'react-hook-form';
import * as yup from 'yup';

import AutoCompleteStaff from 'components/AutoCompleteStaff/AutoCompleteStaff';
import useMobile from 'hooks/useMobile';

import AutoCompleteCrewPosition from './AutoCompleteCrewPosition';

interface AddCrewDialogProps extends DialogProps {
  requestId: number;
}

interface ICrewCreate {
  member_id: number | null;
  position: string;
}

const validationSchema = yup
  .object({
    member_id: yup
      .number()
      .required('A stábtag kiválasztása kötelező!')
      .nullable(),
    position: yup
      .string()
      .required('A pozíció megadása kötelező!')
      .max(20, 'A pozíció túl hosszú!')
      .trim(),
  })
  .required();

const AddCrewDialog = forwardRef<React.Ref<HTMLDivElement>, AddCrewDialogProps>(
  ({ onHide, requestId, visible, ...props }, ref) => {
    const isMobile = useMobile();
    const [loading, setLoading] = useState<boolean>(false);

    const {
      control,
      formState: { errors, isDirty },
      handleSubmit,
    } = useForm<ICrewCreate>({
      resolver: yupResolver(validationSchema),
      shouldFocusError: false,
    });

    const getFormErrorMessage = (name: keyof ICrewCreate) => {
      return errors[name] ? (
        <small className="p-error">{errors[name]?.message}</small>
      ) : (
        <small className="p-error">&nbsp;</small>
      );
    };

    const onSubmit = (data: ICrewCreate) => {
      setLoading(true);
      console.log('Adding crew member to ' + requestId);
      console.log(data.member_id + ' - ' + data.position);
      setTimeout(() => {
        setLoading(false);
        onHide();
      }, 500);
    };

    const renderFooter = () => {
      return (
        <div>
          <Button
            className="p-button-text"
            disabled={loading}
            icon="pi pi-times"
            label="Mégsem"
            onClick={onHide}
          />
          <Button
            autoFocus
            icon="pi pi-check"
            label="Mentés"
            loading={loading}
            onClick={handleSubmit(onSubmit)}
          />
        </div>
      );
    };

    return (
      <Dialog
        closeOnEscape={!isDirty}
        footer={renderFooter}
        header="Új stábtag hozzáadása"
        onHide={onHide}
        style={{ width: isMobile ? '95vw' : '50vw' }}
        visible={visible}
        {...props}
        {...ref}
      >
        <form className="formgrid grid p-fluid">
          <div className="field col-12">
            <label
              className="align-items-center flex font-medium text-900 text-sm"
              htmlFor="rating"
            >
              Stábtag
            </label>
            <Controller
              control={control}
              name="member_id"
              render={({ field }) => (
                <>
                  <AutoCompleteStaff
                    className="w-full"
                    disabled={loading}
                    id={field.name}
                    {...field}
                  />
                  {getFormErrorMessage(field.name)}
                </>
              )}
            />
          </div>
          <div className="field col-12">
            <label className="font-medium text-900 text-sm" htmlFor="rating">
              Pozíció
            </label>
            <Controller
              control={control}
              name="position"
              render={({ field }) => (
                <>
                  <AutoCompleteCrewPosition
                    className="w-full"
                    disabled={loading}
                    id={field.name}
                    {...field}
                  />
                  {getFormErrorMessage(field.name)}
                </>
              )}
            />
          </div>
        </form>
      </Dialog>
    );
  },
);
AddCrewDialog.displayName = 'AddCrewDialog';

export default AddCrewDialog;
