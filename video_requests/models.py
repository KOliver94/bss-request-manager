from django.contrib.auth.models import User
from django.contrib.postgres.fields import JSONField
from django.db import models
from simple_history.models import HistoricalRecords

from common.models import AbstractComment, AbstractRating
from video_requests.choices import REQUEST_STATUS_CHOICES, VIDEO_STATUS_CHOICES


class Request(models.Model):
    title = models.CharField(max_length=100)
    created = models.DateTimeField(auto_now_add=True)
    date = models.DateField()
    type = models.CharField(max_length=50)
    place = models.CharField(max_length=150)
    status = models.IntegerField(choices=REQUEST_STATUS_CHOICES, default=1)
    responsible = models.ForeignKey(User, related_name='responsible_user', on_delete=models.SET_NULL, blank=True,
                                    null=True)
    requester = models.ForeignKey(User, related_name='requester_user', on_delete=models.SET_NULL, null=True)
    additional_data = JSONField(default=dict, blank=True)
    history = HistoricalRecords()

    def __str__(self):
        return f'{self.title} - {self.date}'


class CrewMember(models.Model):
    member = models.ForeignKey(User, on_delete=models.CASCADE)
    request = models.ForeignKey(Request, on_delete=models.CASCADE, related_name='crew')
    position = models.CharField(max_length=20)

    def __str__(self):
        return f'{self.request.title} - {self.position} - {self.member.get_full_name()}'


class Video(models.Model):
    title = models.CharField(max_length=100)
    request = models.ForeignKey(Request, on_delete=models.CASCADE, related_name='videos')
    editor = models.ForeignKey(User, on_delete=models.SET_NULL, blank=True, null=True)
    status = models.IntegerField(choices=VIDEO_STATUS_CHOICES, default=1)
    additional_data = JSONField(default=dict, blank=True)
    history = HistoricalRecords()

    def __str__(self):
        return f'{self.request.title} - {self.title}'


class Comment(AbstractComment):
    request = models.ForeignKey(Request, on_delete=models.CASCADE, related_name='comments')

    def __str__(self):
        return f'{self.author.get_full_name()} - {self.text}'


class Rating(AbstractRating):
    video = models.ForeignKey(Video, on_delete=models.CASCADE, related_name='ratings')

    def __str__(self):
        return f'{self.video.title} - {self.author.get_full_name()} ({self.rating})'
