import { adminApi, requestsApi } from './http';

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
});

export const requestCrewListQuery = (requestId: number) => ({
  initialData: [],
  queryFn: async () => {
    const crew = await adminApi.adminRequestsCrewList(requestId);
    return crew.data;
  },
  queryKey: ['requests', requestId, 'crew'],
});

export const requestRetrieveQuery = (requestId: number) => ({
  queryFn: async () => {
    const request = await adminApi.adminRequestsRetrieve(requestId);
    return request.data;
  },
  queryKey: ['requests', requestId],
});

export const requestVideosListQuery = (requestId: number) => ({
  queryFn: async () => {
    const videos = await adminApi.adminRequestsVideosList(requestId);
    return videos.data;
  },
  queryKey: ['requests', requestId, 'videos'],
});

export const requestVideoRatingRetrieveOwnQuery = (
  requestId: number,
  videoId: number,
) => ({
  queryFn: async () => {
    const rating = await requestsApi.requestsVideosRatingRetrieve(
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
  queryFn: async () => {
    const ratings = await adminApi.adminRequestsVideosRatingsList(
      requestId,
      videoId,
    );
    return ratings.data;
  },
  queryKey: ['requests', requestId, 'videos', videoId, 'ratings'],
});

export const requestVideoRetrieveQuery = (
  requestId: number,
  videoId: number,
) => ({
  queryFn: async () => {
    const video = await adminApi.adminRequestsVideosRetrieve(
      videoId,
      requestId,
    );
    return video.data;
  },
  queryKey: ['requests', requestId, 'videos', videoId],
});

export const requestsListQuery = () => ({
  initialData: [],
  queryFn: async () => {
    const requests = await adminApi.adminRequestsList(
      undefined,
      undefined,
      1000,
    );
    return requests.data.results || [];
  },
  queryKey: ['requests'],
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
});

export const usersStaffListQuery = () => ({
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
