import { RequestAdminRetrieve } from './models/request-admin-retrieve';
import { VideoAdminRetrieve } from './models/video-admin-retrieve';

export const dummyRequest: RequestAdminRetrieve = {
  additional_data: {},
  comment_count: 0,
  created: '2023-01-01T00:00:00.000000+02:00',
  crew: [],
  deadline: '2023-01-01T00:00:00.000000+02:00',
  end_datetime: '2023-01-01T00:00:00.000000+02:00',
  id: 0,
  place: '',
  requested_by: {
    avatar_url: '',
    email: '',
    full_name: '',
    id: 0,
    is_staff: false,
    phone_number: '',
  },
  requester: {
    avatar_url: '',
    email: '',
    full_name: '',
    id: 0,
    is_staff: false,
    phone_number: '',
  },
  responsible: {
    avatar_url: '',
    email: '',
    full_name: '',
    id: 0,
    is_staff: false,
    phone_number: '',
  },
  start_datetime: '2023-01-01T00:00:00.000000+02:00',
  status: 0,
  status_by_admin: false,
  title: '',
  type: '',
  video_count: 0,
};

export const dummyVideo: VideoAdminRetrieve = {
  additional_data: {},
  avg_rating: 0,
  editor: {
    avatar_url: '',
    full_name: '',
    id: 0,
  },
  id: 0,
  rated: false,
  status: 0,
  status_by_admin: false,
  title: '',
};