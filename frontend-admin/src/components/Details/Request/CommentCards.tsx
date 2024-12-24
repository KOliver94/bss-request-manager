import React, { Dispatch, SetStateAction, useState } from 'react';

import {
  DefinedUseQueryResult,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { isAxiosError } from 'axios';
import { Avatar } from 'primereact/avatar';
import { Button } from 'primereact/button';
import { confirmDialog } from 'primereact/confirmdialog';
import { InputTextarea } from 'primereact/inputtextarea';
import { SelectButton } from 'primereact/selectbutton';
import { Tag } from 'primereact/tag';
import { Tooltip } from 'primereact/tooltip';
import { classNames } from 'primereact/utils';
import type { IconType } from 'primereact/utils';
import { Controller, useForm } from 'react-hook-form';
import type { Control } from 'react-hook-form';

import { adminApi } from 'api/http';
import { CommentAdminListRetrieve } from 'api/models';
import {
  requestCommentCreateMutation,
  requestCommentUpdateMutation,
} from 'api/mutations';
import { requestCommentsListQuery } from 'api/queries';
import { dateTimeToLocaleString } from 'helpers/DateToLocaleStringCoverters';
import { getErrorMessage } from 'helpers/ErrorMessageProvider';
import {
  getAvatar,
  getName,
  getUserId,
  isAdmin,
} from 'helpers/LocalStorageHelper';
import TimeAgo from 'helpers/TimeAgo';
import { useTheme } from 'hooks/useTheme';
import { UI_AVATAR_URL } from 'localConstants';
import { useToast } from 'providers/ToastProvider';

// TODO: Review props
type CommentCardProps = CommentCardCreateProps & {
  commentId: number;
  isInternal?: boolean;
  setEditing: Dispatch<SetStateAction<number>>;
  showButtons?: boolean;
  text: string;
};

type CommentCardCreateProps = CommentCardHeaderProps & {
  requestId: number;
};

type CommentCardHeaderProps = {
  authorName: string;
  avatarUrl?: string;
  control?: Control<IComment>;
  creationDate?: Date;
  isEditing?: boolean;
  isRequester?: boolean;
};

type CommentCardWrapperProps = {
  children: React.JSX.Element[] | React.JSX.Element;
  isInternal?: boolean;
  isLastItem?: boolean;
};

type CommentCardsProps = {
  requestId: number;
  requesterId: number;
};

interface IComment {
  internal: boolean;
  text: string;
}

interface InternalOption {
  className: string;
  icon: IconType<InternalOption>;
  value: boolean;
}

const internalOptions = [
  { className: 'p-2', icon: 'pi pi-lock', value: true },
  { className: 'p-2', icon: 'pi pi-lock-open', value: false },
];

const internalTemplate = (option: InternalOption) => {
  return <i className={classNames('text-xs', option.icon)}></i>;
};

const CommentCardHeader = ({
  authorName,
  avatarUrl,
  control,
  creationDate,
  isEditing,
  isRequester,
}: CommentCardHeaderProps) => {
  return (
    <div className="grid pb-2">
      <div className="align-items-center col-12 flex justify-content-between md:col-6 md:justify-content-start">
        <Tooltip className="text-xs" target=".created-date-text" />
        <div className="align-items-center flex">
          <Avatar
            className="flex-shrink-0 h-2rem mr-2 w-2rem"
            icon="pi pi-user"
            image={avatarUrl || UI_AVATAR_URL + authorName}
            shape="circle"
          />
          <span className="font-medium mr-3 text-900">{authorName}</span>
        </div>
        {creationDate && (
          <span
            className="created-date-text font-medium text-500 text-sm"
            data-pr-position="bottom"
            data-pr-tooltip={dateTimeToLocaleString(creationDate)}
          >
            <TimeAgo datetime={creationDate} locale="hu_HU" />
          </span>
        )}
      </div>

      <div
        className={classNames(
          'align-items-center col-12 flex flex-wrap md:col-6 md:justify-content-end',
          {
            'justify-content-between': isEditing && isRequester,
            'justify-content-end': isEditing && !isRequester,
            'justify-content-start': !isEditing && isRequester,
            'p-0': !isEditing && !isRequester,
          },
        )}
      >
        {isRequester && (
          <Tag icon="pi pi-user" severity="info" value="Felkérő" />
        )}
        {isEditing && (
          <Controller
            control={control}
            name="internal"
            render={({ field }) => (
              <SelectButton
                {...field}
                allowEmpty={false}
                className="ml-2"
                itemTemplate={internalTemplate}
                optionLabel="value"
                options={internalOptions}
              />
            )}
          />
        )}
      </div>
    </div>
  );
};

const CommentCardWrapper = ({
  children,
  isInternal,
  isLastItem,
}: CommentCardWrapperProps) => {
  const [darkMode] = useTheme();

  return (
    <div className={isLastItem ? 'pb-0' : 'pb-3'}>
      <div
        className={classNames(
          'border-1 border-round p-3',
          isInternal ? 'border-dashed' : 'border-solid surface-border',
          {
            'border-blue-400 surface-50': isInternal && !darkMode,
            'border-blue-600 surface-0': isInternal && darkMode,
          },
        )}
      >
        {children}
      </div>
    </div>
  );
};

const CommentCard = ({
  authorName,
  avatarUrl,
  commentId,
  creationDate,
  isInternal,
  isRequester,
  requestId,
  setEditing,
  showButtons,
  text,
}: CommentCardProps) => {
  const [loading, setLoading] = useState<boolean>(false);
  const { showToast } = useToast();
  const queryClient = useQueryClient();

  const handleDelete = async (commentId: number) => {
    setLoading(true);

    await adminApi
      .adminRequestsCommentsDestroy(commentId, requestId)
      .then(async () => {
        await queryClient.invalidateQueries({
          queryKey: ['requests', requestId, 'comments'],
        });
      })
      .catch(async (error) => {
        if (isAxiosError(error) && error.response?.status === 404) {
          await queryClient.invalidateQueries({
            queryKey: ['requests', requestId, 'comments'],
          });
        }
        showToast({
          detail: getErrorMessage(error),
          life: 3000,
          severity: 'error',
          summary: 'Hiba',
        });
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const onCommentDelete = () => {
    confirmDialog({
      accept: () => handleDelete(commentId),
      acceptClassName: 'p-button-danger',
      breakpoints: { '768px': '95vw' },
      defaultFocus: 'reject',
      header: 'Biztosan törölni akarod a hozzászólást?',
      icon: 'pi pi-exclamation-triangle',
      message:
        'Az alábbi hozzászólás visszavonhatatlanul törlés fog kerülni:\n\n' +
        text,
      style: { whiteSpace: 'pre-wrap', width: '50vw' },
    });
  };

  return (
    <CommentCardWrapper isInternal={isInternal}>
      <CommentCardHeader
        authorName={authorName}
        avatarUrl={avatarUrl}
        creationDate={creationDate}
        isRequester={isRequester}
      />
      <p className="comment-text line-height-3 m-0 p-0 text-600">{text}</p>
      {showButtons ? (
        <div className="flex flex-wrap justify-content-end">
          <Button
            className="p-1"
            icon="pi pi-trash"
            label="Törlés"
            loading={loading}
            onClick={() => {
              onCommentDelete();
            }}
            severity="danger"
            size="small"
            text
          />
          <Button
            className="ml-2 p-1"
            disabled={loading}
            icon="pi pi-pencil"
            label="Szerkesztés"
            onClick={() => {
              setEditing(commentId);
            }}
            size="small"
            text
          />
        </div>
      ) : (
        <></>
      )}
    </CommentCardWrapper>
  );
};

const CommentCardEdit = ({
  authorName,
  avatarUrl,
  commentId,
  creationDate,
  isInternal,
  isRequester,
  requestId,
  setEditing,
  text,
}: CommentCardProps) => {
  const [loading, setLoading] = useState<boolean>(false);
  const { control, handleSubmit, setError, watch } = useForm<IComment>({
    defaultValues: { internal: !!isInternal, text: text },
    shouldFocusError: false,
  });
  const { mutateAsync } = useMutation(
    requestCommentUpdateMutation(requestId, commentId),
  );
  const queryClient = useQueryClient();

  const onSubmit = async (data: IComment) => {
    setLoading(true);

    await mutateAsync({ ...data })
      .then(async () => {
        await queryClient.invalidateQueries({
          queryKey: ['requests', requestId, 'comments'],
        });
        setEditing(0);
      })
      .catch(async (error) => {
        if (isAxiosError(error) && error.response?.status === 404) {
          await queryClient.invalidateQueries({
            queryKey: ['requests', requestId, 'comments'],
          });
          setEditing(0);
        } else {
          setError('text', {
            message: getErrorMessage(error),
            type: 'backend',
          });
        }
      })
      .finally(() => {
        setLoading(false);
      });
  };

  return (
    <CommentCardWrapper isInternal={watch('internal')}>
      <CommentCardHeader
        authorName={authorName}
        avatarUrl={avatarUrl}
        control={control}
        creationDate={creationDate}
        isEditing
        isRequester={isRequester}
      />
      <form
        className="align-content-center flex flex-wrap justify-content-between"
        onSubmit={handleSubmit(onSubmit)}
      >
        <Controller
          control={control}
          disabled={loading}
          name="text"
          render={({ field, fieldState }) => (
            <>
              <InputTextarea
                {...field}
                autoResize
                className={classNames('mb-2 w-full', {
                  'p-invalid': fieldState.error,
                })}
                id={field.name}
                rows={5}
              />
              {fieldState.error ? (
                <small className="p-error pt-1 mr-1">
                  {fieldState.error.message}
                </small>
              ) : (
                <small className="p-error">&nbsp;</small>
              )}
            </>
          )}
          rules={{
            required: 'Üres hozzászólás nem küldhető be!',
            validate: (value) =>
              !!value.trim() || 'Üres hozzászólás nem küldhető be!',
          }}
        />
        <div className="flex flex-wrap">
          <Button
            className="p-1"
            disabled={loading}
            icon="pi pi-times"
            label="Mégsem"
            onClick={() => {
              setEditing(0);
            }}
            severity="secondary"
            size="small"
            text
            type="button"
          />
          <Button
            className="ml-2 p-1"
            icon="pi pi-save"
            label="Mentés"
            loading={loading}
            size="small"
            text
            type="submit"
          />
        </div>
      </form>
    </CommentCardWrapper>
  );
};
const CommentCardNew = ({
  authorName,
  avatarUrl,
  requestId,
}: CommentCardCreateProps) => {
  const [loading, setLoading] = useState<boolean>(false);
  const { control, handleSubmit, reset, setError, watch } = useForm<IComment>({
    defaultValues: { internal: false, text: '' },
    shouldFocusError: false,
  });
  const { mutateAsync } = useMutation(requestCommentCreateMutation(requestId));
  const queryClient = useQueryClient();

  const onSubmit = async (data: IComment) => {
    setLoading(true);

    await mutateAsync({ ...data })
      .then(async () => {
        await queryClient.invalidateQueries({
          queryKey: ['requests', requestId, 'comments'],
        });
        reset();
      })
      .catch(async (error) => {
        // This should mean that the request no longer exists
        if (isAxiosError(error) && error.response?.status === 404) {
          await queryClient.invalidateQueries({
            queryKey: ['requests', requestId],
          });
        }
        setError('text', {
          message: getErrorMessage(error),
          type: 'backend',
        });
      })
      .finally(() => {
        setLoading(false);
      });
  };

  return (
    <CommentCardWrapper isInternal={watch('internal')} isLastItem>
      <div className="grid pb-2">
        <div className="align-items-center col-6 flex">
          <Avatar
            className="flex-shrink-0 h-2rem mr-2 w-2rem"
            icon="pi pi-user"
            image={avatarUrl || UI_AVATAR_URL + authorName}
            shape="circle"
          />
          <span className="font-medium mr-3 text-900">{authorName}</span>
        </div>

        <div className="align-items-center col-6 flex justify-content-end">
          <Controller
            control={control}
            name="internal"
            render={({ field }) => (
              <SelectButton
                {...field}
                allowEmpty={false}
                itemTemplate={internalTemplate}
                optionLabel="value"
                options={internalOptions}
              />
            )}
          />
        </div>
      </div>
      <form
        className="align-content-center flex flex-wrap justify-content-between"
        onSubmit={handleSubmit(onSubmit)}
      >
        <Controller
          control={control}
          disabled={loading}
          name="text"
          render={({ field, fieldState }) => (
            <>
              <InputTextarea
                {...field}
                autoResize
                className={classNames('mb-2 w-full', {
                  'p-invalid': fieldState.error,
                })}
                id={field.name}
                rows={5}
              />
              {fieldState.error ? (
                <small className="p-error pt-1 mr-1">
                  {fieldState.error.message}
                </small>
              ) : (
                <small className="p-error">&nbsp;</small>
              )}
            </>
          )}
          rules={{
            required: 'Üres hozzászólás nem küldhető be!',
            validate: (value) =>
              !!value.trim() || 'Üres hozzászólás nem küldhető be!',
          }}
        />
        <Button
          className="p-1"
          icon="pi pi-send"
          label="Küldés"
          loading={loading}
          size="small"
          text
          type="submit"
        />
      </form>
    </CommentCardWrapper>
  );
};

const CommentCards = ({ requestId, requesterId }: CommentCardsProps) => {
  const getComments = ({
    data,
  }: DefinedUseQueryResult<CommentAdminListRetrieve[]>) => {
    return data.map((el) => ({ ...el, created: new Date(el.created) }));
  };
  const data = getComments(useQuery(requestCommentsListQuery(requestId)));
  const [editingId, setEditingId] = useState<number>(0);

  return (
    <>
      {data.map((comment) =>
        editingId === comment.id ? (
          <CommentCardEdit
            authorName={comment.author.full_name}
            avatarUrl={comment.author.avatar_url}
            commentId={comment.id}
            creationDate={comment.created}
            isInternal={comment.internal}
            isRequester={requesterId === comment.author.id}
            key={comment.id}
            requestId={requestId}
            setEditing={setEditingId}
            text={comment.text}
          />
        ) : (
          <CommentCard
            authorName={comment.author.full_name}
            avatarUrl={comment.author.avatar_url}
            commentId={comment.id}
            creationDate={comment.created}
            isInternal={comment.internal}
            isRequester={requesterId === comment.author.id}
            key={comment.id}
            requestId={requestId}
            setEditing={setEditingId}
            showButtons={comment.author.id === getUserId() || isAdmin()}
            text={comment.text}
          />
        ),
      )}
      <CommentCardNew
        authorName={getName()}
        avatarUrl={getAvatar()}
        requestId={requestId}
      />
    </>
  );
};

export default CommentCards;
