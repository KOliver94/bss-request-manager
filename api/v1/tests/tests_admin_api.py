from datetime import datetime

from django.contrib.auth.models import User
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from video_requests.models import Request, Comment, CrewMember, Video, Rating


class AdminAPITestCase(APITestCase):
    def authorize_user(self, username, password):
        url = reverse('token_obtain_pair')
        resp = self.client.post(url, {'username': username, 'password': password}, format='json')
        token = resp.data['access']
        self.client.credentials(HTTP_AUTHORIZATION='Bearer {0}'.format(token))

    def setUp(self):
        # Create normal user
        self.normal_user = User.objects.create_user(
            username='test_user1', password='password', email='test_user1@foo.com')

        # Create staff user
        self.staff_user = User.objects.create_user(
            username='test_staff1', password='password', email='test_staff1@foo.com')
        self.staff_user.is_staff = True
        self.staff_user.save()

        # Create admin user
        self.admin_user = User.objects.create_superuser(
            username='test_admin1', password='password', email='test_admin1@foo.com')

        # Create a sample Request object
        request1 = Request()
        request1.title = 'Test Request 1'
        request1.time = datetime.now()
        request1.place = 'Test place'
        request1.type = 'Test type'
        request1.requester = self.normal_user
        request1.save()

        # Create 2 sample CrewMember objects
        crew1 = CrewMember()
        crew1.request = request1
        crew1.position = 'Operatőr'
        crew1.member = self.staff_user
        crew1.save()

        crew2 = CrewMember()
        crew2.request = request1
        crew2.position = 'Riporter'
        crew2.member = self.admin_user
        crew2.save()

        # Create 2 sample Video objects
        video1 = Video()
        video1.request = request1
        video1.title = 'Test Video 1'
        video1.save()

        video2 = Video()
        video2.request = request1
        video2.title = 'Test Video 2'
        video2.save()

        # Create 3 sample Comment objects with different authors
        comment1 = Comment()
        comment1.request = request1
        comment1.author = self.normal_user
        comment1.text = 'Sample text - User'
        comment1.save()

        comment2 = Comment()
        comment2.request = request1
        comment2.author = self.staff_user
        comment2.text = 'Sample text - Staff'
        comment2.internal = True
        comment2.save()

        comment3 = Comment()
        comment3.request = request1
        comment3.author = self.admin_user
        comment3.text = 'Sample text - Admin'
        comment3.save()

        # Create 3 sample Rating objects with different authors
        rating1 = Rating()
        rating1.video = video1
        rating1.author = self.normal_user
        rating1.rating = 5
        rating1.review = 'Sample text - User'
        rating1.save()

        rating2 = Rating()
        rating2.video = video1
        rating2.author = self.staff_user
        rating2.rating = 3
        rating2.review = 'Sample text - Staff'
        rating2.save()

        rating3 = Rating()
        rating3.video = video1
        rating3.author = self.admin_user
        rating3.rating = 1
        rating3.review = 'Sample text - Admin'
        rating3.save()

    def test_admin_can_get_requests(self):
        self.authorize_user('test_admin1', 'password')
        response = self.client.get('/api/v1/admin/requests/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['count'], 1)
        self.assertEqual(response.data['results'][0]['title'], 'Test Request 1')
