import { forwardRef } from 'react';

import { Button, ButtonProps } from 'primereact/button';
import { Link, LinkProps } from 'react-router-dom';

interface LinkButtonProps {
  buttonProps: ButtonProps;
  linkProps: LinkProps;
}

const LinkButton = forwardRef<React.Ref<HTMLTableElement>, LinkButtonProps>(
  ({ buttonProps, linkProps }, ref) => {
    return (
      <Link className="no-underline" {...linkProps}>
        <Button {...buttonProps} {...ref} />
      </Link>
    );
  }
);
LinkButton.displayName = 'LinkButton';

export default LinkButton;
