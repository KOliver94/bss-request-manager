import { Semester } from 'helpers/SemesterHelper';

import { adminApi } from './http';
import { dummyRequest, dummyVideo } from './placeholders';

export const requestCommentsListQuery = (requestId: number) => ({
  initialData: [],
  queryFn: async () => {
    const comments = await adminApi.adminRequestsCommentsList(
      requestId,
      'created',
    );
    return comments.data;
  },
  queryKey: ['requests', requestId, 'comments'],
  refetchInterval: 1000 * 30,
});

export const requestCrewListQuery = (requestId: number) => ({
  initialData: [],
  queryFn: async () => {
    const crew = await adminApi.adminRequestsCrewList(requestId);
    return crew.data;
  },
  queryKey: ['requests', requestId, 'crew'],
  refetchInterval: 1000 * 30,
});

export const requestHistoryListQuery = (requestId: number) => ({
  initialData: [],
  queryFn: async () => {
    const history = await adminApi.adminRequestsHistoryList(requestId);
    return history.data;
  },
  queryKey: ['requests', requestId, 'history'],
});

export const requestRetrieveQuery = (requestId: number) => ({
  initialData: dummyRequest,
  queryFn: async () => {
    const request = await adminApi.adminRequestsRetrieve(requestId);
    return request.data;
  },
  queryKey: ['requests', requestId],
  refetchInterval: 1000 * 60 * 5,
});

export const requestVideoHistoryListQuery = (
  requestId: number,
  videoId: number,
) => ({
  initialData: [],
  queryFn: async () => {
    const history = await adminApi.adminRequestsVideosHistoryList(
      videoId,
      requestId,
    );
    return history.data;
  },
  queryKey: ['requests', requestId, 'videos', videoId, 'history'],
});

export const requestVideosListQuery = (requestId: number) => ({
  initialData: [],
  queryFn: async () => {
    const videos = await adminApi.adminRequestsVideosList(requestId);
    return videos.data;
  },
  queryKey: ['requests', requestId, 'videos'],
  refetchInterval: 1000 * 30,
});

export const requestVideoRatingRetrieveOwnQuery = (
  requestId: number,
  videoId: number,
) => ({
  queryFn: async () => {
    const rating = await adminApi.adminRequestsVideosRatingsOwnRetrieve(
      requestId,
      videoId,
    );
    return rating.data;
  },
  queryKey: ['requests', requestId, 'videos', videoId, 'ratings', 'own'],
});

export const requestVideoRatingRetrieveQuery = (
  requestId: number,
  videoId: number,
  ratingId: number,
) => ({
  queryFn: async () => {
    const rating = await adminApi.adminRequestsVideosRatingsRetrieve(
      ratingId,
      requestId,
      videoId,
    );
    return rating.data;
  },
  queryKey: ['requests', requestId, 'videos', videoId, 'ratings', ratingId],
});

export const requestVideoRatingsListQuery = (
  requestId: number,
  videoId: number,
) => ({
  initialData: [],
  queryFn: async () => {
    const ratings = await adminApi.adminRequestsVideosRatingsList(
      requestId,
      videoId,
    );
    return ratings.data;
  },
  queryKey: ['requests', requestId, 'videos', videoId, 'ratings'],
  refetchInterval: 1000 * 30,
});

export const requestVideoRetrieveQuery = (
  requestId: number,
  videoId: number,
) => ({
  initialData: dummyVideo,
  queryFn: async () => {
    const video = await adminApi.adminRequestsVideosRetrieve(
      videoId,
      requestId,
    );
    return video.data;
  },
  queryKey: ['requests', requestId, 'videos', videoId],
  refetchInterval: 1000 * 60 * 5,
});

export const requestsListQuery = (semester: Semester | null) => {
  if (semester) {
    return {
      initialData: [],
      queryFn: async () => {
        const requests = await adminApi.adminRequestsList(
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
    initialData: [],
    queryFn: async () => {
      const requests = await adminApi.adminRequestsList(
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

export const usersListQuery = () => ({
  initialData: [],
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

export const usersStaffListQuery = () => ({
  cacheTime: 1000 * 60 * 60,
  initialData: [],
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
