import { forwardRef, useState } from 'react';

import { Button } from 'primereact/button';
import { Dialog, DialogProps } from 'primereact/dialog';
import { Controller, useForm } from 'react-hook-form';

import AutoCompleteStaff from 'components/AutoCompleteStaff/AutoCompleteStaff';
import useMobile from 'hooks/useMobile';

import AutoCompleteCrewPosition from './AutoCompleteCrewPosition';

interface AddCrewDialogProps extends DialogProps {
  requestId: number;
}

interface ICrewCreate {
  member: number | null;
  position: string;
}

const AddCrewDialog = forwardRef<React.Ref<HTMLDivElement>, AddCrewDialogProps>(
  ({ onHide, requestId, visible, ...props }, ref) => {
    const isMobile = useMobile();
    const [loading, setLoading] = useState<boolean>(false);

    const {
      control,
      formState: { isDirty },
      handleSubmit,
    } = useForm<ICrewCreate>({
      shouldFocusError: false,
    });

    const onSubmit = (data: ICrewCreate) => {
      setLoading(true);
      console.log('Adding crew member to ' + requestId);
      console.log(data.member + ' - ' + data.position);
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
              name="member"
              render={({ field, fieldState }) => (
                <>
                  <AutoCompleteStaff
                    className="w-full"
                    disabled={loading}
                    id={field.name}
                    {...field}
                  />
                  {fieldState.error ? (
                    <small className="p-error">
                      {fieldState.error.message}
                    </small>
                  ) : (
                    <small className="p-error">&nbsp;</small>
                  )}
                </>
              )}
              rules={{
                min: { message: 'A stábtag kiválasztása kötelező!', value: 0 },
                required: 'A stábtag kiválasztása kötelező!',
              }}
            />
          </div>
          <div className="field col-12">
            <label className="font-medium text-900 text-sm" htmlFor="rating">
              Pozíció
            </label>
            <Controller
              control={control}
              name="position"
              render={({ field, fieldState }) => (
                <>
                  <AutoCompleteCrewPosition
                    className="w-full"
                    disabled={loading}
                    id={field.name}
                    {...field}
                  />
                  {fieldState.error ? (
                    <small className="p-error">
                      {fieldState.error.message}
                    </small>
                  ) : (
                    <small className="p-error">&nbsp;</small>
                  )}
                </>
              )}
              rules={{
                maxLength: { message: 'A pozíció túl hosszú!', value: 20 },
                required: 'A pozíció megadása kötelező!',
                validate: (value) =>
                  !!value.trim() || 'A pozíció megadása kötelező!',
              }}
            />
          </div>
        </form>
      </Dialog>
    );
  },
);
AddCrewDialog.displayName = 'AddCrewDialog';

export default AddCrewDialog;
