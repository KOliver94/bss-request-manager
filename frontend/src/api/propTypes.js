/* eslint-disable no-unused-vars */
import PropTypes from 'prop-types';

const SocialAccount = PropTypes.shape({
  provider: PropTypes.string.isRequired,
  uid: PropTypes.string.isRequired,
});

const UserProfile = PropTypes.shape({
  avatar_url: PropTypes.string,
  phone_number: PropTypes.string,
  avatar: PropTypes.shape({
    facebook: PropTypes.string,
    'google-oauth2': PropTypes.string,
    gravatar: PropTypes.string,
    provider: PropTypes.string,
  }),
});

const User = PropTypes.shape({
  id: PropTypes.number.isRequired,
  banned: PropTypes.shape({
    reason: PropTypes.string,
    created: PropTypes.string.isRequired,
  }),
  email: PropTypes.string,
  groups: PropTypes.arrayOf(PropTypes.string),
  first_name: PropTypes.string,
  last_name: PropTypes.string,
  profile: PropTypes.instanceOf(UserProfile),
  username: PropTypes.string,
});

const UserDetails = PropTypes.shape({
  id: PropTypes.number.isRequired,
  banned: PropTypes.bool,
  email: PropTypes.string,
  first_name: PropTypes.string,
  last_name: PropTypes.string,
  profile: PropTypes.instanceOf(UserProfile),
  role: PropTypes.string,
  social_accounts: PropTypes.arrayOf(SocialAccount),
  username: PropTypes.string,
});

const Comment = PropTypes.shape({
  id: PropTypes.number.isRequired,
  author: PropTypes.instanceOf(User).isRequired,
  created: PropTypes.string.isRequired,
  text: PropTypes.string.isRequired,
  internal: PropTypes.bool,
});

const Rating = PropTypes.shape({
  id: PropTypes.number.isRequired,
  author: PropTypes.instanceOf(User).isRequired,
  rating: PropTypes.number.isRequired,
  review: PropTypes.string,
  created: PropTypes.string.isRequired,
});

const CrewMember = PropTypes.shape({
  id: PropTypes.number.isRequired,
  member: PropTypes.instanceOf(User).isRequired,
  position: PropTypes.string.isRequired,
});

const Video = PropTypes.shape({
  id: PropTypes.number.isRequired,
  additional_data: PropTypes.shape({}),
  avg_rating: PropTypes.number,
  editor: PropTypes.instanceOf(User),
  ratings: PropTypes.arrayOf(Rating),
  status: PropTypes.number.isRequired,
  title: PropTypes.string.isRequired,
  video_url: PropTypes.string,
});

const Request = PropTypes.shape({
  id: PropTypes.number.isRequired,
  additional_data: PropTypes.shape({}),
  comments: PropTypes.arrayOf(Comment),
  created: PropTypes.string.isRequired,
  crew: PropTypes.arrayOf(CrewMember),
  deadline: PropTypes.string,
  end_datetime: PropTypes.string.isRequired,
  place: PropTypes.string.isRequired,
  requested_by: PropTypes.instanceOf(User).isRequired,
  requester: PropTypes.instanceOf(User).isRequired,
  responsible: PropTypes.instanceOf(User),
  start_datetime: PropTypes.string.isRequired,
  status: PropTypes.number.isRequired,
  title: PropTypes.string.isRequired,
  type: PropTypes.string.isRequired,
  videos: PropTypes.arrayOf(Video),
});
