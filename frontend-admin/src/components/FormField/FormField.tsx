import React, { cloneElement } from 'react';

import { classNames } from 'primereact/utils';
import type { IconType } from 'primereact/utils';
import { Controller } from 'react-hook-form';
import type { UseControllerProps } from 'react-hook-form';

import ConditionalWrapper from 'helpers/ConditionalWrapper';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
interface FormFieldProps extends UseControllerProps<any> {
  children: React.JSX.Element;
  className: string;
  icon?: IconType<FormFieldProps>;
  label: string;
}

const errorMessages: Record<string, string> = {
  maxLength: 'A mező túl hosszú',
  required: 'A mező kitöltése kötelező',
  validate: 'A mező kitöltése kötelező',
};

const FormField = ({
  className,
  children,
  icon,
  label,
  ...controllerProps
}: FormFieldProps) => {
  return (
    <Controller
      {...controllerProps}
      render={({ field, fieldState }) => (
        <div className={classNames('field', className)}>
          <label className="font-medium text-900" htmlFor={field.name}>
            {label}
          </label>
          <ConditionalWrapper
            condition={!!icon}
            wrapper={(children) => (
              <div className="p-inputgroup">
                <span className="p-inputgroup-addon">
                  <i className={`pi ${icon}`} />
                </span>
                {children}
              </div>
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
              {fieldState.error.message || errorMessages[fieldState.error.type]}
            </small>
          )}
        </div>
      )}
    />
  );
};

export default FormField;
