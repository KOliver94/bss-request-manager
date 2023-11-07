import axiosInstance from './apiUtils';

/*
 * Requests API calls
 */
export async function createRequest(requestData) {
  return axiosInstance.post('requests', requestData);
}

export async function listRequests(page, ordering = '-created') {
  return axiosInstance.get('requests', {
    params: { page, ordering },
  });
}

export async function getRequest(requestId) {
  return axiosInstance.get(`requests/${requestId}`);
}

/*
 * Comments API calls
 */
export async function createComment(requestId, commentData) {
  return axiosInstance.post(`requests/${requestId}/comments`, commentData);
}

export async function listComments(requestId) {
  return axiosInstance.get(`requests/${requestId}/comments`);
}

export async function updateComment(requestId, commentId, commentData) {
  return axiosInstance.patch(
    `requests/${requestId}/comments/${commentId}`,
    commentData,
  );
}

export async function deleteComment(requestId, commentId) {
  return axiosInstance.delete(`requests/${requestId}/comments/${commentId}`);
}

/*
 * Ratings API calls
 */

export async function listVideos(requestId) {
  return axiosInstance.get(`requests/${requestId}/videos`);
}

/*
 * Ratings API calls
 */

export async function createRating(requestId, videoId, ratingData) {
  return axiosInstance.post(
    `requests/${requestId}/videos/${videoId}/rating`,
    ratingData,
  );
}

export async function updateRating(requestId, videoId, ratingData) {
  return axiosInstance.patch(
    `requests/${requestId}/videos/${videoId}/rating`,
    ratingData,
  );
}

export async function deleteRating(requestId, videoId) {
  return axiosInstance.delete(`requests/${requestId}/videos/${videoId}/rating`);
}
