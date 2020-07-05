import axiosInstance from './apiUtils';

/*
 * Requests API calls
 */
export async function createRequest(requestData) {
  return axiosInstance.post('/requests', requestData);
}

export async function listRequests(page, ordering = '-created') {
  return axiosInstance.get(`/requests?page=${page}&ordering=${ordering}`);
}

export async function getRequest(requestId) {
  return axiosInstance.get(`/requests/${requestId}`);
}

/*
 * Comments API calls
 */
export async function createComment(requestId, commentData) {
  return axiosInstance.post(`/requests/${requestId}/comments`, commentData);
}

export async function updateComment(requestId, commentId, commentData) {
  return axiosInstance.patch(
    `/requests/${requestId}/comments/${commentId}`,
    commentData
  );
}

export async function deleteComment(requestId, commentId) {
  return axiosInstance.delete(`/requests/${requestId}/comments/${commentId}`);
}

/*
 * Ratings API calls
 */

export async function createRating(requestId, videoId, ratingData) {
  return axiosInstance.post(
    `/requests/${requestId}/videos/${videoId}/ratings`,
    ratingData
  );
}

export async function updateRating(requestId, videoId, ratingId, ratingData) {
  return axiosInstance.patch(
    `/requests/${requestId}/videos/${videoId}/ratings/${ratingId}`,
    ratingData
  );
}

export async function deleteRating(requestId, videoId, ratingId) {
  return axiosInstance.delete(
    `/requests/${requestId}/videos/${videoId}/ratings/${ratingId}`
  );
}
