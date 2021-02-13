import axiosInstance from './apiUtils';

/*
 * Requests API calls
 */
export async function createRequestAdmin(requestData) {
  return axiosInstance.post('/admin/requests', requestData);
}

export async function listRequestsAdmin(page, ordering = '-created') {
  return axiosInstance.get('admin/requests', {
    params: { page, ordering },
  });
}

export async function getRequestAdmin(requestId) {
  return axiosInstance.get(`/admin/requests/${requestId}`);
}

export async function updateRequestAdmin(requestId, requestData) {
  return axiosInstance.patch(`/admin/requests/${requestId}`, requestData);
}

export async function deleteRequestAdmin(requestId) {
  return axiosInstance.delete(`/admin/requests/${requestId}`);
}

/*
 * Comments API calls
 */
export async function createCommentAdmin(requestId, commentData) {
  return axiosInstance.post(
    `/admin/requests/${requestId}/comments`,
    commentData
  );
}

export async function updateCommentAdmin(requestId, commentId, commentData) {
  return axiosInstance.patch(
    `/admin/requests/${requestId}/comments/${commentId}`,
    commentData
  );
}

export async function deleteCommentAdmin(requestId, commentId) {
  return axiosInstance.delete(
    `/admin/requests/${requestId}/comments/${commentId}`
  );
}

/*
 * Crew API calls
 */
export async function createCrewAdmin(requestId, crewData) {
  return axiosInstance.post(`/admin/requests/${requestId}/crew`, crewData);
}

export async function updateCrewAdmin(requestId, crewtId, crewData) {
  return axiosInstance.patch(
    `/admin/requests/${requestId}/crew/${crewtId}`,
    crewData
  );
}

export async function deleteCrewAdmin(requestId, crewtId) {
  return axiosInstance.delete(`/admin/requests/${requestId}/crew/${crewtId}`);
}

/*
 * Videos API calls
 */
export async function createVideoAdmin(requestId, videoData) {
  return axiosInstance.post(`/admin/requests/${requestId}/videos`, videoData);
}

export async function updateVideoAdmin(requestId, videoId, videoData) {
  return axiosInstance.patch(
    `/admin/requests/${requestId}/videos/${videoId}`,
    videoData
  );
}

export async function deleteVideoAdmin(requestId, videoId) {
  return axiosInstance.delete(`/admin/requests/${requestId}/videos/${videoId}`);
}

/*
 * Ratings API calls
 */

export async function createRatingAdmin(requestId, videoId, ratingData) {
  return axiosInstance.post(
    `/admin/requests/${requestId}/videos/${videoId}/ratings`,
    ratingData
  );
}

export async function listRatingsAdmin(requestId, videoId) {
  return axiosInstance.get(
    `/admin/requests/${requestId}/videos/${videoId}/ratings`
  );
}

export async function updateRatingAdmin(
  requestId,
  videoId,
  ratingId,
  ratingData
) {
  return axiosInstance.patch(
    `/admin/requests/${requestId}/videos/${videoId}/ratings/${ratingId}`,
    ratingData
  );
}

export async function deleteRatingAdmin(requestId, videoId, ratingId) {
  return axiosInstance.delete(
    `/admin/requests/${requestId}/videos/${videoId}/ratings/${ratingId}`
  );
}
