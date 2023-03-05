import { forwardRef, useEffect } from 'react';

import { Button } from 'primereact/button';
import { Dialog, DialogProps } from 'primereact/dialog';
import { InputTextarea } from 'primereact/inputtextarea';
import { Controller, useForm } from 'react-hook-form';

import useMobile from 'hooks/useMobile';
import { RequestAdditionalDataType } from 'pages/RequestDetailsPage';

interface AdditionalDataDialogProps extends DialogProps {
  data: RequestAdditionalDataType;
  loading: boolean;
  onSave(data: { additional_data: string }): void;
}

// TODO: Add yup validation

const AdditionalDataDialog = forwardRef<
  React.Ref<HTMLDivElement>,
  AdditionalDataDialogProps
>(({ data, loading, onHide, onSave, visible, ...props }, ref) => {
  const isMobile = useMobile();
  const defaultValues = {
    additional_data: JSON.stringify(data, null, 2),
  };

  const {
    control,
    formState: { isDirty },
    handleSubmit,
    reset,
  } = useForm<{
    additional_data: string;
  }>({ defaultValues });

  useEffect(() => {
    reset();
  }, [visible]);

  const renderFooter = () => {
    //TODO: Do not render if user is not an admin + disable textfield
    return (
      <div>
        <Button
          className="p-button-text p-button-secondary"
          disabled={!isDirty || loading}
          icon="pi pi-refresh"
          label="Visszaállítás"
          onClick={() => reset()}
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
      footer={renderFooter}
      header="További adatok szerkesztése"
      onHide={onHide}
      style={{ width: isMobile ? '95vw' : '50vw' }}
      visible={visible}
      {...props}
      {...ref}
    >
      <Controller
        name="additional_data"
        control={control}
        render={({ field }) => (
          <InputTextarea
            autoResize
            className="w-full"
            disabled={loading}
            id={field.name}
            rows={4}
            {...field}
          />
        )}
      />
    </Dialog>
  );
});

AdditionalDataDialog.displayName = 'AdditionalDataDialog';
export default AdditionalDataDialog;
