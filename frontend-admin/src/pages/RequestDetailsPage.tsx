import { lazy, Suspense, useEffect, useRef, useState } from 'react';

import { Badge } from 'primereact/badge';
import { Button } from 'primereact/button';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import { ProgressBar } from 'primereact/progressbar';
import { StyleClass } from 'primereact/styleclass';
import { TabView, TabPanel } from 'primereact/tabview';
import { Tag } from 'primereact/tag';
import { classNames } from 'primereact/utils';
import { SubmitHandler, useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';

import AdditionalDataDialog from 'components/AdditionalDataDialog/AdditionalDataDialog';
import AvatarGroupCrew from 'components/AvatarGroupCrew/AvatarGroupCrew';
import DetailsRow from 'components/Details/DetailsRow';
import AcceptRejectDialog from 'components/Details/Request/AcceptRejectDialog';
import JumpButton from 'components/Details/Request/JumpButton';
import {
  RecordingContent,
  RecordingContentButtons,
} from 'components/Details/Request/RecordingContent';
import {
  RequesterContent,
  RequesterContentButtons,
} from 'components/Details/Request/RequesterContent';
import LinkButton from 'components/LinkButton/LinkButton';
import RequestStatusHelperSlideover from 'components/StatusHelperSlideover/RequestStatusHelperSlideover';
import { RequestStatusTag } from 'components/StatusTag/StatusTag';
import User from 'components/User/User';
import { UsersDataType } from 'components/UsersDataTable/UsersDataTable';
import {
  dateTimeToLocaleString,
  dateToLocaleString,
} from 'helpers/DateToLocaleStringCoverters';
import useMobile from 'hooks/useMobile';

import * as testData from './testData.json';

const VideosDataTable = lazy(
  () => import('components/VideosDataTable/VideosDataTable')
);

export type RequestAdditionalDataRecordingType = {
  path?: string;
  copied_to_gdrive?: boolean;
  removed?: boolean;
};

export type RequestAdditionalDataType = {
  status_by_admin?: {
    status: number | null;
    admin_id: number;
    admin_name: string;
  };
  accepted?: boolean;
  canceled?: boolean;
  failed?: boolean;
  recording?: RequestAdditionalDataRecordingType;
  calendar_id?: string;
  requester?: {
    first_name: string;
    last_name: string;
    phone_number: string;
  };
  external?: {
    sch_events_callback_url?: string;
  };
};

export type RequestDataType = {
  additional_data: RequestAdditionalDataType;
  comments: number;
  created: Date;
  crew?: {
    full_name: string;
    avatar_url: string | null;
  }[];
  deadline: Date;
  end_datetime: Date;
  id: number;
  place: string;
  start_datetime: Date;
  status: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 9 | 10;
  status_by_admin?: boolean;
  responsible?: UsersDataType;
  requester: UsersDataType;
  requested_by: UsersDataType;
  title: string;
  type: string;
  videos: number;
};

const RequestDetailsPage = () => {
  const { requestId } = useParams();
  const isMobile = useMobile();
  const navigate = useNavigate();

  const [acceptRejectDialogOpen, setAcceptRejectDialogOpen] = useState(false);
  const [additionalDataDialogOpen, setAdditionalDataDialogOpen] =
    useState(false);
  const [recordingIsEditing, setRecordingIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [tabViewActiveIndex, setTabViewActiveIndex] = useState(0);
  const statusHelperSlideoverOpenBtnRef = useRef(null);

  const getRequest = (data: RequestDataType) => {
    return {
      ...data,
      created: new Date(data.created),
      deadline: new Date(data.deadline),
      end_datetime: new Date(data.end_datetime),
      start_datetime: new Date(data.start_datetime),
    };
  };

  const generateRecordingPath = () => {
    return `N://${data.start_datetime
      .toISOString()
      .slice(0, 10)
      .replace(/-/g, '')}_${data.title
      .normalize('NFD')
      .replace(/([\u0300-\u036f]|[^0-9a-zA-Z\s])/g, '')
      .toLowerCase()
      .split(' ')
      .join('_')}`.replace(/_{2,}/, '_');
  };

  const handleDelete = () => {
    console.log('Deleting request...');

    // TODO: Use real API call
    setTimeout(() => {
      navigate('/requests');
    }, 1000);
  };

  const onAcceptRejectSave = (data: {
    accepted: boolean | null;
    canceled: boolean | null;
    failed: boolean | null;
  }) => {
    console.log('Saving accept/reject...');
    setLoading(true);

    // TODO: Use real API call
    setTimeout(() => {
      setAcceptRejectDialogOpen(false);
      setLoading(false);
    }, 1000);
  };

  const onAdditionalDataSave = (data: { additional_data: string }) => {
    console.log('Saving additional_data...');
    setLoading(true);

    // TODO: Use real API call
    setTimeout(() => {
      setAdditionalDataDialogOpen(false);
      setLoading(false);
    }, 1000);
  };

  const onDelete = () => {
    confirmDialog({
      accept: handleDelete,
      acceptClassName: 'p-button-danger',
      header: 'Biztosan törölni akarod a felkérést?',
      icon: 'pi pi-exclamation-triangle',
      message:
        'A felkérés törlésével az összes videó, stábtag, hozzászólás és értékelés is törlésre kerül. A művelet visszavonhatatlan!',
      style: { width: isMobile ? '95vw' : '50vw' },
    });
  };

  const onJumpToTabView = (tabViewIndex: number) => {
    setTabViewActiveIndex(tabViewIndex);
    const tabViewEl = document.getElementById(
      'comments-crew-videos-history-tabs'
    );
    // Workaround for: https://github.com/primefaces/primereact/issues/4034
    setTimeout(() => {
      tabViewEl?.scrollIntoView({ behavior: 'smooth' });
    }, 5);
  };

  const [data, setData] = useState<RequestDataType>(getRequest(testData));

  const videoDataHeader = (
    <div
      className={classNames(
        'align-items-center flex flex-wrap',
        isMobile ? 'justify-content-start' : ' justify-content-end'
      )}
    >
      <LinkButton
        buttonProps={{
          className: isMobile ? 'w-full' : '',
          icon: 'pi pi-plus',
          label: 'Új videó',
        }}
        linkProps={{
          className: isMobile ? 'w-full' : '',
          to: `/requests/${data.id}/videos/new`,
        }}
      />
    </div>
  );

  const {
    control: recordingContentControl,
    handleSubmit: recordingContentHandleSubmit,
    reset: recordingContentReset,
  } = useForm<RequestAdditionalDataRecordingType>({
    defaultValues: {
      copied_to_gdrive: data.additional_data.recording?.copied_to_gdrive,
      path: data.additional_data.recording?.path,
      removed: data.additional_data.recording?.removed,
    },
  });

  const onSubmit: SubmitHandler<RequestAdditionalDataRecordingType> = (
    data
  ) => {
    setLoading(true);
    console.log(data);

    // TODO: Use real API call
    setTimeout(() => {
      setRecordingIsEditing(false);
      setLoading(false);
    }, 1000);
  };

  const onRecordingDataCancel = () => {
    setRecordingIsEditing(false);
    recordingContentReset();
  };

  useEffect(() => {
    // Workaround for: https://github.com/primefaces/primereact/issues/4034
    window.scrollTo(0, 0);
  }, []);

  return (
    <>
      <RequestStatusHelperSlideover
        adminStatusOverride={!!data.additional_data.status_by_admin?.status}
        allVideosDone={false} //TODO: Check real videos
        copiedToDrive={!!data.additional_data.recording?.copied_to_gdrive}
        id="requestStatusHelper"
        status={data.status}
      />
      <ConfirmDialog />
      <AdditionalDataDialog
        data={data.additional_data}
        loading={loading}
        onHide={() => setAdditionalDataDialogOpen(false)}
        onSave={onAdditionalDataSave}
        visible={additionalDataDialogOpen}
      />
      <AcceptRejectDialog
        accepted={data.additional_data.accepted}
        canceled={data.additional_data.canceled}
        loading={loading}
        failed={data.additional_data.failed}
        onHide={() => setAcceptRejectDialogOpen(false)}
        onSave={onAcceptRejectSave}
        visible={acceptRejectDialogOpen}
      />
      <div className="p-3 sm:p-5 surface-ground">
        <div className="flex flex-column mb-3 sm:align-items-center sm:flex-row sm:justify-content-between">
          <div>
            <div className="font-medium mb-2 text-900 text-xl">
              {data.title}
            </div>
            <div className="font-medium mb-3 sm:mb-0 text-500 text-sm">
              <RequestStatusTag statusNum={data.status} />
            </div>
          </div>
          <div className="flex">
            <StyleClass
              enterActiveClassName="fadeinleft"
              enterClassName="hidden"
              hideOnOutsideClick
              leaveActiveClassName="fadeoutleft"
              leaveToClassName="hidden"
              nodeRef={statusHelperSlideoverOpenBtnRef}
              selector="#requestStatusHelper"
            >
              <Button
                className="mr-2 p-button-rounded p-button-help"
                icon="pi pi-question"
                ref={statusHelperSlideoverOpenBtnRef}
              />
            </StyleClass>
            <Button
              className="mr-2 p-button-rounded p-button-secondary"
              icon="pi pi-sliders-h"
              onClick={() => setAdditionalDataDialogOpen(true)}
            />
            <Button
              className="mr-2 p-button-warning p-button-rounded"
              icon="pi pi-external-link"
              onClick={() => setAcceptRejectDialogOpen(true)}
            />
            <LinkButton
              buttonProps={{
                className: 'mr-2 p-button p-button-rounded',
                icon: 'pi pi-pencil',
              }}
              linkProps={{ to: `/requests/${requestId}/edit` }}
            />
            <Button
              className="p-button-danger p-button-rounded"
              icon="pi pi-trash"
              onClick={onDelete}
            />
          </div>
        </div>
        <div className="border-round p-2 shadow-2 sm:p-3 surface-card">
          <ul className="list-none p-0 m-0">
            <DetailsRow
              content={data.title}
              firstElement
              label="Esemény neve"
            />
            <DetailsRow
              content={<RequestStatusTag statusNum={data.status} />}
              label="Státusz"
            />
            <DetailsRow
              content={dateTimeToLocaleString(data.start_datetime)}
              label="Kezdés időpontja"
            />
            <DetailsRow
              content={dateTimeToLocaleString(data.end_datetime)}
              label="Várható befejezés"
            />
            <DetailsRow content={data.place} label="Helyszín" />
            <DetailsRow content={data.type} label="Típus" />
            <DetailsRow
              button={
                <RequesterContentButtons
                  requestTitle={data.title}
                  requester={data.requester}
                />
              }
              content={
                <RequesterContent
                  additionalData={data.additional_data}
                  requester={data.requester}
                />
              }
              label="Felkérő"
            />
            <DetailsRow
              content={dateToLocaleString(data.deadline)}
              label="Határidő"
            />
            <DetailsRow
              button={
                data.responsible && (
                  <LinkButton
                    buttonProps={{
                      className: 'p-button-sm p-button-text px-1 py-0',
                      icon: 'pi pi-user',
                      label: 'Profil',
                    }}
                    linkProps={{ to: `/users/${data.responsible?.id}` }}
                  />
                )
              }
              content={
                data.responsible ? (
                  <User
                    name={data.responsible.full_name}
                    imageUrl={data.responsible.profile.avatar_url}
                  />
                ) : (
                  <Tag
                    className="mr-2"
                    icon="pi pi-exclamation-triangle"
                    severity="warning"
                    value="Nincs felelős"
                  />
                )
              }
              label="Felelős"
            />
            <DetailsRow
              button={<JumpButton onClick={() => onJumpToTabView(0)} />}
              content={
                <Badge
                  severity={data.comments > 0 ? 'warning' : 'info'}
                  value={data.comments}
                />
              }
              label="Hozzászólások"
            />
            <DetailsRow
              button={<JumpButton onClick={() => onJumpToTabView(1)} />}
              content={
                data.crew && data.crew.length > 0 ? (
                  <AvatarGroupCrew crew={data.crew} />
                ) : (
                  <Tag
                    className="mr-2"
                    icon="pi pi-exclamation-triangle"
                    severity="warning"
                    value="Nincs stáb"
                  />
                )
              }
              label="Stáb"
            />
            <DetailsRow
              button={
                <RecordingContentButtons
                  editing={recordingIsEditing}
                  editOnCancel={() => onRecordingDataCancel()}
                  editOnClick={() => setRecordingIsEditing(true)}
                  editOnSave={recordingContentHandleSubmit(onSubmit)}
                  loading={loading}
                  recordingPath={data.additional_data.recording?.path}
                />
              }
              content={
                <RecordingContent
                  control={recordingContentControl}
                  copied_to_gdrive={
                    data.additional_data.recording?.copied_to_gdrive
                  }
                  editing={recordingIsEditing}
                  loading={loading}
                  path={data.additional_data.recording?.path}
                  recommendedPath={generateRecordingPath()}
                  removed={data.additional_data.recording?.removed}
                />
              }
              label="Nyersek"
            />
            <DetailsRow
              button={<JumpButton onClick={() => onJumpToTabView(2)} />}
              content={
                <Badge
                  value={data.videos}
                  severity={data.videos > 0 ? 'success' : 'danger'}
                />
              }
              label="Videók"
            />
            <DetailsRow
              button={
                <LinkButton
                  buttonProps={{
                    className: 'p-button-sm p-button-text px-1 py-0',
                    icon: 'pi pi-user',
                    label: 'Profil',
                  }}
                  linkProps={{ to: `/users/${data.requested_by.id}` }}
                />
              }
              content={
                <User
                  name={data.requested_by.full_name}
                  imageUrl={data.requested_by.profile.avatar_url}
                />
              }
              label="Beküldő"
            />
            <DetailsRow
              content={dateTimeToLocaleString(data.created)}
              label="Beküldve"
            />
          </ul>
          <TabView
            activeIndex={tabViewActiveIndex}
            className="pt-3"
            id="comments-crew-videos-history-tabs"
            onTabChange={(e) => setTabViewActiveIndex(e.index)}
            panelContainerClassName="border-bottom-1 surface-border"
          >
            <TabPanel header="Hozzászólások" leftIcon="pi pi-comments mr-2">
              <p className="m-0">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
                eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut
                enim ad minim veniam, quis nostrud exercitation ullamco laboris
                nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor
                in reprehenderit in voluptate velit esse cillum dolore eu fugiat
                nulla pariatur. Excepteur sint occaecat cupidatat non proident,
                sunt in culpa qui officia deserunt mollit anim id est laborum.
              </p>
            </TabPanel>
            <TabPanel header="Stáb" leftIcon="pi pi-users mr-2">
              <p className="m-0">
                At vero eos et accusamus et iusto odio dignissimos ducimus qui
                blanditiis praesentium voluptatum deleniti atque corrupti quos
                dolores et quas molestias excepturi sint occaecati cupiditate
                non provident, similique sunt in culpa qui officia deserunt
                mollitia animi, id est laborum et dolorum fuga. Et harum quidem
                rerum facilis est et expedita distinctio. Nam libero tempore,
                cum soluta nobis est eligendi optio cumque nihil impedit quo
                minus.
              </p>
            </TabPanel>
            <TabPanel header="Videók" leftIcon="pi pi-video mr-2">
              <Suspense fallback={<ProgressBar mode="indeterminate" />}>
                <VideosDataTable header={videoDataHeader} requestId={data.id} />
              </Suspense>
            </TabPanel>
            <TabPanel header="Előzmények" leftIcon="pi pi-history mr-2">
              <p className="m-0">Hamarosan...</p>
            </TabPanel>
          </TabView>
        </div>
      </div>
    </>
  );
};

export default RequestDetailsPage;
