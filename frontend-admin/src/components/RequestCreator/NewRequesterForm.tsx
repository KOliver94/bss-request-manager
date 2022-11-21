import { InputText } from 'primereact/inputtext';
import { Control } from 'react-hook-form';

import FormField from 'components/FormField/FormField';

import { IRequestCreator } from './RequestCreator';

type NewRequesterFormProps = {
  control: Control<IRequestCreator>;
};

const NewRequesterForm = ({ control }: NewRequesterFormProps) => {
  return (
    <>
      <FormField
        className="col-12 mb-4 md:col-6 mt-4"
        control={control}
        name="requester_last_name"
        title="Vezetéknév"
      >
        <InputText type="text" />
      </FormField>
      <FormField
        className="col-12 mb-4 md:col-6 md:mt-4"
        control={control}
        name="requester_first_name"
        title="Keresztnév"
      >
        <InputText type="text" />
      </FormField>
      <FormField
        className="col-12 mb-4 md:col-6 md:mb-0"
        control={control}
        icon="pi-envelope"
        name="requester_email"
        title="E-mail cím"
      >
        <InputText type="email" />
      </FormField>
      <FormField
        className="col-12 mb-0 md:col-6"
        control={control}
        icon="pi-phone"
        name="requester_mobile"
        title="Telefonszám"
      >
        <InputText type="tel" />
      </FormField>
    </>
  );
};

export default NewRequesterForm;
