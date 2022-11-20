import { cloneElement } from 'react';

import { classNames } from 'primereact/utils';
import { Controller, UseControllerProps } from 'react-hook-form';

import { IRequestCreator } from 'components/RequestCreator/RequestCreator';

interface FormFieldProps extends UseControllerProps<IRequestCreator> {
  children: JSX.Element;
  className: string;
  title: string;
}

const FormField = ({
  className,
  children,
  control,
  name,
  title,
}: FormFieldProps) => {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <div className={classNames('field', className)}>
          <label className="font-medium text-900" htmlFor={field.name}>
            {title}
          </label>
          {cloneElement(children, {
            className: fieldState.error && 'p-invalid',
            id: field.name,
            ...field,
          })}
          {fieldState.error && (
            <small className="block p-error" id={field.name + '-help'}>
              {fieldState.error.message}
            </small>
          )}
        </div>
      )}
    />
  );
};

export default FormField;
