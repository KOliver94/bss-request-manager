import { Fragment } from 'react';

import { Chip } from 'primereact/chip';
import { Tag } from 'primereact/tag';
import { Tooltip } from 'primereact/tooltip';

import LinkButton from 'components/LinkButton/LinkButton';
import User from 'components/User/User';
import { UsersDataType } from 'components/UsersDataTable/UsersDataTable';
import { RequestAdditionalDataType } from 'pages/RequestDetailsPage';

type RequesterContentProps = {
  additionalData: RequestAdditionalDataType;
  requester: UsersDataType;
};

type RequesterContentButtonsProps = {
  requestTitle: string;
  requester: UsersDataType;
};

export const RequesterContent = ({
  additionalData,
  requester,
}: RequesterContentProps) => {
  return (
    <div>
      <div className="align-items-center flex">
        <User
          className="mr-2"
          imageUrl={requester.profile.avatar_url}
          name={requester.full_name}
        />
        <Fragment>
          <Tooltip
            className="text-xs"
            position="top"
            target=".requester-different-data-tag"
          />
          {additionalData?.requester && (
            <Tag
              className="requester-different-data-tag"
              data-pr-tooltip={`Név: ${additionalData.requester.last_name} ${additionalData.requester.first_name}
              Telefonszám: ${additionalData.requester.phone_number}`}
              icon="pi pi-exclamation-triangle"
              severity="warning"
              value="Eltérő adatok"
            />
          )}
        </Fragment>
      </div>
      <div className="align-items-center flex flex-wrap">
        <Chip
          className="mt-1 mr-2"
          icon="pi pi-phone"
          label={requester.profile.phone_number}
        />
        <Chip className="mt-1" icon="pi pi-envelope" label={requester.email} />
      </div>
    </div>
  );
};

export const RequesterContentButtons = ({
  requestTitle,
  requester,
}: RequesterContentButtonsProps) => {
  return (
    <span className="flex flex-no-wrap justify-content-end p-buttonset sm:flex-wrap">
      <LinkButton
        buttonProps={{
          className: 'p-button-sm p-button-text pl-1 pr-2 py-0',
          icon: 'pi pi-phone',
          label: 'Hívás',
        }}
        linkProps={{ to: `tel:${requester.profile.phone_number}` }}
      />
      <LinkButton
        buttonProps={{
          className:
            'p-button-sm p-button-text pl-2 pr-2 py-0 white-space-nowrap',
          icon: 'pi pi-envelope',
          label: 'E-mail',
        }}
        linkProps={{ to: `mailto:${requester.email}?subject=${requestTitle}` }}
      />
      <LinkButton
        buttonProps={{
          className: 'p-button-sm p-button-text pl-2 pr-1 py-0',
          icon: 'pi pi-user',
          label: 'Profil',
        }}
        linkProps={{ to: `/users/${requester.id}` }}
      />
    </span>
  );
};
