import { adminApi } from './http';
import {
  CommentAdminCreateUpdateRequest,
  CrewMemberAdminCreateUpdateRequest,
  PatchedCommentAdminCreateUpdateRequest,
  PatchedRatingAdminCreateUpdateRequest,
  PatchedRequestAdminUpdateRequest,
  PatchedVideoAdminCreateUpdateRequest,
  RatingAdminCreateUpdateRequest,
  RequestAdminCreateRequest,
  UserAdminRetrieveUpdateRequest,
  VideoAdminCreateUpdateRequest,
} from './models';

export const requestCommentCreateMutation = (requestId: number) => ({
  mutationFn: (newComment: CommentAdminCreateUpdateRequest) => {
    return adminApi.adminRequestsCommentsCreate(requestId, newComment);
  },
});

export const requestCommentUpdateMutation = (
  requestId: number,
  commentId: number,
) => ({
  mutationFn: (updateComment: PatchedCommentAdminCreateUpdateRequest) => {
    return adminApi.adminRequestsCommentsPartialUpdate(
      commentId,
      requestId,
      updateComment,
    );
  },
});

export const requestCreateMutation = () => ({
  mutationFn: (newRequest: RequestAdminCreateRequest) => {
    return adminApi.adminRequestsCreate(newRequest);
  },
});

export const requestCrewCreateMutation = (requestId: number) => ({
  mutationFn: (newCrewMember: CrewMemberAdminCreateUpdateRequest) => {
    return adminApi.adminRequestsCrewCreate(requestId, newCrewMember);
  },
});

export const requestUpdateMutation = (requestId: number) => ({
  mutationFn: (updateRequest: PatchedRequestAdminUpdateRequest) => {
    return adminApi.adminRequestsPartialUpdate(requestId, updateRequest);
  },
});

export const requestVideoCreateMutation = (requestId: number) => ({
  mutationFn: (createVideo: VideoAdminCreateUpdateRequest) => {
    return adminApi.adminRequestsVideosCreate(requestId, createVideo);
  },
});

export const requestVideoRatingCreateMutation = (
  requestId: number,
  videoId: number,
) => ({
  mutationFn: (newRating: RatingAdminCreateUpdateRequest) => {
    return adminApi.adminRequestsVideosRatingsCreate(
      requestId,
      videoId,
      newRating,
    );
  },
});

export const requestVideoRatingUpdateMutation = (
  requestId: number,
  videoId: number,
  ratingId: number,
) => ({
  mutationFn: (updateRating: PatchedRatingAdminCreateUpdateRequest) => {
    return adminApi.adminRequestsVideosRatingsPartialUpdate(
      ratingId,
      requestId,
      videoId,
      updateRating,
    );
  },
});

export const requestVideoUpdateMutation = (
  requestId: number,
  videoId: number,
) => ({
  mutationFn: (updateVideo: PatchedVideoAdminCreateUpdateRequest) => {
    return adminApi.adminRequestsVideosPartialUpdate(
      videoId,
      requestId,
      updateVideo,
    );
  },
});

export const userUpdateMutation = (userId: number) => ({
  mutationFn: (updateUser: UserAdminRetrieveUpdateRequest) => {
    return adminApi.adminUsersPartialUpdate(userId, updateUser);
  },
});
