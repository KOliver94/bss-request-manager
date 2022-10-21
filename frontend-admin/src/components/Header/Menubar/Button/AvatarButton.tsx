import { useState } from 'react';

import { Avatar } from 'primereact/avatar';
import { Ripple } from 'primereact/ripple';

import stylesModule from './AvatarButton.module.css';

const AvatarButton = () => {
  const [imgUrl, setImgUrl] = useState(
    localStorage.getItem('avatar') || undefined
  );
  const fullName = localStorage.getItem('name') || '';
  const groupName = JSON.parse(localStorage.getItem('groups') || '[]');

  return (
    <li className="border-top-1 lg:border-top-none surface-border">
      <a
        className="align-items-center border-left-2 border-transparent cursor-pointer flex font-medium h-full hover:border-primary lg:border-bottom-2 lg:border-left-none lg:px-3 lg:py-2 p-3 no-underline p-ripple px-6 transition-colors transition-duration-150"
        href="/profile"
      >
        <Avatar
          className={stylesModule.avatarIcon + ' lg:mr-0 mr-3'}
          icon="pi pi-user"
          image={imgUrl}
          onImageError={() => {
            setImgUrl(undefined);
          }}
          shape="circle"
        />
        <div className="block lg:hidden">
          <div className="font-medium text-900">{fullName}</div>
          <span className="font-medium text-600 text-sm">
            {groupName.join(', ')}
          </span>
        </div>
        <Ripple />
      </a>
    </li>
  );
};

export default AvatarButton;
