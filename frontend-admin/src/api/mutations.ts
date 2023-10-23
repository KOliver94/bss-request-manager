import { adminApi } from './http';
import {
  PatchedRequestAdminUpdateRequest,
  RequestAdminCreateRequest,
} from './models';

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
