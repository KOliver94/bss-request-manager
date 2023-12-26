import { useState } from 'react';

import { useQueryClient } from '@tanstack/react-query';
import { Button } from 'primereact/button';
import { Divider } from 'primereact/divider';
import { InputTextarea } from 'primereact/inputtextarea';

import { adminApi } from 'api/http';
import { BanUser } from 'api/models/ban-user';
import User from 'components/User/User';
import { dateTimeToLocaleString } from 'helpers/DateToLocaleStringCoverters';
import { getErrorMessage } from 'helpers/ErrorMessageProvider';
import { getUserId, isAdmin } from 'helpers/LocalStorageHelper';
import { useToast } from 'providers/ToastProvider';

type BanSectionProps = {
  banData: BanUser | null;
  userId: number;
};

const BanSection = ({ banData, userId }: BanSectionProps) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [reason, setReason] = useState<string>(banData?.reason || '');

  const { showToast } = useToast();
  const queryClient = useQueryClient();

  const onCreate = async () => {
    setIsLoading(true);

    await adminApi
      .adminUsersBanCreate(userId, { reason })
      .then(async () => {
        showToast({
          detail: 'Felhasználó kitiltva',
          life: 3000,
          severity: 'success',
          summary: 'Siker',
        });

        await queryClient.invalidateQueries({
          queryKey: ['users', userId],
        });
      })
      .catch((error) => {
        showToast({
          detail: getErrorMessage(error),
          life: 3000,
          severity: 'error',
          summary: 'Hiba',
        });
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  const onDelete = async () => {
    setIsLoading(true);

    await adminApi
      .adminUsersBanDestroy(userId)
      .then(async () => {
        showToast({
          detail: 'Felhasználó kitiltása feloldva',
          life: 3000,
          severity: 'success',
          summary: 'Siker',
        });

        await queryClient.invalidateQueries({
          queryKey: ['users', userId],
        });
      })
      .catch((error) => {
        showToast({
          detail: getErrorMessage(error),
          life: 3000,
          severity: 'error',
          summary: 'Hiba',
        });
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  return (
    <>
      <div className="font-semibold mt-3 text-900 text-lg">Kitiltás</div>
      <Divider />
      <div className="field">
        <label className="font-medium text-900" htmlFor="reason">
          Indoklás
        </label>
        <InputTextarea
          autoResize
          disabled={!!banData || !isAdmin() || getUserId() === userId}
          id="reason"
          name="reason"
          onChange={(e) => setReason(e.target.value)}
          rows={5}
          value={reason}
        />
      </div>
      {banData && (
        <div className="column-gap-5 flex flex-wrap">
          <div className="flex flex-column field">
            <label className="font-medium text-900">Kitiltás dátuma</label>
            <div className="pt-1">
              {dateTimeToLocaleString(new Date(banData.created), false)}
            </div>
          </div>
          <div className="field">
            <label className="font-medium text-900">Kitiltó</label>
            <User
              imageUrl={banData.creator.avatar_url}
              name={banData.creator.full_name}
            />
          </div>
        </div>
      )}
      <Button
        className="w-auto"
        disabled={!isAdmin() || getUserId() === userId}
        icon={banData ? 'pi pi-check' : 'pi pi-ban'}
        label={banData ? 'Kitiltás törlése' : 'Kitiltás'}
        severity={banData ? 'success' : 'danger'}
        loading={isLoading}
        onClick={banData ? () => onDelete() : () => onCreate()}
      />
    </>
  );
};

export default BanSection;
