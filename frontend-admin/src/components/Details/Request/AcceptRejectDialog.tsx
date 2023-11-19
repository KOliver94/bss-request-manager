import { forwardRef, useEffect } from 'react';

import { Button } from 'primereact/button';
import { Dialog, DialogProps } from 'primereact/dialog';
import { SelectButton } from 'primereact/selectbutton';
import { ToggleButton } from 'primereact/togglebutton';
import { classNames } from 'primereact/utils';
import { Controller, useForm } from 'react-hook-form';

import { isAdmin } from 'helpers/LocalStorageHelper';

interface AcceptRejectDialogProps extends DialogProps {
  accepted: boolean | null | undefined;
  canceled: boolean | null | undefined;
  failed: boolean | null | undefined;
  loading: boolean;
  onSave(data: {
    accepted: boolean | null;
    canceled: boolean | null;
    failed: boolean | null;
  }): void;
}

type AcceptOption = {
  className: string;
  icon: string;
  label: string;
  value: boolean;
};

const AcceptRejectDialog = forwardRef<
  React.Ref<HTMLDivElement>,
  AcceptRejectDialogProps
>(
  (
    { accepted, canceled, failed, loading, onHide, onSave, visible, ...props },
    ref,
  ) => {
    const {
      control,
      formState: { isDirty },
      handleSubmit,
      reset,
    } = useForm<{
      accepted: boolean | null;
      canceled: boolean | null;
      failed: boolean | null;
    }>();

    useEffect(() => {
      const defaultValues = {
        accepted: accepted === undefined ? null : accepted,
        canceled: canceled || null,
        failed: failed || null,
      };
      reset({ ...defaultValues });
    }, [visible]);

    const acceptOptions: AcceptOption[] = [
      {
        className: 'w-6',
        icon: 'bi bi-hand-thumbs-up-fill',
        label: 'Elfogadva',
        value: true,
      },
      {
        className: 'w-6',
        icon: 'bi bi-hand-thumbs-down-fill',
        label: 'Elutasítva',
        value: false,
      },
    ];

    const acceptTemplate = (option: AcceptOption) => {
      return (
        <>
          <i
            className={classNames(
              'p-button-icon p-c p-button-icon-left',
              option.icon,
            )}
          />
          <span className="p-button-label p-c text-center">{option.label}</span>
        </>
      );
    };

    const renderFooter = () => {
      if (!isAdmin()) return;

      return (
        <div>
          <Button
            className="p-button-secondary p-button-text"
            disabled={!isDirty || loading}
            icon="pi pi-refresh"
            label="Visszaállítás"
            onClick={() => {
              reset();
            }}
          />
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
            onClick={handleSubmit(onSave)}
          />
        </div>
      );
    };

    return (
      <Dialog
        contentClassName="align-item-center flex flex-column justify-content-center"
        breakpoints={{ '768px': '95vw' }}
        footer={renderFooter}
        header="Felkérés elfogadása"
        onHide={onHide}
        style={{ width: '50vw' }}
        visible={visible}
        {...props}
        {...ref}
      >
        <Controller
          name="accepted"
          control={control}
          render={({ field }) => (
            <SelectButton
              {...field}
              className="my-2"
              disabled={field.disabled || !isAdmin()}
              id={field.name}
              itemTemplate={acceptTemplate}
              optionLabel="label"
              options={acceptOptions}
            />
          )}
        />
        <Controller
          name="canceled"
          control={control}
          render={({ field }) => (
            <ToggleButton
              {...field}
              checked={field.value || false}
              className="my-2"
              disabled={field.disabled || !isAdmin()}
              id={field.name}
              offIcon="bi bi-person-fill-x"
              offLabel="Szervezők által lemondva"
              onChange={field.onChange}
              onIcon="bi bi-person-fill-x"
              onLabel="Szervezők által lemondva"
              value={undefined}
            />
          )}
        />
        <Controller
          name="failed"
          control={control}
          render={({ field }) => (
            <ToggleButton
              checked={field.value || false}
              className="mt-2"
              disabled={field.disabled || !isAdmin()}
              id={field.name}
              offIcon="bi bi-fire"
              offLabel="Meghiúsult"
              onChange={field.onChange}
              onIcon="bi bi-fire"
              onLabel="Meghiúsult"
            />
          )}
        />
      </Dialog>
    );
  },
);

AcceptRejectDialog.displayName = 'AcceptRejectDialog';
export default AcceptRejectDialog;
