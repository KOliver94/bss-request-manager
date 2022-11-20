import { forwardRef } from 'react';

import {
  Avatar as PrimeAvatar,
  AvatarProps as PrimeAvatarProps,
} from 'primereact/avatar';
import { classNames } from 'primereact/utils';

import stylesModule from './Avatar.module.css';

const Avatar = forwardRef<React.Ref<HTMLDivElement>, PrimeAvatarProps>(
  (props, ref) => {
    return (
      <PrimeAvatar
        icon="pi pi-user"
        shape="circle"
        {...props}
        {...ref}
        className={classNames(stylesModule.avatarIcon, props.className)}
      />
    );
  }
);

Avatar.displayName = 'Avatar';

export default Avatar;
