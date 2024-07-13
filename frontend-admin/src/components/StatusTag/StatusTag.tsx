import React, { forwardRef } from 'react';

import { Tag } from 'primereact/tag';

import {
  FALLBACK_STATUS,
  REQUEST_STATUSES,
  VIDEO_STATUSES,
} from './statusTagConsts';
import {
  RequestStatusTagProps,
  StatusTagProps,
  VideoStatusTagProps,
} from './StatusTagTypes';

export const StatusTag = forwardRef<React.Ref<HTMLSpanElement>, StatusTagProps>(
  ({ modified = false, status, ...props }, ref) => {
    return (
      <Tag
        {...props}
        {...ref}
        className={`p-tag-${status.color} white-space-nowrap`}
        icon={status.icon}
        value={status.text.concat(modified ? '*' : '')}
      />
    );
  },
);

StatusTag.displayName = 'StatusTag';

export const RequestStatusTag = forwardRef<
  React.Ref<HTMLSpanElement>,
  RequestStatusTagProps
>(({ statusNum, ...props }, ref) => {
  return (
    <StatusTag
      {...props}
      {...ref}
      status={REQUEST_STATUSES[statusNum] || FALLBACK_STATUS}
    />
  );
});

RequestStatusTag.displayName = 'RequestStatusTag';

export const VideoStatusTag = forwardRef<
  React.Ref<HTMLSpanElement>,
  VideoStatusTagProps
>(({ statusNum, ...props }, ref) => {
  return (
    <StatusTag
      {...props}
      {...ref}
      status={VIDEO_STATUSES[statusNum] || FALLBACK_STATUS}
    />
  );
});

VideoStatusTag.displayName = 'VideoStatusTag';
