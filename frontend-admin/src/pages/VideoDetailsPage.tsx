import { useRef, useState } from 'react';

import { Button } from 'primereact/button';
import { Chip } from 'primereact/chip';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import { StyleClass } from 'primereact/styleclass';
import { Tag } from 'primereact/tag';
import { classNames } from 'primereact/utils';
import { useNavigate, useParams } from 'react-router-dom';

import AdditionalDataDialog from 'components/AdditionalDataDialog/AdditionalDataDialog';
import DetailsRow from 'components/Details/DetailsRow';
import AiredAddDialog from 'components/Details/Video/AiredAddDialog';
import Ratings from 'components/Details/Video/Ratings';
import LinkButton from 'components/LinkButton/LinkButton';
import VideoStatusHelperSlideover from 'components/StatusHelperSlideover/VideoStatusHelperSlideover';
import { VideoStatusTag } from 'components/StatusTag/StatusTag';
import User from 'components/User/User';
import { UsersDataType } from 'components/UsersDataTable/UsersDataTable';
import useMobile from 'hooks/useMobile';
import * as testData from 'testData/testData_vid.json';

export type VideoAdditionalDataType = {
  aired?: [string];
  archiving?: {
    hq_archive?: boolean;
  };
  coding?: {
    website?: boolean;
  };
  editing_done: boolean;
  length?: number | null;
  publishing?: {
    website?: string;
  };
  status_by_admin?: {
    admin_id: number;
    admin_name: string;
    status: number | null;
  };
};

export type VideoDataType = {
  additional_data: VideoAdditionalDataType;
  avg_rating: number;
  editor: UsersDataType;
  id: number;
  status: 1 | 2 | 3 | 4 | 5 | 6;
  title: string;
};

const VideoDetailsPage = () => {
  const { requestId, videoId } = useParams();
  const isMobile = useMobile();
  const navigate = useNavigate();

  const [additionalDataDialogOpen, setAdditionalDataDialogOpen] =
    useState(false);
  const [airedAddDialogOpen, setAiredAddDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const statusHelperSlideoverOpenBtnRef = useRef(null);

  const handleDelete = () => {
    console.log('Deleting video...');

    // TODO: Use real API call
    setTimeout(() => {
      navigate('/requests/' + requestId);
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

  const onAiredDateSave = (data: { airedDate: Date }) => {
    console.log('Saving new aired date...');
    setLoading(true);

    // TODO: Use real API call
    setTimeout(() => {
      setAiredAddDialogOpen(false);
      setLoading(false);
    }, 1000);
  };

  const onDelete = () => {
    confirmDialog({
      accept: handleDelete,
      acceptClassName: 'p-button-danger',
      header: 'Biztosan törölni akarod a videót?',
      icon: 'pi pi-exclamation-triangle',
      message:
        'A videó törlésével az összes értékelés is törlésre kerül. A művelet visszavonhatatlan!',
      style: { width: isMobile ? '95vw' : '50vw' },
    });
  };

  const [data, setData] = useState<VideoDataType>(testData);

  return (
    <>
      <VideoStatusHelperSlideover
        adminStatusOverride={!!data.additional_data.status_by_admin?.status}
        editor={!!data.editor}
        id="videoStatusHelper"
        status={data.status}
      />
      <AiredAddDialog
        loading={loading}
        onHide={() => setAiredAddDialogOpen(false)}
        onSave={onAiredDateSave}
        visible={airedAddDialogOpen}
      />
      <ConfirmDialog />
      <AdditionalDataDialog
        data={data.additional_data}
        loading={loading}
        onHide={() => setAdditionalDataDialogOpen(false)}
        onSave={onAdditionalDataSave}
        visible={additionalDataDialogOpen}
      />
      <div className="p-3 sm:p-5 surface-ground">
        <div className="flex flex-column mb-3 sm:align-items-center sm:flex-row sm:justify-content-between">
          <div>
            <div className="font-medium mb-2 text-900 text-xl">
              {data.title}
            </div>
            <div className="font-medium mb-3 sm:mb-0 text-500 text-sm">
              <VideoStatusTag
                modified={!!data.additional_data.status_by_admin?.status}
                statusNum={data.status}
              />
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
              selector="#videoStatusHelper"
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
            <LinkButton
              buttonProps={{
                className: 'mr-2 p-button p-button-rounded',
                icon: 'pi pi-pencil',
              }}
              linkProps={{
                to: `/requests/${requestId}/videos/${videoId}/edit`,
              }}
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
            <DetailsRow content={data.title} firstElement label="Videó címe" />
            <DetailsRow
              content={
                <VideoStatusTag
                  modified={!!data.additional_data.status_by_admin?.status}
                  statusNum={data.status}
                />
              }
              label="Státusz"
            />
            <DetailsRow
              button={
                data.editor && (
                  <LinkButton
                    buttonProps={{
                      className: 'p-button-sm p-button-text px-1 py-0',
                      icon: 'pi pi-user',
                      label: 'Profil',
                    }}
                    linkProps={{ to: `/users/${data.editor?.id}` }}
                  />
                )
              }
              content={
                data.editor ? (
                  <User
                    name={data.editor.full_name}
                    imageUrl={data.editor.profile.avatar_url}
                  />
                ) : (
                  <Tag
                    className="mr-2"
                    icon="pi pi-exclamation-triangle"
                    severity="warning"
                    value="Nincs vágó"
                  />
                )
              }
              label="Vágó"
            />
            <DetailsRow
              content={
                data.additional_data.length ? (
                  new Date(data.additional_data.length * 1000)
                    .toISOString()
                    .slice(11, 19)
                ) : (
                  <Tag
                    className="mr-2"
                    icon="pi pi-exclamation-triangle"
                    severity="warning"
                    value="Nincs megadva"
                  />
                )
              }
              label="Videó hossza"
            />
            <DetailsRow
              button={
                data.additional_data.publishing?.website ? (
                  <LinkButton
                    buttonProps={{
                      className: 'p-button-sm p-button-text px-1 py-0',
                      icon: 'pi pi-angle-right',
                      label: 'Ugrás',
                    }}
                    linkProps={{
                      rel: 'noopener noreferrer',
                      target: '_blank',
                      to: data.additional_data.publishing.website,
                    }}
                  />
                ) : (
                  <></>
                )
              }
              content={
                data.additional_data.publishing?.website || (
                  <Tag
                    className="mr-2"
                    icon="pi pi-exclamation-triangle"
                    severity="warning"
                    value="Nincs publikálva"
                  />
                )
              }
              label="Elérési út"
            />
            <DetailsRow
              button={
                <Button
                  className="p-button-sm p-button-text px-1 py-0"
                  icon="pi pi-plus"
                  label="Hozzáadás"
                  onClick={() => setAiredAddDialogOpen(true)}
                />
              }
              content={
                <div className="flex flex-wrap gap-2">
                  {data.additional_data.aired ? (
                    data.additional_data.aired.map((value) => (
                      <Chip
                        key={value}
                        label={value}
                        icon={classNames({ 'pi pi-calendar': !isMobile })}
                        removable
                      />
                    ))
                  ) : (
                    <Tag
                      className="mr-2"
                      icon="pi pi-play"
                      severity="info"
                      value="Nem került még adásba"
                    />
                  )}
                </div>
              }
              label="Adásba került"
            />
            <DetailsRow
              content={
                <div className="flex flex-wrap gap-2">
                  <Tag
                    className="mr-2"
                    icon="bi bi-scissors"
                    severity={
                      data.additional_data.editing_done ? 'success' : 'warning'
                    }
                    value={
                      data.additional_data.editing_done
                        ? 'Megvágva'
                        : 'Vágásra vár'
                    }
                  />
                  <Tag
                    className="mr-2"
                    icon="bi bi-file-earmark-play"
                    severity={
                      data.additional_data.coding?.website
                        ? 'success'
                        : 'warning'
                    }
                    value={
                      data.additional_data.coding?.website
                        ? 'Kikódolva'
                        : 'Nincs kikódolva'
                    }
                  />
                  <Tag
                    className="mr-2"
                    icon="bi bi-archive"
                    severity={
                      data.additional_data.archiving?.hq_archive
                        ? 'success'
                        : 'warning'
                    }
                    value={
                      data.additional_data.archiving?.hq_archive
                        ? 'Archiválva'
                        : 'Nincs archiválva'
                    }
                  />
                </div>
              }
              label="Teendők"
            />
          </ul>
          <div className="md:pt-6 pt-4 px-2">
            <Ratings videoId={data.id} videoTitle={data.title} />
          </div>
        </div>
      </div>
    </>
  );
};

export default VideoDetailsPage;
