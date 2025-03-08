import { Semester } from 'helpers/SemesterHelper';

import { AdminTodosListStatusEnum } from './endpoints/admin-api';
import { adminApi } from './http';

export const requestCommentsListQuery = (requestId: string | number) => ({
  queryFn: async () => {
    const comments = await adminApi.adminRequestsCommentsList(
      Number(requestId),
      'created',
    );
    return comments.data;
  },
  queryKey: ['requests', Number(requestId), 'comments'],
  refetchInterval: 1000 * 30,
});

export const requestCrewListQuery = (requestId: string | number) => ({
  queryFn: async () => {
    const crew = await adminApi.adminRequestsCrewList(Number(requestId));
    return crew.data;
  },
  queryKey: ['requests', Number(requestId), 'crew'],
  refetchInterval: 1000 * 30,
});

export const requestHistoryListQuery = (requestId: string | number) => ({
  queryFn: async () => {
    const history = await adminApi.adminRequestsHistoryList(Number(requestId));
    return history.data;
  },
  queryKey: ['requests', Number(requestId), 'history'],
});

export const requestRetrieveQuery = (requestId: string | number) => ({
  queryFn: async () => {
    const request = await adminApi.adminRequestsRetrieve(Number(requestId));
    return request.data;
  },
  queryKey: ['requests', Number(requestId)],
  refetchInterval: 1000 * 60 * 5,
});

export const requestTodosListQuery = (requestId: string | number) => ({
  queryFn: async () => {
    const todos = await adminApi.adminRequestsTodosList(Number(requestId));
    return todos.data;
  },
  queryKey: ['requests', Number(requestId), 'todos'],
  refetchInterval: 1000 * 30,
});

export const requestVideoHistoryListQuery = (
  requestId: string | number,
  videoId: string | number,
) => ({
  queryFn: async () => {
    const history = await adminApi.adminRequestsVideosHistoryList(
      Number(videoId),
      Number(requestId),
    );
    return history.data;
  },
  queryKey: [
    'requests',
    Number(requestId),
    'videos',
    Number(videoId),
    'history',
  ],
});

export const requestVideosListQuery = (requestId: string | number) => ({
  queryFn: async () => {
    const videos = await adminApi.adminRequestsVideosList(Number(requestId));
    return videos.data;
  },
  queryKey: ['requests', Number(requestId), 'videos'],
  refetchInterval: 1000 * 30,
});

export const requestVideoRatingRetrieveOwnQuery = (
  requestId: string | number,
  videoId: string | number,
) => ({
  queryFn: async () => {
    const rating = await adminApi.adminRequestsVideosRatingsOwnRetrieve(
      Number(requestId),
      Number(videoId),
    );
    return rating.data;
  },
  queryKey: [
    'requests',
    Number(requestId),
    'videos',
    Number(videoId),
    'ratings',
    'own',
  ],
});

export const requestVideoRatingRetrieveQuery = (
  requestId: string | number,
  videoId: string | number,
  ratingId: string | number,
) => ({
  queryFn: async () => {
    const rating = await adminApi.adminRequestsVideosRatingsRetrieve(
      Number(ratingId),
      Number(requestId),
      Number(videoId),
    );
    return rating.data;
  },
  queryKey: [
    'requests',
    Number(requestId),
    'videos',
    Number(videoId),
    'ratings',
    Number(ratingId),
  ],
});

export const requestVideoRatingsListQuery = (
  requestId: string | number,
  videoId: string | number,
) => ({
  queryFn: async () => {
    const ratings = await adminApi.adminRequestsVideosRatingsList(
      Number(requestId),
      Number(videoId),
    );
    return ratings.data;
  },
  queryKey: [
    'requests',
    Number(requestId),
    'videos',
    Number(videoId),
    'ratings',
  ],
  refetchInterval: 1000 * 30,
});

export const requestVideoRetrieveQuery = (
  requestId: string | number,
  videoId: string | number,
) => ({
  queryFn: async () => {
    const video = await adminApi.adminRequestsVideosRetrieve(
      Number(videoId),
      Number(requestId),
    );
    return video.data;
  },
  queryKey: ['requests', Number(requestId), 'videos', Number(videoId)],
  refetchInterval: 1000 * 60 * 5,
});

export const requestVideoTodosListQuery = (
  requestId: string | number,
  videoId: string | number,
) => ({
  queryFn: async () => {
    const todos = await adminApi.adminRequestsVideosTodosList(
      Number(requestId),
      Number(videoId),
    );
    return todos.data;
  },
  queryKey: ['requests', Number(requestId), 'videos', Number(videoId), 'todos'],
  refetchInterval: 1000 * 30,
});

export const requestsListQuery = (semester: Semester | null) => {
  if (semester) {
    return {
      queryFn: async () => {
        const requests = await adminApi.adminRequestsList(
          undefined,
          undefined,
          undefined,
          undefined,
          200,
          undefined,
          undefined,
          semester.afterDate.toISOString().split('T')[0],
          semester.beforeDate.toISOString().split('T')[0],
        );
        return requests.data.results || [];
      },
      queryKey: [
        'requests',
        `${semester.afterDate.toISOString().split('T')[0]}/${
          semester.beforeDate.toISOString().split('T')[0]
        }`,
      ],
      refetchInterval: 1000 * 30,
    };
  }

  return {
    queryFn: async () => {
      const requests = await adminApi.adminRequestsList(
        undefined,
        undefined,
        undefined,
        undefined,
        10000,
      );
      return requests.data.results || [];
    },
    queryKey: ['requests'],
    refetchInterval: 1000 * 30,
  };
};

export const todosListQuery = (
  assignees: Array<number>,
  ordering: string,
  status: Array<number>,
) => ({
  queryFn: async () => {
    const todos = await adminApi.adminTodosList(
      assignees,
      ordering,
      undefined,
      10000,
      undefined,
      status as AdminTodosListStatusEnum[],
    );
    return todos.data.results;
  },
  queryKey: ['todos', assignees, ordering, status],
  refetchInterval: 1000 * 30,
});

export const todoRetrieveQuery = (todoId: string | number) => ({
  queryFn: async () => {
    const todo = await adminApi.adminTodosRetrieve(Number(todoId));
    return todo.data;
  },
  queryKey: ['todos', `id:${todoId}`],
  refetchInterval: 1000 * 60 * 5,
});

export const usersListQuery = () => ({
  queryFn: async () => {
    const users = await adminApi.adminUsersList(
      undefined,
      undefined,
      undefined,
      undefined,
      10000,
    );
    return users.data.results;
  },
  queryKey: ['users'],
  refetchInterval: 1000 * 30,
});

export const usersRetrieveQuery = (userId: string | number) => ({
  queryFn: async () => {
    const user = await adminApi.adminUsersRetrieve(Number(userId));
    return user.data;
  },
  queryKey: ['users', Number(userId)],
  refetchInterval: 1000 * 60 * 5,
});

export const usersStaffListQuery = () => ({
  cacheTime: 1000 * 60 * 60,
  queryFn: async () => {
    const usersStaff = await adminApi.adminUsersList(
      undefined,
      true,
      'full_name',
      undefined,
      10000,
    );
    return usersStaff.data.results || [];
  },
  queryKey: ['users', 'staff'],
});
