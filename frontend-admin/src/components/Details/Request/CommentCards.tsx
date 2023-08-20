import { Dispatch, SetStateAction, useEffect, useState } from 'react';

import { yupResolver } from '@hookform/resolvers/yup';
import { Avatar } from 'primereact/avatar';
import { Button } from 'primereact/button';
import { confirmDialog } from 'primereact/confirmdialog';
import { InputTextarea } from 'primereact/inputtextarea';
import { SelectButton } from 'primereact/selectbutton';
import { Tag } from 'primereact/tag';
import { Tooltip } from 'primereact/tooltip';
import { classNames } from 'primereact/utils';
import { Control, Controller, useForm } from 'react-hook-form';
import TimeAgo from 'timeago-react';
import * as yup from 'yup';

import { dateTimeToLocaleString } from 'helpers/DateToLocaleStringCoverters';
import useMobile from 'hooks/useMobile';
import { useTheme } from 'hooks/useTheme';

const UI_AVATAR_URL = 'https://ui-avatars.com/api/?background=random&name='; // TODO: make global

// TODO: Review props
type CommentCardProps = CommentCardHeaderProps & {
  commentId: number;
  isInternal?: boolean;
  setEditing: Dispatch<SetStateAction<number>>;
  showButtons?: boolean;
  text: string;
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
  children: JSX.Element[] | JSX.Element;
  isInternal?: boolean;
  isLastItem?: boolean;
};

type CommentCardsProps = {
  requestId: number;
  requesterId: number;
};

interface CommentData {
  id: number;
  text: string;
  internal: boolean;
  created: Date;
  author: {
    id: number;
    full_name: string;
    avatar_url?: string;
  };
}

interface IComment {
  internal: boolean;
  text: string;
}

interface InternalOption {
  className: string;
  icon: string;
  value: boolean;
}

const validationSchema = yup.object({
  text: yup.string().trim().required('Üres hozzászólás nem küldhető be!'),
});

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
                className="ml-2"
                itemTemplate={internalTemplate}
                optionLabel="value"
                options={internalOptions}
                {...field}
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
  setEditing,
  showButtons,
  text,
}: CommentCardProps) => {
  const [loading, setLoading] = useState<boolean>(false);
  const isMobile = useMobile();

  const handleDelete = (commentId: number) => {
    setLoading(true);
    console.log('Deleting comment... ' + commentId);

    // TODO: Use real API call
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  };

  const onCommentDelete = () => {
    confirmDialog({
      accept: () => handleDelete(commentId),
      acceptClassName: 'p-button-danger',
      header: 'Biztosan törölni akarod a hozzászólást?',
      icon: 'pi pi-exclamation-triangle',
      message:
        'Az alábbi hozzászólás visszavonhatatlanul törlés fog kerülni:\n\n' +
        text,
      style: { whiteSpace: 'pre-wrap', width: isMobile ? '95vw' : '50vw' },
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
            onClick={() => onCommentDelete()}
            severity="danger"
            size="small"
            text
          />
          <Button
            className="ml-2 p-1"
            disabled={loading}
            icon="pi pi-pencil"
            label="Szerkesztés"
            onClick={() => setEditing(commentId)}
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
  setEditing,
  text,
}: CommentCardProps) => {
  const [loading, setLoading] = useState<boolean>(false);
  const { control, handleSubmit, watch } = useForm<IComment>({
    defaultValues: { internal: !!isInternal, text: text },
    resolver: yupResolver(validationSchema),
    shouldFocusError: false,
  });

  const onSubmit = (data: IComment) => {
    setLoading(true);
    console.log(
      'Updating comment... ' +
        commentId +
        ' ' +
        data.text +
        ' ' +
        data.internal,
    );
    setTimeout(() => {
      setLoading(false);
      setEditing(0);
    }, 1000);
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
      <form className="align-content-center flex flex-wrap justify-content-between">
        <Controller
          control={control}
          name="text"
          render={({ field, fieldState }) => (
            <>
              <InputTextarea
                autoResize
                className={classNames('mb-2 w-full', {
                  'p-invalid': fieldState.error,
                })}
                disabled={loading}
                id={field.name}
                rows={5}
                {...field}
              />
              {fieldState.error ? (
                <small className="p-error pt-1 mr-1">
                  {fieldState.error?.message}
                </small>
              ) : (
                <small className="p-error">&nbsp;</small>
              )}
            </>
          )}
        />
        <div className="flex flex-wrap">
          <Button
            className="p-1"
            disabled={loading}
            icon="pi pi-times"
            label="Mégsem"
            onClick={() => setEditing(0)}
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
            onClick={handleSubmit(onSubmit)}
            size="small"
            text
            type="button"
          />
        </div>
      </form>
    </CommentCardWrapper>
  );
};
const CommentCardNew = ({ authorName, avatarUrl }: CommentCardHeaderProps) => {
  const [loading, setLoading] = useState<boolean>(false);
  const { control, handleSubmit, reset, watch } = useForm<IComment>({
    defaultValues: { internal: false, text: '' },
    resolver: yupResolver(validationSchema),
    shouldFocusError: false,
  });

  const onSubmit = (data: IComment) => {
    setLoading(true);
    console.log('Creating comment... ' + data.text + ' ' + data.internal);
    setTimeout(() => {
      setLoading(false);
      reset();
    }, 1000);
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
                itemTemplate={internalTemplate}
                optionLabel="value"
                options={internalOptions}
                {...field}
              />
            )}
          />
        </div>
      </div>
      <form className="align-content-center flex flex-wrap justify-content-between">
        <Controller
          control={control}
          name="text"
          render={({ field, fieldState }) => (
            <>
              <InputTextarea
                autoResize
                className={classNames('mb-2 w-full', {
                  'p-invalid': fieldState.error,
                })}
                disabled={loading}
                id={field.name}
                rows={5}
                {...field}
              />
              {fieldState.error ? (
                <small className="p-error pt-1 mr-1">
                  {fieldState.error?.message}
                </small>
              ) : (
                <small className="p-error">&nbsp;</small>
              )}
            </>
          )}
        />
        <Button
          className="p-1"
          icon="pi pi-send"
          label="Küldés"
          loading={loading}
          onClick={handleSubmit(onSubmit)}
          size="small"
          text
          type="button"
        />
      </form>
    </CommentCardWrapper>
  );
};

const CommentCards = ({ requestId, requesterId }: CommentCardsProps) => {
  const getComments = (data: CommentData[]) => {
    return data.map((el) => ({ ...el, created: new Date(el.created) }));
  };
  const [data, setData] = useState<CommentData[]>(getComments([]));
  const [editingId, setEditingId] = useState<number>(0);

  useEffect(() => {
    console.log('Loading comments for ' + requestId);
  }, [requestId]);

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
            setEditing={setEditingId}
            showButtons // TODO: Only show if own or admin
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
            setEditing={setEditingId}
            text={comment.text}
          />
        ),
      )}
      <CommentCardNew authorName="Teszt Elek" />
    </>
  );
};

export default CommentCards;
