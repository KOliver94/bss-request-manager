import { useEffect, useState } from 'react';

import { useMutation, useQuery } from '@tanstack/react-query';
import { isAxiosError } from 'axios';
import { Button } from 'primereact/button';
import { Divider } from 'primereact/divider';
import { InputMask } from 'primereact/inputmask';
import { InputText } from 'primereact/inputtext';
import { Message } from 'primereact/message';
import { ToggleButton } from 'primereact/togglebutton';
import { Controller, SubmitHandler, useForm } from 'react-hook-form';
import {
  useLoaderData,
  useNavigate,
  useParams,
  useRevalidator,
} from 'react-router-dom';

import { UserNestedDetail, VideoAdminRetrieve } from 'api/models';
import {
  requestVideoUpdateMutation,
  requestVideoCreateMutation,
} from 'api/mutations';
import { requestVideoRetrieveQuery } from 'api/queries';
import AutoCompleteStaff from 'components/AutoCompleteStaff/AutoCompleteStaff';
import FormField from 'components/FormField/FormField';
import LastUpdatedAt from 'components/LastUpdatedAt/LastUpdatedAt';
import { getErrorMessage } from 'helpers/ErrorMessageProvider';
import { useToast } from 'providers/ToastProvider';
import { queryClient } from 'router';

export interface IVideoCreator {
  additional_data: {
    archiving: {
      hq_archive: boolean;
    };
    coding: {
      website: boolean;
    };
    editing_done: boolean;
    length?: string;
    publishing: {
      website: string;
    };
  };
  editor: UserNestedDetail | null;
  title: string;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function loader({ params }: any) {
  if (params.requestId && params.videoId) {
    const query = requestVideoRetrieveQuery(
      Number(params.requestId),
      Number(params.videoId),
    );
    return (
      queryClient.getQueryData(query.queryKey) ??
      (await queryClient.fetchQuery(query))
    );
  }
  return null;
}

const VideoCreatorEditorPage = () => {
  const defaultValues = {
    additional_data: {
      archiving: {
        hq_archive: false,
      },
      coding: {
        website: false,
      },
      editing_done: false,
      length: undefined,
      publishing: {
        website: '',
      },
    },
    editor: null,
    id: 0,
    title: '',
  };

  const { control, handleSubmit, reset, setError } = useForm<IVideoCreator>({
    defaultValues,
    mode: 'onChange',
  });
  const { requestId, videoId } = useParams();
  const { showToast } = useToast();
  const { isPending, mutateAsync } = useMutation(
    requestId && videoId
      ? requestVideoUpdateMutation(Number(requestId), Number(videoId))
      : requestVideoCreateMutation(Number(requestId)),
  );
  const {
    data: queryData,
    dataUpdatedAt,
    error,
  } = requestId && videoId
    ? useQuery({
        ...requestVideoRetrieveQuery(Number(requestId), Number(videoId)),
        refetchInterval: 1000 * 30,
      })
    : { data: undefined, dataUpdatedAt: new Date(), error: null };

  const [isDataChanged, setIsDataChanged] = useState<boolean>(false);

  const loaderData = useLoaderData() as VideoAdminRetrieve;
  const navigate = useNavigate();
  const revalidator = useRevalidator();

  useEffect(() => {
    if (loaderData) {
      setIsDataChanged(false);
      reset({
        ...defaultValues,
        ...loaderData,
        additional_data: {
          ...loaderData.additional_data,
          length: loaderData.additional_data.length
            ? new Date(1000 * loaderData.additional_data.length)
                .toISOString()
                .substring(11, 19)
            : undefined,
        },
      });
    }
  }, [loaderData]);

  useEffect(() => {
    if (requestId && videoId && loaderData !== queryData) {
      setIsDataChanged(true);
    }
  }, [queryData]);

  const onReload = () => {
    revalidator.revalidate();
  };

  const onSubmit: SubmitHandler<IVideoCreator> = async (data) => {
    const prevAdditionalData = videoId ? queryData?.additional_data : {};

    let length = {};
    if (data.additional_data.length) {
      const [hours, minutes, seconds] = data.additional_data.length.split(':');
      length = {
        length:
          Number(hours) * 60 * 60 + Number(minutes) * 60 + Number(seconds),
      };
    }

    await mutateAsync({
      ...data,
      additional_data: {
        ...prevAdditionalData,
        ...data.additional_data,
        ...length,
      },
      editor: data.editor?.id || null,
    })
      .then(async (response) => {
        showToast({
          detail: `Videó ${requestId ? 'módosítva' : 'létrehozva'}`,
          life: 3000,
          severity: 'success',
          summary: 'Siker',
        });

        if (videoId) {
          await queryClient.invalidateQueries({
            queryKey: [
              'requests',
              Number(requestId),
              'videos',
              Number(videoId),
            ],
          });
        } else {
          await queryClient.invalidateQueries({
            queryKey: ['requests', Number(requestId), 'videos'],
          });
        }

        navigate(`/requests/${requestId}/videos/${response.data.id}`);
      })
      .catch((error) => {
        if (isAxiosError(error)) {
          if (error.response?.status === 404) {
            queryClient.invalidateQueries({
              queryKey: ['requests', Number(requestId), 'videos'],
            });
          } else if (error.response?.status === 400) {
            for (const [key, value] of Object.entries(error.response.data)) {
              // @ts-expect-error: Correct types will be sent in the API error response
              setError(key, { message: value, type: 'backend' });
            }
            return;
          }
        }
        showToast({
          detail: getErrorMessage(error),
          life: 3000,
          severity: 'error',
          summary: 'Hiba',
        });
      });
  };

  if (error) {
    if (isAxiosError(error)) {
      navigate('/error', {
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
    <div className="p-3 sm:p-5 surface-ground">
      <div className="font-medium mb-3 text-900 text-xl">Videó létrehozása</div>
      <form className="border-round p-3 p-fluid shadow-2 sm:p-4 surface-card">
        <div className="formgrid grid p-fluid">
          {isDataChanged && (
            <Message
              className="mb-4 w-full"
              severity="warn"
              text={
                <>
                  Változás történt az adatokban.{' '}
                  <a
                    className="cursor-pointer hover:dashed underline"
                    onClick={onReload}
                  >
                    Újratöltés
                  </a>
                </>
              }
            />
          )}
          <FormField
            className="col-12 mb-0"
            control={control}
            label="Videó címe"
            name="title"
            rules={{
              maxLength: 200,
              required: true,
              validate: (value) => {
                return !!value.trim();
              },
            }}
          >
            <InputText
              autoFocus
              disabled={isPending}
              placeholder="Ahogy a weboldalra felkerül"
              type="text"
            />
          </FormField>
          <Divider align="center" type="dashed">
            <b>Opcionális mezők</b>
          </Divider>
          <FormField
            className="col-12 mb-4 md:col-6"
            control={control}
            label="Vágó"
            name="editor"
          >
            <AutoCompleteStaff disabled={isPending} />
          </FormField>
          <FormField
            className="col-12 mb-4 md:col-6"
            control={control}
            icon="pi-clock"
            label="Videó hossza"
            name="additional_data.length"
          >
            <InputMask
              disabled={isPending}
              mask="99:99:99"
              placeholder="hh:mm:ss"
              type="text"
            />
          </FormField>
          <FormField
            className="col-12 mb-0"
            control={control}
            icon="pi-globe"
            label="Videó elérési útja"
            name="additional_data.publishing.website"
          >
            <InputText
              disabled={isPending}
              placeholder="A videó linkje (honlap, YouTube, Google Drive, stb.)"
              type="text"
            />
          </FormField>
          <Divider />
          <Controller
            control={control}
            name="additional_data.editing_done"
            render={({ field }) => (
              <div className="col-12 mb-3 md:col-4 md:mb-0">
                <ToggleButton
                  checked={field.value || false}
                  className="w-full"
                  disabled={isPending}
                  id={field.name}
                  offIcon="bi bi-scissors"
                  offLabel="Vágandó"
                  onChange={field.onChange}
                  onIcon="bi bi-scissors"
                  onLabel="Megvágva"
                />
              </div>
            )}
          />
          <Controller
            control={control}
            name="additional_data.coding.website"
            render={({ field }) => (
              <div className="col-12 mb-3 md:col-4 md:mb-0">
                <ToggleButton
                  checked={field.value || false}
                  className="w-full"
                  disabled={isPending}
                  id={field.name}
                  offIcon="bi bi-file-earmark-play"
                  offLabel="Kódolásra vár"
                  onChange={field.onChange}
                  onIcon="bi bi-file-earmark-play"
                  onLabel="Kikódolva"
                />
              </div>
            )}
          />
          <Controller
            control={control}
            name="additional_data.archiving.hq_archive"
            render={({ field }) => (
              <div className="col-12 md:col-4">
                <ToggleButton
                  checked={field.value || false}
                  className="w-full"
                  disabled={isPending}
                  id={field.name}
                  offIcon="bi bi-archive"
                  offLabel="Archiválandó"
                  onChange={field.onChange}
                  onIcon="bi bi-archive"
                  onLabel="Archiválva"
                />
              </div>
            )}
          />
          <Divider />
          <Button
            className="w-auto"
            icon="pi pi-save"
            label="Mentés"
            loading={isPending}
            onClick={handleSubmit(onSubmit)}
          />
        </div>
      </form>
      <LastUpdatedAt lastUpdatedAt={new Date(dataUpdatedAt)} />
    </div>
  );
};

export { VideoCreatorEditorPage as Component };
