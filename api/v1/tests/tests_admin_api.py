from datetime import datetime

from django.contrib.auth.models import User
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from video_requests.models import Request, Comment, CrewMember, Video, Rating

ADMIN = "test_admin1"
STAFF = "test_staff1"
USER = "test_user1"
PASSWORD = "password"


class AdminAPITestCase(APITestCase):

    def authorize_user(self, username):
        url = reverse('token_obtain_pair')
        resp = self.client.post(url, {'username': username, 'password': PASSWORD}, format='json')
        token = resp.data['access']
        self.client.credentials(HTTP_AUTHORIZATION='Bearer {0}'.format(token))

    def setUp(self):
        # Create normal user
        self.normal_user = User.objects.create_user(
            username=USER, password=PASSWORD, email='test_user1@foo.com')

        # Create staff user
        self.staff_user = User.objects.create_user(
            username=STAFF, password=PASSWORD, email='test_staff1@foo.com')
        self.staff_user.is_staff = True
        self.staff_user.save()

        # Create admin user
        self.admin_user = User.objects.create_superuser(
            username=ADMIN, password=PASSWORD, email='test_admin1@foo.com')

        # Create 2 sample Request objects
        self.request1 = Request()
        self.request1.id = 999
        self.request1.title = 'Test Request 1'
        self.request1.place = 'Test place'
        self.request1.type = 'Test type'
        self.request1.requester = self.normal_user
        self.request1.save()

        self.request2 = Request()
        self.request2.id = 998
        self.request2.title = 'Test Request 2'
        self.request2.place = 'Test place'
        self.request2.type = 'Test type'
        self.request2.requester = self.normal_user
        self.request2.save()

        # Create 2 sample CrewMember objects
        self.crew1 = CrewMember()
        self.crew1.id = 555
        self.crew1.request = self.request1
        self.crew1.position = 'Cameraman'
        self.crew1.member = self.staff_user
        self.crew1.save()

        self.crew2 = CrewMember()
        self.crew2.id = 556
        self.crew2.request = self.request1
        self.crew2.position = 'Reporter'
        self.crew2.member = self.admin_user
        self.crew2.save()

        # Create 3 sample Video objects
        # Video 1 has ratings from all users
        # Video 2 is used to delete the ratings from
        # Video 3 has no ratings
        self.video1 = Video()
        self.video1.id = 787
        self.video1.request = self.request1
        self.video1.title = 'Test Video 1'
        self.video1.save()

        self.video2 = Video()
        self.video2.id = 788
        self.video2.request = self.request1
        self.video2.title = 'Test Video 2'
        self.video2.save()

        self.video3 = Video()
        self.video3.id = 789
        self.video3.request = self.request1
        self.video3.title = 'Test Video 3'
        self.video3.save()

        # Create 5 sample Comment objects with different authors
        # Comment 4 & 5 are used to test comment delete and related to Request 2
        self.comment1 = Comment()
        self.comment1.id = 987
        self.comment1.request = self.request1
        self.comment1.author = self.normal_user
        self.comment1.text = 'Sample text - User'
        self.comment1.save()

        self.comment2 = Comment()
        self.comment2.id = 986
        self.comment2.request = self.request1
        self.comment2.author = self.staff_user
        self.comment2.text = 'Sample text - Staff'
        self.comment2.internal = True
        self.comment2.save()

        self.comment3 = Comment()
        self.comment3.id = 985
        self.comment3.request = self.request1
        self.comment3.author = self.admin_user
        self.comment3.text = 'Sample text - Admin'
        self.comment3.save()

        self.comment4 = Comment()
        self.comment4.id = 984
        self.comment4.request = self.request2
        self.comment4.author = self.staff_user
        self.comment4.text = 'Sample text - Staff'
        self.comment4.internal = True
        self.comment4.save()

        self.comment5 = Comment()
        self.comment5.id = 983
        self.comment5.request = self.request2
        self.comment5.author = self.staff_user
        self.comment5.text = 'Sample text - Staff'
        self.comment5.internal = True
        self.comment5.save()

        # Create 5 sample Rating objects with different authors
        # Rating 4 & 5 are used to test comment delete and related to Video 2
        self.rating1 = Rating()
        self.rating1.id = 876
        self.rating1.video = self.video1
        self.rating1.author = self.normal_user
        self.rating1.rating = 5
        self.rating1.review = 'Sample text - User'
        self.rating1.save()

        self.rating2 = Rating()
        self.rating2.id = 875
        self.rating2.video = self.video1
        self.rating2.author = self.staff_user
        self.rating2.rating = 3
        self.rating2.review = 'Sample text - Staff'
        self.rating2.save()

        self.rating3 = Rating()
        self.rating3.id = 874
        self.rating3.video = self.video1
        self.rating3.author = self.admin_user
        self.rating3.rating = 1
        self.rating3.review = 'Sample text - Admin'
        self.rating3.save()

        self.rating4 = Rating()
        self.rating4.id = 873
        self.rating4.video = self.video2
        self.rating4.author = self.staff_user
        self.rating4.rating = 3
        self.rating4.review = 'Sample text - Staff'
        self.rating4.save()

        self.rating5 = Rating()
        self.rating5.id = 872
        self.rating5.video = self.video2
        self.rating5.author = self.staff_user
        self.rating5.rating = 3
        self.rating5.review = 'Sample text - Staff'
        self.rating5.save()

    """
    --------------------------------------------------
                         REQUESTS
    --------------------------------------------------
    """
    """
    GET /api/v1/admin/requests/
    """

    def test_admin_can_get_requests(self):
        self.authorize_user(ADMIN)
        response = self.client.get('/api/v1/admin/requests/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['count'], 2)

    def test_staff_can_get_requests(self):
        self.authorize_user(STAFF)
        response = self.client.get('/api/v1/admin/requests/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['count'], 2)

    def test_user_should_not_get_requests(self):
        self.authorize_user(USER)
        response = self.client.get('/api/v1/admin/requests/')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    """
    GET /api/v1/admin/requests/:id
    """

    def test_admin_can_get_request_detail(self):
        self.authorize_user(ADMIN)
        response = self.client.get('/api/v1/admin/requests/' + str(self.request1.id))
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_staff_can_get_request_detail(self):
        self.authorize_user(STAFF)
        response = self.client.get('/api/v1/admin/requests/' + str(self.request1.id))
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_user_should_not_get_request_detail(self):
        self.authorize_user(USER)
        response = self.client.get('/api/v1/admin/requests/' + str(self.request1.id))
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    """
    PUT, PATCH /api/v1/admin/requests/:id
    """

    def modify_request(self):
        data = {
            'responsible_id': self.staff_user.id
        }
        response = self.client.patch('/api/v1/admin/requests/' + str(self.request1.id), data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        data = self.client.get('/api/v1/admin/requests/' + str(self.request1.id)).json()
        self.assertEqual(data['responsible']['username'], self.staff_user.username)

        data['place'] = 'Test place - Modified'
        response = self.client.put('/api/v1/admin/requests/' + str(self.request1.id), data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        data = self.client.get('/api/v1/admin/requests/' + str(self.request1.id)).json()
        self.assertIn('Modified', data['place'])

    def test_admin_can_modify_requests(self):
        self.authorize_user(ADMIN)
        self.modify_request()

    def test_staff_can_modify_requests(self):
        self.authorize_user(STAFF)
        self.modify_request()

    def test_user_should_not_modify_requests(self):
        self.authorize_user(USER)
        data = {
            'title': 'Test Request 2 - Modified'
        }
        response = self.client.patch('/api/v1/admin/requests/' + str(self.request1.id), data)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

        data = {
            'title': 'Test Request',
            'time': '2020-03-05',
            'place': 'Test place - Modified',
            'type': 'Test type'
        }
        response = self.client.put('/api/v1/admin/requests/' + str(self.request1.id), data)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    """
    POST /api/v1/admin/requests/
    DELETE /api/v1/admin/requests/:id
    """

    def create_request(self):
        data = {
            'title': 'Test Request 2',
            'time': '2020-03-05',
            'place': 'Test place',
            'type': 'Test type',
            'responsible_id': self.admin_user.id
        }
        return self.client.post('/api/v1/admin/requests/', data)

    def test_admin_can_create_delete_requests(self):
        self.authorize_user(ADMIN)
        response = self.create_request()
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['requester']['username'], ADMIN)
        self.assertEqual(response.data['responsible']['username'], ADMIN)

        response = self.client.delete('/api/v1/admin/requests/' + str(response.data['id']))
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)

    def test_staff_can_create_delete_requests(self):
        self.authorize_user(STAFF)
        response = self.create_request()
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['requester']['username'], STAFF)
        self.assertEqual(response.data['responsible']['username'], ADMIN)

        response = self.client.delete('/api/v1/admin/requests/' + str(response.data['id']))
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)

    def test_user_should_not_create_delete_requests(self):
        self.authorize_user(USER)
        response = self.create_request()
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

        response = self.client.delete('/api/v1/admin/requests/' + str(self.request1.id))
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_adding_initial_comment_to_request(self):
        self.authorize_user(ADMIN)
        data = {
            'title': 'Test Request 2',
            'time': '2020-03-05',
            'place': 'Test place',
            'type': 'Test type',
            'comment_text': 'Test comment'
        }
        response = self.client.post('/api/v1/admin/requests/', data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['comments'][0]['author']['username'], ADMIN)
        self.assertEqual(response.data['comments'][0]['text'], 'Test comment')

    """
    --------------------------------------------------
                         COMMENTS
    --------------------------------------------------
    """
    """
    GET /api/v1/admin/requests/:id/comments
    """

    def test_admin_can_get_comments(self):
        self.authorize_user(ADMIN)
        response = self.client.get('/api/v1/admin/requests/' + str(self.request1.id) + '/comments')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['count'], 3)

    def test_staff_can_get_comments(self):
        self.authorize_user(STAFF)
        response = self.client.get('/api/v1/admin/requests/' + str(self.request1.id) + '/comments')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['count'], 3)

    def test_user_should_not_get_comments(self):
        self.authorize_user(USER)
        response = self.client.get('/api/v1/admin/requests/' + str(self.request1.id) + '/comments')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    """
    GET /api/v1/admin/requests/:id/comments/:id
    """

    def test_admin_can_get_comment_detail(self):
        self.authorize_user(ADMIN)
        response = self.client.get(
            '/api/v1/admin/requests/' + str(self.request1.id) + '/comments/' + str(self.comment1.id))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        response = self.client.get(
            '/api/v1/admin/requests/' + str(self.request1.id) + '/comments/' + str(self.comment2.id))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        response = self.client.get(
            '/api/v1/admin/requests/' + str(self.request1.id) + '/comments/' + str(self.comment3.id))
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_staff_can_get_comment_detail(self):
        self.authorize_user(STAFF)
        response = self.client.get(
            '/api/v1/admin/requests/' + str(self.request1.id) + '/comments/' + str(self.comment1.id))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        response = self.client.get(
            '/api/v1/admin/requests/' + str(self.request1.id) + '/comments/' + str(self.comment2.id))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        response = self.client.get(
            '/api/v1/admin/requests/' + str(self.request1.id) + '/comments/' + str(self.comment3.id))
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_user_should_not_get_comment_detail(self):
        self.authorize_user(USER)
        response = self.client.get(
            '/api/v1/admin/requests/' + str(self.request1.id) + '/comments/' + str(self.comment1.id))
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        response = self.client.get(
            '/api/v1/admin/requests/' + str(self.request1.id) + '/comments/' + str(self.comment2.id))
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        response = self.client.get(
            '/api/v1/admin/requests/' + str(self.request1.id) + '/comments/' + str(self.comment3.id))
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    """
    PUT, PATCH /api/v1/admin/requests/:id/comments/:id
    """

    def test_admin_can_modify_any_comments(self):
        self.authorize_user(ADMIN)
        data = {
            'text': 'Modified by admin'
        }
        response = self.client.patch(
            '/api/v1/admin/requests/' + str(self.request1.id) + '/comments/' + str(self.comment1.id),
            data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        response = self.client.patch(
            '/api/v1/admin/requests/' + str(self.request1.id) + '/comments/' + str(self.comment2.id),
            data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        response = self.client.patch(
            '/api/v1/admin/requests/' + str(self.request1.id) + '/comments/' + str(self.comment3.id),
            data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        data = self.client.get(
            '/api/v1/admin/requests/' + str(self.request1.id) + '/comments/' + str(self.comment1.id)).json()
        self.assertIn('Modified by admin', data['text'])
        data = self.client.get(
            '/api/v1/admin/requests/' + str(self.request1.id) + '/comments/' + str(self.comment2.id)).json()
        self.assertIn('Modified by admin', data['text'])
        data = self.client.get(
            '/api/v1/admin/requests/' + str(self.request1.id) + '/comments/' + str(self.comment3.id)).json()
        self.assertIn('Modified by admin', data['text'])

        data['text'] = 'Modified by admin (PUT)'
        response = self.client.put(
            '/api/v1/admin/requests/' + str(self.request1.id) + '/comments/' + str(self.comment1.id),
            data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        response = self.client.put(
            '/api/v1/admin/requests/' + str(self.request1.id) + '/comments/' + str(self.comment2.id),
            data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        response = self.client.put(
            '/api/v1/admin/requests/' + str(self.request1.id) + '/comments/' + str(self.comment3.id),
            data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        data = self.client.get(
            '/api/v1/admin/requests/' + str(self.request1.id) + '/comments/' + str(self.comment1.id)).json()
        self.assertIn('Modified by admin (PUT)', data['text'])
        data = self.client.get(
            '/api/v1/admin/requests/' + str(self.request1.id) + '/comments/' + str(self.comment2.id)).json()
        self.assertIn('Modified by admin (PUT)', data['text'])
        data = self.client.get(
            '/api/v1/admin/requests/' + str(self.request1.id) + '/comments/' + str(self.comment3.id)).json()
        self.assertIn('Modified by admin (PUT)', data['text'])

    def test_staff_can_modify_only_own_comments(self):
        self.authorize_user(STAFF)
        data = {
            'text': 'Modified by staff'
        }
        response = self.client.patch(
            '/api/v1/admin/requests/' + str(self.request1.id) + '/comments/' + str(self.comment1.id),
            data)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        response = self.client.patch(
            '/api/v1/admin/requests/' + str(self.request1.id) + '/comments/' + str(self.comment2.id),
            data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        response = self.client.patch(
            '/api/v1/admin/requests/' + str(self.request1.id) + '/comments/' + str(self.comment3.id),
            data)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

        data = self.client.get(
            '/api/v1/admin/requests/' + str(self.request1.id) + '/comments/' + str(self.comment2.id)).json()
        self.assertIn('Modified by staff', data['text'])

        data['text'] = 'Modified by staff (PUT)'
        response = self.client.put(
            '/api/v1/admin/requests/' + str(self.request1.id) + '/comments/' + str(self.comment1.id),
            data)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        response = self.client.put(
            '/api/v1/admin/requests/' + str(self.request1.id) + '/comments/' + str(self.comment2.id),
            data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        response = self.client.put(
            '/api/v1/admin/requests/' + str(self.request1.id) + '/comments/' + str(self.comment3.id),
            data)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

        data = self.client.get(
            '/api/v1/admin/requests/' + str(self.request1.id) + '/comments/' + str(self.comment2.id)).json()
        self.assertIn('Modified by staff (PUT)', data['text'])

    def test_user_should_not_modify_comments(self):
        self.authorize_user(USER)
        data = {
            'text': 'Modified by user'
        }
        response = self.client.patch(
            '/api/v1/admin/requests/' + str(self.request1.id) + '/comments/' + str(self.comment1.id),
            data)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        response = self.client.patch(
            '/api/v1/admin/requests/' + str(self.request1.id) + '/comments/' + str(self.comment2.id),
            data)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        response = self.client.patch(
            '/api/v1/admin/requests/' + str(self.request1.id) + '/comments/' + str(self.comment3.id),
            data)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

        data = {
            'text': 'Modified by user',
            'internal': True
        }
        response = self.client.put(
            '/api/v1/admin/requests/' + str(self.request1.id) + '/comments/' + str(self.comment1.id),
            data)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        response = self.client.put(
            '/api/v1/admin/requests/' + str(self.request1.id) + '/comments/' + str(self.comment2.id),
            data)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        response = self.client.put(
            '/api/v1/admin/requests/' + str(self.request1.id) + '/comments/' + str(self.comment3.id),
            data)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_anonymous_should_not_get_comment_detail(self):
        """
        By default DRF returns 401 for unauthorized requests but with custom object permissions it changes
        For GET it would return 401 even if the object does not exist
        For other methods it returns 404 if the object does not exist and 401 if exist but obviously has no right to access.
        It's information leaking and this behaviour is overwritten in the view, so it returns 404 even if the object exists.
        """
        response = self.client.get(
            '/api/v1/admin/requests/' + str(self.request1.id) + '/comments/' + str(self.comment1.id))
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        response = self.client.get(
            '/api/v1/admin/requests/' + str(self.request1.id) + '/comments/' + str(self.comment2.id))
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        response = self.client.get(
            '/api/v1/admin/requests/' + str(self.request1.id) + '/comments/' + str(self.comment3.id))
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

        data = {
            'text': 'Modified by anonymous'
        }
        response = self.client.patch(
            '/api/v1/admin/requests/' + str(self.request1.id) + '/comments/' + str(self.comment1.id),
            data)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        response = self.client.put(
            '/api/v1/admin/requests/' + str(self.request1.id) + '/comments/' + str(self.comment2.id),
            data)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        response = self.client.delete(
            '/api/v1/admin/requests/' + str(self.request1.id) + '/comments/' + str(self.comment3.id))
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    """
    POST /api/v1/admin/requests/:id/comments
    """

    def create_comment(self):
        data = {
            'text': 'New Comment by admin',
            'internal': True
        }
        return self.client.post('/api/v1/admin/requests/' + str(self.request1.id) + '/comments', data)

    def test_admin_can_create_comments(self):
        self.authorize_user(ADMIN)
        response = self.create_comment()
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['author']['username'], self.admin_user.username)
        self.assertEqual(response.data['internal'], True)

    def test_staff_can_create_comment(self):
        self.authorize_user(STAFF)
        response = self.create_comment()
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['author']['username'], self.staff_user.username)
        self.assertEqual(response.data['internal'], True)

    def test_user_should_not_create_comments(self):
        self.authorize_user(USER)
        response = self.create_comment()
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    """
    DELETE /api/v1/admin/requests/:id/comments/:id
    """

    def test_admin_can_delete_any_comments(self):
        self.authorize_user(ADMIN)
        # Try to delete one comment created by staff user
        response = self.client.delete(
            '/api/v1/admin/requests/' + str(self.request2.id) + '/comments/' + str(self.comment5.id))
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)

    def test_staff_delete_only_own_comments(self):
        self.authorize_user(STAFF)
        response = self.client.delete(
            '/api/v1/admin/requests/' + str(self.request1.id) + '/comments/' + str(self.comment1.id))
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        response = self.client.delete(
            '/api/v1/admin/requests/' + str(self.request1.id) + '/comments/' + str(self.comment3.id))
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        response = self.client.delete(
            '/api/v1/admin/requests/' + str(self.request2.id) + '/comments/' + str(self.comment4.id))
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)

    def test_user_should_not_delete_comments(self):
        self.authorize_user(USER)
        response = self.client.delete(
            '/api/v1/admin/requests/' + str(self.request1.id) + '/comments/' + str(self.comment1.id))
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        response = self.client.delete(
            '/api/v1/admin/requests/' + str(self.request1.id) + '/comments/' + str(self.comment2.id))
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        response = self.client.delete(
            '/api/v1/admin/requests/' + str(self.request1.id) + '/comments/' + str(self.comment3.id))
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    """
    --------------------------------------------------
                           CREW
    --------------------------------------------------
    """
    """
    GET /api/v1/admin/requests/:id/crew
    """

    def test_admin_can_get_crew(self):
        self.authorize_user(ADMIN)
        response = self.client.get('/api/v1/admin/requests/' + str(self.request1.id) + '/crew')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['count'], 2)

    def test_staff_can_get_crew(self):
        self.authorize_user(STAFF)
        response = self.client.get('/api/v1/admin/requests/' + str(self.request1.id) + '/crew')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['count'], 2)

    def test_user_should_not_get_crew(self):
        self.authorize_user(USER)
        response = self.client.get('/api/v1/admin/requests/' + str(self.request1.id) + '/crew')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    """
    GET /api/v1/admin/requests/:id/crew/:id
    """

    def test_admin_can_get_crew_detail(self):
        self.authorize_user(ADMIN)
        response = self.client.get('/api/v1/admin/requests/' + str(self.request1.id) + '/crew/' + str(self.crew1.id))
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_staff_can_get_crew_detail(self):
        self.authorize_user(STAFF)
        response = self.client.get('/api/v1/admin/requests/' + str(self.request1.id) + '/crew/' + str(self.crew1.id))
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_user_should_not_get_crew_detail(self):
        self.authorize_user(USER)
        response = self.client.get('/api/v1/admin/requests/' + str(self.request1.id) + '/crew/' + str(self.crew1.id))
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    """
    PUT, PATCH /api/v1/admin/requests/:id/crew/:id
    """

    def modify_crew(self):
        data = {
            'position': 'Modified position',
            'member_id': self.admin_user.id
        }
        response = self.client.patch('/api/v1/admin/requests/' + str(self.request1.id) + '/crew/' + str(self.crew1.id),
                                     data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['member']['username'], self.admin_user.username)

        data = self.client.get('/api/v1/admin/requests/' + str(self.request1.id) + '/crew/' + str(self.crew1.id)).json()
        self.assertIn('Modified', data['position'])

        data['position'] = 'PUT Modified'
        data.update(member_id=data['member']['id'])
        response = self.client.put('/api/v1/admin/requests/' + str(self.request1.id) + '/crew/' + str(self.crew1.id),
                                   data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        data = self.client.get('/api/v1/admin/requests/' + str(self.request1.id) + '/crew/' + str(self.crew1.id)).json()
        self.assertIn('PUT Modified', data['position'])

    def test_admin_can_modify_crew(self):
        self.authorize_user(ADMIN)
        self.modify_crew()

    def test_staff_can_modify_crew(self):
        self.authorize_user(STAFF)
        self.modify_crew()

    def test_user_should_not_modify_crew(self):
        self.authorize_user(USER)
        data = {
            'position': 'Modified position'
        }
        response = self.client.patch('/api/v1/admin/requests/' + str(self.request1.id) + '/crew/' + str(self.crew1.id),
                                     data)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

        data = {
            'position': 'new position',
            'member_id': self.admin_user.id
        }
        response = self.client.put('/api/v1/admin/requests/' + str(self.request1.id) + '/crew/' + str(self.crew1.id),
                                   data)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    """
    POST /api/v1/admin/requests/:id/crew
    DELETE /api/v1/admin/requests/:id/crew/:id
    """

    def create_crew(self):
        data = {
            'member_id': self.admin_user.id,
            'position': 'new position'
        }
        return self.client.post('/api/v1/admin/requests/' + str(self.request1.id) + '/crew', data)

    def test_admin_can_create_delete_crew(self):
        self.authorize_user(ADMIN)
        response = self.create_crew()
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        response = self.client.delete(
            '/api/v1/admin/requests/' + str(self.request1.id) + '/crew/' + str(response.data['id']))
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)

    def test_staff_can_create_delete_crew(self):
        self.authorize_user(STAFF)
        response = self.create_crew()
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        response = self.client.delete(
            '/api/v1/admin/requests/' + str(self.request1.id) + '/crew/' + str(response.data['id']))
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)

    def test_user_should_not_create_delete_crew(self):
        self.authorize_user(USER)
        response = self.create_crew()
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

        response = self.client.delete(
            '/api/v1/admin/requests/' + str(self.request1.id) + '/crew/' + str(self.crew1.id))
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    """
    --------------------------------------------------
                          VIDEOS
    --------------------------------------------------
    """
    """
    GET /api/v1/admin/requests/:id/videos
    """

    def test_admin_can_get_videos(self):
        self.authorize_user(ADMIN)
        response = self.client.get('/api/v1/admin/requests/' + str(self.request1.id) + '/videos')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['count'], 2)

    def test_staff_can_get_videos(self):
        self.authorize_user(STAFF)
        response = self.client.get('/api/v1/admin/requests/' + str(self.request1.id) + '/videos')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['count'], 2)

    def test_user_should_not_get_videos(self):
        self.authorize_user(USER)
        response = self.client.get('/api/v1/admin/requests/' + str(self.request1.id) + '/videos')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    """
    GET /api/v1/admin/requests/:id/videos/:id
    """

    def test_admin_can_get_video_detail(self):
        self.authorize_user(ADMIN)
        response = self.client.get('/api/v1/admin/requests/' + str(self.request1.id) + '/videos/' + str(self.video1.id))
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_staff_can_get_video_detail(self):
        self.authorize_user(STAFF)
        response = self.client.get('/api/v1/admin/requests/' + str(self.request1.id) + '/videos/' + str(self.video1.id))
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_user_should_not_get_video_detail(self):
        self.authorize_user(USER)
        response = self.client.get('/api/v1/admin/requests/' + str(self.request1.id) + '/videos/' + str(self.video1.id))
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    """
    PUT, PATCH /api/v1/admin/requests/:id/videos/:id
    """

    def modify_video(self):
        data = {
            'editor_id': self.staff_user.id
        }
        response = self.client.patch(
            '/api/v1/admin/requests/' + str(self.request1.id) + '/videos/' + str(self.video1.id),
            data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        data = self.client.get(
            '/api/v1/admin/requests/' + str(self.request1.id) + '/videos/' + str(self.video1.id)).json()
        self.assertEqual(data['editor']['username'], self.staff_user.username)

        data['title'] = data['title'] + ' - Modified'
        response = self.client.put('/api/v1/admin/requests/' + str(self.request1.id) + '/videos/' + str(self.video1.id),
                                   data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        data = self.client.get(
            '/api/v1/admin/requests/' + str(self.request1.id) + '/videos/' + str(self.video1.id)).json()
        self.assertIn('Modified', data['title'])

    def test_admin_can_modify_video(self):
        self.authorize_user(ADMIN)
        self.modify_video()

    def test_staff_can_modify_video(self):
        self.authorize_user(STAFF)
        self.modify_video()

    def test_user_should_not_modify_video(self):
        self.authorize_user(USER)
        data = {
            'editor_id': self.staff_user.id
        }
        response = self.client.patch(
            '/api/v1/admin/requests/' + str(self.request1.id) + '/videos/' + str(self.crew1.id),
            data)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

        data = {
            'title': 'Modified title',
            'editor_id': self.staff_user.id
        }
        response = self.client.put('/api/v1/admin/requests/' + str(self.request1.id) + '/videos/' + str(self.crew1.id),
                                   data)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    """
    POST /api/v1/admin/requests/:id/videos
    DELETE /api/v1/admin/requests/:id/videos/:id
    """

    def create_video(self):
        data = {
            'title': 'New video',
            'editor_id': self.admin_user.id
        }
        return self.client.post('/api/v1/admin/requests/' + str(self.request1.id) + '/videos', data)

    def test_admin_can_create_delete_videos(self):
        self.authorize_user(ADMIN)
        response = self.create_video()
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['editor']['username'], self.admin_user.username)

        response = self.client.delete(
            '/api/v1/admin/requests/' + str(self.request1.id) + '/videos/' + str(response.data['id']))
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)

    def test_staff_can_create_delete_videos(self):
        self.authorize_user(STAFF)
        response = self.create_video()
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['editor']['username'], self.admin_user.username)

        response = self.client.delete(
            '/api/v1/admin/requests/' + str(self.request1.id) + '/videos/' + str(response.data['id']))
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)

    def test_user_should_not_create_delete_videos(self):
        self.authorize_user(USER)
        response = self.create_video()
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

        response = self.client.delete(
            '/api/v1/admin/requests/' + str(self.request1.id) + '/videos/' + str(self.crew1.id))
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    """
    --------------------------------------------------
                         RATINGS
    --------------------------------------------------
    """
    """
    GET /api/v1/admin/requests/:id/videos/:id/ratings
    """

    def test_admin_can_get_ratings(self):
        self.authorize_user(ADMIN)
        response = self.client.get(
            '/api/v1/admin/requests/' + str(self.request1.id) + '/videos/' + str(self.video1.id) + '/ratings')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['count'], 3)

    def test_staff_can_get_ratings(self):
        self.authorize_user(STAFF)
        response = self.client.get(
            '/api/v1/admin/requests/' + str(self.request1.id) + '/videos/' + str(self.video1.id) + '/ratings')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['count'], 3)

    def test_user_should_not_get_ratings(self):
        self.authorize_user(USER)
        response = self.client.get(
            '/api/v1/admin/requests/' + str(self.request1.id) + '/videos/' + str(self.video1.id) + '/ratings')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    """
    GET /api/v1/admin/requests/:id/videos/:id/ratings/:id
    """

    def test_admin_can_get_rating_detail(self):
        self.authorize_user(ADMIN)
        response = self.client.get(
            '/api/v1/admin/requests/' + str(self.request1.id) + '/videos/' + str(self.video1.id) + '/ratings/' + str(
                self.rating1.id))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        response = self.client.get(
            '/api/v1/admin/requests/' + str(self.request1.id) + '/videos/' + str(self.video1.id) + '/ratings/' + str(
                self.rating2.id))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        response = self.client.get(
            '/api/v1/admin/requests/' + str(self.request1.id) + '/videos/' + str(self.video1.id) + '/ratings/' + str(
                self.rating3.id))
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_staff_can_get_rating_detail(self):
        self.authorize_user(STAFF)
        response = self.client.get(
            '/api/v1/admin/requests/' + str(self.request1.id) + '/videos/' + str(self.video1.id) + '/ratings/' + str(
                self.rating1.id))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        response = self.client.get(
            '/api/v1/admin/requests/' + str(self.request1.id) + '/videos/' + str(self.video1.id) + '/ratings/' + str(
                self.rating2.id))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        response = self.client.get(
            '/api/v1/admin/requests/' + str(self.request1.id) + '/videos/' + str(self.video1.id) + '/ratings/' + str(
                self.rating3.id))
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_user_should_not_get_rating_detail(self):
        self.authorize_user(USER)
        response = self.client.get(
            '/api/v1/admin/requests/' + str(self.request1.id) + '/videos/' + str(self.video1.id) + '/ratings/' + str(
                self.rating1.id))
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        response = self.client.get(
            '/api/v1/admin/requests/' + str(self.request1.id) + '/videos/' + str(self.video1.id) + '/ratings/' + str(
                self.rating2.id))
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        response = self.client.get(
            '/api/v1/admin/requests/' + str(self.request1.id) + '/videos/' + str(self.video1.id) + '/ratings/' + str(
                self.rating3.id))
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    """
    POST /api/v1/admin/requests/:id/videos/:id/ratings
    """

    def create_rating(self):
        data = {
            'rating': 5,
            'review': 'Great video'
        }
        return self.client.post(
            '/api/v1/admin/requests/' + str(self.request1.id) + '/videos/' + str(self.video3.id) + '/ratings', data)

    def test_admin_can_only_create_one_rating_to_a_video(self):
        self.authorize_user(ADMIN)
        response = self.create_rating()
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['author']['username'], self.admin_user.username)

        response = self.create_rating()
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data[0], 'You have already posted a rating.')

    def test_staff_can_only_create_one_rating_to_a_video(self):
        self.authorize_user(STAFF)
        response = self.create_rating()
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['author']['username'], self.staff_user.username)

        response = self.create_rating()
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data[0], 'You have already posted a rating.')

    def test_user_should_not_create_ratings(self):
        self.authorize_user(USER)
        response = self.create_rating()
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_rating_validator(self):
        self.authorize_user(ADMIN)
        data = {
            'rating': 50,
        }
        response = self.client.post(
            '/api/v1/admin/requests/' + str(self.request1.id) + '/videos/' + str(self.video1.id) + '/ratings', data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data['rating'][0], 'Ensure this value is less than or equal to 5.')

        data['rating'] = -100
        response = self.client.post(
            '/api/v1/admin/requests/' + str(self.request1.id) + '/videos/' + str(self.video1.id) + '/ratings', data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data['rating'][0], 'Ensure this value is greater than or equal to 1.')

    """
    PUT, PATCH /api/v1/admin/requests/:id/comments/:id
    """

    def test_admin_can_modify_any_reviews(self):
        self.authorize_user(ADMIN)
        data = {
            'review': 'Modified by admin'
        }
        response = self.client.patch(
            '/api/v1/admin/requests/' + str(self.request1.id) + '/videos/' + str(self.video1.id) + '/ratings/' + str(
                self.rating1.id), data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        response = self.client.patch(
            '/api/v1/admin/requests/' + str(self.request1.id) + '/videos/' + str(self.video1.id) + '/ratings/' + str(
                self.rating2.id), data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        response = self.client.patch(
            '/api/v1/admin/requests/' + str(self.request1.id) + '/videos/' + str(self.video1.id) + '/ratings/' + str(
                self.rating3.id), data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        data = self.client.get(
            '/api/v1/admin/requests/' + str(self.request1.id) + '/videos/' + str(self.video1.id) + '/ratings/' + str(
                self.rating1.id)).json()
        self.assertIn('Modified by admin', data['review'])
        data = self.client.get(
            '/api/v1/admin/requests/' + str(self.request1.id) + '/videos/' + str(self.video1.id) + '/ratings/' + str(
                self.rating2.id)).json()
        self.assertIn('Modified by admin', data['review'])
        data = self.client.get(
            '/api/v1/admin/requests/' + str(self.request1.id) + '/videos/' + str(self.video1.id) + '/ratings/' + str(
                self.rating3.id)).json()
        self.assertIn('Modified by admin', data['review'])

        data['review'] = 'Modified by admin (PUT)'
        response = self.client.put(
            '/api/v1/admin/requests/' + str(self.request1.id) + '/videos/' + str(self.video1.id) + '/ratings/' + str(
                self.rating1.id),
            data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        response = self.client.put(
            '/api/v1/admin/requests/' + str(self.request1.id) + '/videos/' + str(self.video1.id) + '/ratings/' + str(
                self.rating2.id),
            data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        response = self.client.put(
            '/api/v1/admin/requests/' + str(self.request1.id) + '/videos/' + str(self.video1.id) + '/ratings/' + str(
                self.rating3.id),
            data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        data = self.client.get(
            '/api/v1/admin/requests/' + str(self.request1.id) + '/videos/' + str(self.video1.id) + '/ratings/' + str(
                self.rating1.id)).json()
        self.assertIn('Modified by admin (PUT)', data['review'])
        data = self.client.get(
            '/api/v1/admin/requests/' + str(self.request1.id) + '/videos/' + str(self.video1.id) + '/ratings/' + str(
                self.rating2.id)).json()
        self.assertIn('Modified by admin (PUT)', data['review'])
        data = self.client.get(
            '/api/v1/admin/requests/' + str(self.request1.id) + '/videos/' + str(self.video1.id) + '/ratings/' + str(
                self.rating3.id)).json()
        self.assertIn('Modified by admin (PUT)', data['review'])

    def test_staff_can_modify_only_own_reviews(self):
        self.authorize_user(STAFF)
        data = {
            'review': 'Modified by staff'
        }
        response = self.client.patch(
            '/api/v1/admin/requests/' + str(self.request1.id) + '/videos/' + str(self.video1.id) + '/ratings/' + str(
                self.rating1.id),
            data)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        response = self.client.patch(
            '/api/v1/admin/requests/' + str(self.request1.id) + '/videos/' + str(self.video1.id) + '/ratings/' + str(
                self.rating2.id),
            data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        response = self.client.patch(
            '/api/v1/admin/requests/' + str(self.request1.id) + '/videos/' + str(self.video1.id) + '/ratings/' + str(
                self.rating3.id),
            data)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

        data = self.client.get(
            '/api/v1/admin/requests/' + str(self.request1.id) + '/videos/' + str(self.video1.id) + '/ratings/' + str(
                self.rating2.id)).json()
        self.assertIn('Modified by staff', data['review'])

        data['review'] = 'Modified by staff (PUT)'
        response = self.client.put(
            '/api/v1/admin/requests/' + str(self.request1.id) + '/videos/' + str(self.video1.id) + '/ratings/' + str(
                self.rating1.id),
            data)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        response = self.client.put(
            '/api/v1/admin/requests/' + str(self.request1.id) + '/videos/' + str(self.video1.id) + '/ratings/' + str(
                self.rating2.id),
            data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        response = self.client.put(
            '/api/v1/admin/requests/' + str(self.request1.id) + '/videos/' + str(self.video1.id) + '/ratings/' + str(
                self.rating3.id),
            data)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

        data = self.client.get(
            '/api/v1/admin/requests/' + str(self.request1.id) + '/videos/' + str(self.video1.id) + '/ratings/' + str(
                self.rating2.id)).json()
        self.assertIn('Modified by staff (PUT)', data['review'])

    def test_user_should_not_modify_reviews(self):
        self.authorize_user(USER)
        data = {
            'review': 'Modified by user'
        }
        response = self.client.patch(
            '/api/v1/admin/requests/' + str(self.request1.id) + '/videos/' + str(self.video1.id) + '/ratings/' + str(
                self.rating1.id),
            data)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        response = self.client.patch(
            '/api/v1/admin/requests/' + str(self.request1.id) + '/videos/' + str(self.video1.id) + '/ratings/' + str(
                self.rating2.id),
            data)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        response = self.client.patch(
            '/api/v1/admin/requests/' + str(self.request1.id) + '/videos/' + str(self.video1.id) + '/ratings/' + str(
                self.rating3.id),
            data)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

        data = {
            'review': 'Modified by user',
            'rating': 5
        }
        response = self.client.put(
            '/api/v1/admin/requests/' + str(self.request1.id) + '/videos/' + str(self.video1.id) + '/ratings/' + str(
                self.rating1.id),
            data)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        response = self.client.put(
            '/api/v1/admin/requests/' + str(self.request1.id) + '/videos/' + str(self.video1.id) + '/ratings/' + str(
                self.rating2.id),
            data)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        response = self.client.put(
            '/api/v1/admin/requests/' + str(self.request1.id) + '/videos/' + str(self.video1.id) + '/ratings/' + str(
                self.rating3.id),
            data)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_anonymous_should_not_get_rating_detail(self):
        """
        By default DRF returns 401 for unauthorized requests but with custom object permissions it changes
        For GET it would return 401 even if the object does not exist
        For other methods it returns 404 if the object does not exist and 401 if exist but obviously has no right to access.
        It's information leaking and this behaviour is overwritten in the view, so it returns 404 even if the object exists.
        """
        response = self.client.get(
            '/api/v1/admin/requests/' + str(self.request1.id) + '/videos/' + str(self.video1.id) + '/ratings/' + str(
                self.rating1.id))
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        response = self.client.get(
            '/api/v1/admin/requests/' + str(self.request1.id) + '/videos/' + str(self.video1.id) + '/ratings/' + str(
                self.rating2.id))
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        response = self.client.get(
            '/api/v1/admin/requests/' + str(self.request1.id) + '/videos/' + str(self.video1.id) + '/ratings/' + str(
                self.rating3.id))
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

        data = {
            'review': 'Modified by anonymous'
        }
        response = self.client.patch(
            '/api/v1/admin/requests/' + str(self.request1.id) + '/videos/' + str(self.video1.id) + '/ratings/' + str(
                self.rating1.id),
            data)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        response = self.client.put(
            '/api/v1/admin/requests/' + str(self.request1.id) + '/videos/' + str(self.video1.id) + '/ratings/' + str(
                self.rating2.id),
            data)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        response = self.client.delete(
            '/api/v1/admin/requests/' + str(self.request1.id) + '/videos/' + str(self.video1.id) + '/ratings/' + str(
                self.rating3.id))
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    """
    DELETE /api/v1/admin/requests/:id/videos/:id/ratings/:id
    """

    def test_admin_can_delete_any_ratings(self):
        self.authorize_user(ADMIN)
        # Try to delete one rating created by staff user
        response = self.client.delete(
            '/api/v1/admin/requests/' + str(self.request1.id) + '/videos/' + str(self.video2.id) + '/ratings/' + str(
                self.rating5.id))
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)

    def test_staff_delete_only_own_ratings(self):
        self.authorize_user(STAFF)
        response = self.client.delete(
            '/api/v1/admin/requests/' + str(self.request1.id) + '/videos/' + str(self.video1.id) + '/ratings/' + str(
                self.rating1.id))
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        response = self.client.delete(
            '/api/v1/admin/requests/' + str(self.request1.id) + '/videos/' + str(self.video1.id) + '/ratings/' + str(
                self.rating3.id))
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        response = self.client.delete(
            '/api/v1/admin/requests/' + str(self.request1.id) + '/videos/' + str(self.video2.id) + '/ratings/' + str(
                self.rating4.id))
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)

    def test_user_should_not_delete_ratings(self):
        self.authorize_user(USER)
        response = self.client.delete(
            '/api/v1/admin/requests/' + str(self.request1.id) + '/videos/' + str(self.video1.id) + '/ratings/' + str(
                self.rating1.id))
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        response = self.client.delete(
            '/api/v1/admin/requests/' + str(self.request1.id) + '/videos/' + str(self.video1.id) + '/ratings/' + str(
                self.rating2.id))
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        response = self.client.delete(
            '/api/v1/admin/requests/' + str(self.request1.id) + '/videos/' + str(self.video1.id) + '/ratings/' + str(
                self.rating3.id))
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
