import { cloneElement } from 'react';

import { classNames, IconType } from 'primereact/utils';
import { Controller, UseControllerProps } from 'react-hook-form';

import ConditionalWrapper from 'helpers/ConditionalWrapper';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
interface FormFieldProps extends UseControllerProps<any> {
  children: JSX.Element;
  className: string;
  icon?: IconType<FormFieldProps>;
  label: string;
}

const FormField = ({
  className,
  children,
  control,
  icon,
  label,
  name,
}: FormFieldProps) => {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <div className={classNames('field', className)}>
          <label className="font-medium text-900" htmlFor={field.name}>
            {label}
          </label>
          <ConditionalWrapper
            condition={!!icon}
            wrapper={(children) => (
              <span className="p-input-icon-right">
                <i className={`pi ${icon}`} />
                {children}
              </span>
            )}
          >
            {cloneElement(children, {
              className: fieldState.error && 'p-invalid',
              id: field.name,
              ...field,
            })}
          </ConditionalWrapper>
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
