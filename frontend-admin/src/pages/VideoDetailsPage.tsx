import { Suspense, lazy, useRef, useState } from 'react';

import { Button } from 'primereact/button';
import { Chip } from 'primereact/chip';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import { ProgressBar } from 'primereact/progressbar';
import { StyleClass } from 'primereact/styleclass';
import { Tag } from 'primereact/tag';
import { classNames } from 'primereact/utils';
import { useLoaderData, useNavigate, useParams } from 'react-router-dom';

import { VideoAdminRetrieve } from 'api/models';
import { requestVideoRetrieveQuery } from 'api/queries';
import DetailsRow from 'components/Details/DetailsRow';
import LinkButton from 'components/LinkButton/LinkButton';
import { VideoStatusTag } from 'components/StatusTag/StatusTag';
import User from 'components/User/User';
import useMobile from 'hooks/useMobile';
import { queryClient } from 'router';

const AdditionalDataDialog = lazy(
  () => import('components/AdditionalDataDialog/AdditionalDataDialog'),
);
const AiredAddDialog = lazy(
  () => import('components/Details/Video/AiredAddDialog'),
);
const Ratings = lazy(() => import('components/Details/Video/Ratings'));
const VideoStatusHelperSlideover = lazy(
  () => import('components/StatusHelperSlideover/VideoStatusHelperSlideover'),
);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function loader({ params }: any) {
  const query = requestVideoRetrieveQuery(
    Number(params.requestId),
    Number(params.videoId),
  );
  return (
    queryClient.getQueryData(query.queryKey) ??
    (await queryClient.fetchQuery(query))
  );
}

const VideoDetailsPage = () => {
  const { requestId, videoId } = useParams();
  const isMobile = useMobile();
  const navigate = useNavigate();

  const data = useLoaderData() as VideoAdminRetrieve;

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

  return (
    <>
      <Suspense>
        <AdditionalDataDialog
          data={data.additional_data}
          loading={loading}
          onHide={() => setAdditionalDataDialogOpen(false)}
          onSave={onAdditionalDataSave}
          visible={additionalDataDialogOpen}
        />
      </Suspense>
      <Suspense>
        <AiredAddDialog
          loading={loading}
          onHide={() => setAiredAddDialogOpen(false)}
          onSave={onAiredDateSave}
          visible={airedAddDialogOpen}
        />
      </Suspense>
      <Suspense>
        <VideoStatusHelperSlideover
          adminStatusOverride={!!data.additional_data.status_by_admin?.status}
          editor={!!data.editor}
          id="videoStatusHelper"
          status={data.status}
        />
      </Suspense>
      <ConfirmDialog />
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
                    imageUrl={data.editor.avatar_url}
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
                    data.additional_data.aired.map((value: string) => (
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
          <Suspense
            fallback={
              <div className="pb-2 pt-4 px-2">
                <ProgressBar mode="indeterminate" />
              </div>
            }
          >
            <div className="md:pt-6 pt-4 px-2">
              <Ratings
                avgRating={data.avg_rating}
                requestId={Number(requestId)}
                videoId={Number(videoId)}
                videoTitle={data.title}
              />
            </div>
          </Suspense>
        </div>
      </div>
    </>
  );
};

export { VideoDetailsPage as Component };
