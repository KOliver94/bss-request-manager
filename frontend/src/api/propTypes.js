/* eslint-disable @typescript-eslint/no-unused-vars */
import PropTypes from 'prop-types';

const SocialAccount = PropTypes.shape({
  provider: PropTypes.string.isRequired,
  uid: PropTypes.string.isRequired,
});

const UserProfile = PropTypes.shape({
  avatar_url: PropTypes.string,
  phone_number: PropTypes.string,
  avatar: PropTypes.shape({
    'google-oauth2': PropTypes.string,
    gravatar: PropTypes.string,
    'microsoft-graph': PropTypes.string,
    provider: PropTypes.string,
  }),
});

const User = PropTypes.shape({
  id: PropTypes.number.isRequired,
  email: PropTypes.string,
  groups: PropTypes.arrayOf(PropTypes.string),
  first_name: PropTypes.string,
  last_name: PropTypes.string,
  profile: PropTypes.instanceOf(UserProfile),
  role: PropTypes.string,
  social_accounts: PropTypes.arrayOf(SocialAccount),
  username: PropTypes.string,
});

const UserNestedList = PropTypes.shape({
  id: PropTypes.number.isRequired,
  full_name: PropTypes.string,
  avatar_url: PropTypes.string,
});

const UserNestedDetail = PropTypes.shape({
  email: PropTypes.string,
  is_staff: PropTypes.bool,
  phone_number: PropTypes.string,
  id: PropTypes.number.isRequired,
  full_name: PropTypes.string,
  avatar_url: PropTypes.string,
});

const Comment = PropTypes.shape({
  id: PropTypes.number.isRequired,
  author: PropTypes.instanceOf(UserNestedList).isRequired,
  created: PropTypes.string.isRequired,
  text: PropTypes.string.isRequired,
});

const Rating = PropTypes.shape({
  rating: PropTypes.number.isRequired,
  review: PropTypes.string,
  created: PropTypes.string.isRequired,
});

const Video = PropTypes.shape({
  id: PropTypes.number.isRequired,
  rating: PropTypes.instanceOf(Rating),
  status: PropTypes.number.isRequired,
  title: PropTypes.string.isRequired,
  video_url: PropTypes.string,
});

const Request = PropTypes.shape({
  id: PropTypes.number.isRequired,
  created: PropTypes.string.isRequired,
  end_datetime: PropTypes.string.isRequired,
  place: PropTypes.string.isRequired,
  requested_by: PropTypes.instanceOf(UserNestedList).isRequired,
  requester: PropTypes.instanceOf(UserNestedDetail).isRequired,
  responsible: PropTypes.instanceOf(UserNestedDetail),
  start_datetime: PropTypes.string.isRequired,
  status: PropTypes.number.isRequired,
  title: PropTypes.string.isRequired,
  type: PropTypes.string.isRequired,
});
