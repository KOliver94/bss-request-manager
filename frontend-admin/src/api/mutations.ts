import { adminApi } from './http';
import {
  CommentAdminCreateUpdateRequest,
  PatchedRequestAdminUpdateRequest,
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

export const requestUpdateMutation = (requestId: number) => ({
  mutationFn: (updateRequest: PatchedRequestAdminUpdateRequest) => {
    return adminApi.adminRequestsPartialUpdate(requestId, updateRequest);
  },
});
