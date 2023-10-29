import { adminApi } from './http';
import {
  CommentAdminCreateUpdateRequest,
  CrewMemberAdminCreateUpdateRequest,
  PatchedRequestAdminUpdateRequest,
  RatingAdminCreateUpdateRequest,
  RequestAdminCreateRequest,
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
  mutationFn: (updateComment: CommentAdminCreateUpdateRequest) => {
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
  mutationFn: (updateRating: RatingAdminCreateUpdateRequest) => {
    return adminApi.adminRequestsVideosRatingsPartialUpdate(
      ratingId,
      requestId,
      videoId,
      updateRating,
    );
  },
});
