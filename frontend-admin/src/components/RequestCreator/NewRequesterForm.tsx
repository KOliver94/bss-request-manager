import { InputText } from 'primereact/inputtext';
import { Control } from 'react-hook-form';

import FormField from 'components/FormField/FormField';
import { IRequestCreator } from 'pages/RequestCreatorEditorPage';

type NewRequesterFormProps = {
  control: Control<IRequestCreator>;
};

const NewRequesterForm = ({ control }: NewRequesterFormProps) => {
  return (
    <>
      <FormField
        className="col-12 mb-4 md:col-6 mt-4"
        control={control}
        label="Vezetéknév"
        name="requester_last_name"
      >
        <InputText type="text" />
      </FormField>
      <FormField
        className="col-12 mb-4 md:col-6 md:mt-4"
        control={control}
        label="Keresztnév"
        name="requester_first_name"
      >
        <InputText type="text" />
      </FormField>
      <FormField
        className="col-12 mb-4 md:col-6 md:mb-0"
        control={control}
        icon="pi-envelope"
        label="E-mail cím"
        name="requester_email"
      >
        <InputText type="email" />
      </FormField>
      <FormField
        className="col-12 mb-0 md:col-6"
        control={control}
        icon="pi-phone"
        label="Telefonszám"
        name="requester_mobile"
      >
        <InputText type="tel" />
      </FormField>
    </>
  );
};

export default NewRequesterForm;
