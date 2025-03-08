import { Suspense, lazy, useState } from 'react';

import { useSuspenseQuery } from '@tanstack/react-query';
import { isAxiosError } from 'axios';
import { ProgressBar } from 'primereact/progressbar';
import { LoaderFunctionArgs, useLoaderData, useNavigate } from 'react-router';

import { usersRetrieveQuery } from 'api/queries';
import LastUpdatedAt from 'components/LastUpdatedAt/LastUpdatedAt';
import NavigationButton from 'components/UserProfile/NavigationButton';
import { getErrorMessage } from 'helpers/ErrorMessageProvider';
import { useToast } from 'providers/ToastProvider';
import { queryClient } from 'router';

const BanSection = lazy(() => import('components/UserProfile/BanSection'));
const ProfileSection = lazy(
  () => import('components/UserProfile/ProfileSection'),
);
const WorkedOnSection = lazy(
  () => import('components/UserProfile/WorkedOnSection'),
);

export type loaderData = Awaited<ReturnType<typeof loader>>;

export async function loader({ params }: LoaderFunctionArgs) {
  if (!params.userId) {
    throw new Error('No user ID provided');
  }
  const userData = await queryClient.ensureQueryData(
    usersRetrieveQuery(params.userId),
  );
  return {
    userId: params.userId,
    userFullName: `${userData.last_name} ${userData.first_name}`,
  };
}

const UserProfilePage = () => {
  const [section, setSection] = useState<string>('profile');
  const { userId } = useLoaderData() as loaderData;
  const { showToast } = useToast();
  const navigate = useNavigate();

  const { data, dataUpdatedAt, error, refetch } = useSuspenseQuery(
    usersRetrieveQuery(userId),
  );

  if (error) {
    if (isAxiosError(error)) {
      void navigate('/error', {
        state: {
          statusCode: error.response?.status,
          statusText: error.response?.statusText,
        },
      });
    } else {
      showToast({
        detail: getErrorMessage(error),
        life: 3000,
        severity: 'error',
        summary: 'Hiba',
      });
    }
  }

  return (
    <div className="lg:px-8 md:px-6 px-4 py-5 surface-ground">
      <div className="flex flex-column lg:flex-row p-fluid">
        <ul className="border-round flex flex-row h-full justify-content-evenly lg:flex-column lg:justify-content-start lg:mb-0 lg:mr-5 list-none m-0 mb-5 md:justify-content-between shadow-2 surface-card p-0">
          <NavigationButton
            icon="pi pi-user"
            onClick={() => setSection('profile')}
            text="Profil"
          />
          <NavigationButton
            icon="pi pi-ban"
            onClick={() => setSection('ban')}
            text="Kitiltás"
          />
          <NavigationButton
            icon="pi pi-list"
            onClick={() => setSection('workedOn')}
            text="Anyagok"
          />
        </ul>
        <div className="flex-auto">
          <div className="border-round shadow-2 surface-card p-5">
            <Suspense fallback={<ProgressBar mode="indeterminate" />}>
              {section === 'ban' && (
                <BanSection banData={data.ban} userId={data.id} />
              )}
              {section === 'profile' && <ProfileSection userData={data} />}
              {section === 'workedOn' && <WorkedOnSection userId={data.id} />}
            </Suspense>
          </div>
          {section !== 'workedOn' && (
            <LastUpdatedAt
              lastUpdatedAt={new Date(dataUpdatedAt)}
              refetch={refetch}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export { UserProfilePage as Component };
