import { forwardRef, useEffect, useState } from 'react';

import { AutoComplete, AutoCompleteProps } from 'primereact/autocomplete';

import Avatar from 'components/Avatar/Avatar';

export interface StaffUser {
  // TODO: It will possibly change
  first_name: string;
  id: number;
  last_name: string;
  profile: {
    avatar_url: string | null;
  };
}

const AutoCompleteStaff = forwardRef<
  React.Ref<HTMLInputElement>,
  AutoCompleteProps
>((props, ref) => {
  const [filteredStaff, setFilteredStaff] = useState<StaffUser[]>([]);
  const [staff, setStaff] = useState<StaffUser[]>([]);

  const itemTemplate = (item: StaffUser) => {
    return (
      <div className="align-items-center flex">
        <Avatar className="mr-2" image={item.profile.avatar_url || undefined} />
        <div>{item.last_name + ' ' + item.first_name}</div>
      </div>
    );
  };

  const searchStaff = (event: { query: string }) => {
    function normalizeString(input: string) {
      return input
        .trim()
        .toLowerCase()
        .normalize('NFD')
        .replace(/\p{Diacritic}/gu, '');
    }

    let _filteredStaff;
    if (!event.query.trim().length) {
      _filteredStaff = [...staff];
    } else {
      _filteredStaff = staff.filter((user) => {
        const fullName = normalizeString(
          user.last_name + ' ' + user.first_name
        );

        return fullName.includes(normalizeString(event.query));
      });
    }

    setFilteredStaff(_filteredStaff);
  };

  useEffect(() => {
    /*setStaff(
      staffResponse.sort(function (a, b) {
        return (
          a.last_name.localeCompare(b.last_name) ||
          a.first_name.localeCompare(b.first_name)
        );
      })
    );*/
    setStaff([]);
  }, []);

  return (
    <AutoComplete
      completeMethod={searchStaff}
      dropdown
      field="username" // TODO: Change it to other field
      forceSelection
      itemTemplate={itemTemplate}
      suggestions={filteredStaff}
      {...props}
      {...ref}
    />
  );
});

AutoCompleteStaff.displayName = 'AutoComplateStaff';

export default AutoCompleteStaff;
