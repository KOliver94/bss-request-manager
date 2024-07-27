import { lazy, MouseEventHandler, useState } from 'react';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { isAxiosError } from 'axios';
import { Button } from 'primereact/button';
import { confirmDialog } from 'primereact/confirmdialog';
import {
  Panel,
  PanelFooterTemplateOptions,
  PanelHeaderTemplateOptions,
} from 'primereact/panel';
import { Tooltip } from 'primereact/tooltip';
import { classNames } from 'primereact/utils';
import { Link } from 'react-router-dom';
import TimeAgo from 'timeago-react';

import { adminApi } from 'api/http';
import { TodoAdminListRetrieve } from 'api/models/todo-admin-list-retrieve';
import {
  requestTodoListQuery,
  requestVideoTodosListQuery,
  todosListQuery,
} from 'api/queries';
import { TodoStatusTag } from 'components/StatusTag/StatusTag';
import { dateTimeToLocaleString } from 'helpers/DateToLocaleStringCoverters';
import { getErrorMessage } from 'helpers/ErrorMessageProvider';
import { getUserId, isAdmin } from 'helpers/LocalStorageHelper';
import useMobile from 'hooks/useMobile';
import { useToast } from 'providers/ToastProvider';

import TodoDialog from './TodoDialog';

const AvatarGroupCrew = lazy(() => import('components/Avatar/AvatarGroupCrew'));

type TodoProps = {
  data: TodoAdminListRetrieve;
  onEdit: MouseEventHandler<HTMLButtonElement>;
};

type TodosProps = {
  requestId?: number;
  videoId?: number;
};

const Todo = ({ data, onEdit }: TodoProps) => {
  const [loading, setLoading] = useState<boolean>(false);
  const { showToast } = useToast();
  const queryClient = useQueryClient();

  const handleDelete = async (todoId: number) => {
    setLoading(true);

    const invalidateQueries = async () => {
      await queryClient.invalidateQueries({
        queryKey: ['todos'],
      });
      await queryClient.invalidateQueries({
        queryKey: ['requests', data.request.id, 'todos'],
      });

      if (data.video) {
        await queryClient.invalidateQueries({
          queryKey: [
            'requests',
            data.request.id,
            'videos',
            data.video.id,
            'todos',
          ],
        });
      }
    };

    await adminApi
      .adminTodosDestroy(todoId)
      .then(async () => {
        await invalidateQueries();
      })
      .catch(async (error) => {
        if (isAxiosError(error) && error.response?.status === 404) {
          await invalidateQueries();
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

  const onTodoDelete = () => {
    confirmDialog({
      accept: () => handleDelete(data.id),
      acceptClassName: 'p-button-danger',
      breakpoints: { '768px': '95vw' },
      defaultFocus: 'reject',
      header: 'Biztosan törölni akarod a feladatot?',
      icon: 'pi pi-exclamation-triangle',
      message:
        'Az alábbi feladat visszavonhatatlanul törlés fog kerülni:\n\n' +
        data.description,
      style: { whiteSpace: 'pre-wrap', width: '50vw' },
    });
  };

  const headerTemplate = (options: PanelHeaderTemplateOptions) => {
    const className = `${options.className} justify-content-space-between surface-ground`;

    return (
      <div className={className}>
        <div className="flex flex-column gap-1">
          <Link
            className="cursor-pointer no-underline text-color"
            to={`/requests/${data.request.id}`}
          >
            <span className="font-bold">{data.request.title}</span>
          </Link>
          {data.video && (
            <Link
              className="cursor-pointer no-underline text-color"
              to={`/requests/${data.request.id}/videos/${data.video.id}`}
            >
              <span className="font-bold text-xs">{data.video.title}</span>
            </Link>
          )}
        </div>
        <div className="flex align-items-center gap-2">
          <AvatarGroupCrew crew={data.assignees} />
          <TodoStatusTag statusNum={data.status} />
        </div>
      </div>
    );
  };

  const footerTemplate = (options: PanelFooterTemplateOptions) => {
    const className = `${options.className} flex flex-wrap align-items-center justify-content-between gap-3`;

    return (
      <div className={className}>
        <Tooltip className="text-xs" target=".created-date-text" />
        <span
          className="created-date-text font-medium text-500 text-sm"
          data-pr-position="bottom"
          data-pr-tooltip={
            dateTimeToLocaleString(new Date(data.created)) +
            '\n' +
            data.creator.full_name
          }
        >
          Létrehozva <TimeAgo datetime={data.created} locale="hu_HU" />
        </span>
        <div className="flex align-items-center gap-2">
          {(data.creator.id === getUserId() || isAdmin()) && (
            <Button
              className="p-1"
              icon="pi pi-trash"
              label="Törlés"
              loading={loading}
              onClick={() => {
                onTodoDelete();
              }}
              severity="danger"
              size="small"
              text
            />
          )}
          <Button
            className="ml-2 p-1"
            disabled={loading}
            icon="pi pi-pencil"
            label="Szerkesztés"
            onClick={onEdit}
            size="small"
            text
          />
        </div>
      </div>
    );
  };

  return (
    <Panel
      className="col-12 md:col-6 lg:col-4"
      footerTemplate={footerTemplate}
      headerTemplate={headerTemplate}
    >
      <p className="m-0">{data.description}</p>
    </Panel>
  );
};

const Todos = ({ requestId, videoId }: TodosProps) => {
  const isMobile = useMobile();
  const { data } = useQuery(
    requestId
      ? videoId
        ? requestVideoTodosListQuery(requestId, videoId)
        : requestTodoListQuery(requestId)
      : todosListQuery(),
  );
  const [todoDialogId, setTodoDialogId] = useState<number>(0);
  const [todoDialogVisible, setTodoDialogVisible] = useState<boolean>(false);

  const onTodoDialogHide = () => {
    setTodoDialogVisible(false);
    setTodoDialogId(0);
  };

  const onTodoEdit = (todoId: number) => {
    setTodoDialogVisible(true);
    setTodoDialogId(todoId);
  };

  return (
    <>
      <TodoDialog
        onHide={onTodoDialogHide}
        todoId={todoDialogId}
        requestId={requestId || 0}
        videoId={videoId}
        visible={todoDialogVisible}
      />
      <div
        className={classNames(
          'align-items-center border-1 flex flex-wrap mb-3 p-3 surface-border',
          isMobile ? 'justify-content-start' : ' justify-content-end',
        )}
      >
        <Button
          className={isMobile ? 'w-full' : ''}
          icon="pi pi-plus"
          label="Új feladat"
          onClick={() => {
            setTodoDialogVisible(true);
          }}
        />
      </div>
      <div className="grid">
        {(data?.length &&
          data.map((todo) => (
            <Todo
              data={todo}
              key={todo.id}
              onEdit={() => {
                onTodoEdit(todo.id);
              }}
            />
          ))) || <p className="pl-3 pt-2">Nincsenek elvégzendő feladatok.</p>}
      </div>
    </>
  );
};

export default Todos;
