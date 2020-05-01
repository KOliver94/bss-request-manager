import axiosInstance from './apiUtils';

/*
 * Requests API calls
 */
export async function createRequest(requestData) {
  return axiosInstance.post('/admin/requests', requestData);
}

export async function listRequests() {
  return axiosInstance.get('/admin/requests');
}

export async function getRequest(requestId) {
  return axiosInstance.get(`/admin/requests/${requestId}`);
}

export async function updateRequest(requestId, requestData) {
  return axiosInstance.patch(`/admin/requests/${requestId}`, requestData);
}

export async function deleteRequest(requestId) {
  return axiosInstance.delete(`/admin/requests/${requestId}`);
}

/*
 * Comments API calls
 */
export async function createComment(requestId, commentData) {
  return axiosInstance.post(
    `/admin/requests/${requestId}/comments`,
    commentData
  );
}

export async function updateComment(requestId, commentId, commentData) {
  return axiosInstance.patch(
    `/admin/requests/${requestId}/comments/${commentId}`,
    commentData
  );
}

export async function deleteComment(requestId, commentId) {
  return axiosInstance.delete(
    `/admin/requests/${requestId}/comments/${commentId}`
  );
}

/*
 * Crew API calls
 */
export async function createCrew(requestId, crewData) {
  return axiosInstance.post(`/admin/requests/${requestId}/crew`, crewData);
}

export async function updateCrew(requestId, crewtId, crewData) {
  return axiosInstance.patch(
    `/admin/requests/${requestId}/crew/${crewtId}`,
    crewData
  );
}

export async function deleteCrew(requestId, crewtId) {
  return axiosInstance.delete(`/admin/requests/${requestId}/crew/${crewtId}`);
}

/*
 * Videos API calls
 */
export async function createVideo(requestId, videoData) {
  return axiosInstance.post(`/admin/requests/${requestId}`, videoData);
}

export async function updateVideo(requestId, videoId, videoData) {
  return axiosInstance.patch(
    `/admin/requests/${requestId}/videos/${videoId}`,
    videoData
  );
}

export async function deleteVideo(requestId, videoId) {
  return axiosInstance.delete(`/admin/requests/${requestId}/videos/${videoId}`);
}

/*
 * Ratings API calls
 */

export async function createRating(requestId, videoId, ratingData) {
  return axiosInstance.post(
    `/admin/requests/${requestId}/videos/${videoId}/ratings`,
    ratingData
  );
}

export async function updateRating(requestId, videoId, ratingId, ratingData) {
  return axiosInstance.patch(
    `/admin/requests/${requestId}/videos/${videoId}/ratings/${ratingId}`,
    ratingData
  );
}

export async function deleteRating(requestId, videoId, ratingId) {
  return axiosInstance.delete(
    `/admin/requests/${requestId}/videos/${videoId}/ratings/${ratingId}`
  );
}
