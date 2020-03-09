from django.contrib.auth.models import User
from django.contrib.postgres.fields import JSONField
from django.core.validators import MinValueValidator, MaxValueValidator
from django.db import models

from video_requests.choices import REQUEST_STATUS_CHOICES, VIDEO_STATUS_CHOICES


class Request(models.Model):
    title = models.CharField(max_length=100)
    created = models.DateTimeField(auto_now_add=True)
    time = models.DateField()
    type = models.CharField(max_length=50)
    place = models.CharField(max_length=150)
    status = models.IntegerField(choices=REQUEST_STATUS_CHOICES, default=1)
    responsible = models.ForeignKey(User, related_name="responsible_user", on_delete=models.SET_NULL, blank=True,
                                    null=True)
    requester = models.ForeignKey(User, related_name="requester_user", on_delete=models.SET_NULL, null=True)
    additional_data = JSONField(default=dict)

    def __str__(self):
        return self.title


class CrewMember(models.Model):
    member = models.ForeignKey(User, on_delete=models.CASCADE)
    request = models.ForeignKey(Request, on_delete=models.CASCADE, related_name="crew")
    position = models.CharField(max_length=20)

    def __str__(self):
        return self.request.title + " - " + self.member.first_name + " (" + self.position + ")"


class Video(models.Model):
    title = models.CharField(max_length=100)
    request = models.ForeignKey(Request, on_delete=models.CASCADE, related_name="videos")
    editor = models.ForeignKey(User, on_delete=models.SET_NULL, blank=True, null=True)
    status = models.IntegerField(choices=VIDEO_STATUS_CHOICES, default=1)
    additional_data = JSONField()

    def __str__(self):
        return self.title


class Comment(models.Model):
    request = models.ForeignKey(Request, on_delete=models.CASCADE, related_name="comments")
    author = models.ForeignKey(User, on_delete=models.CASCADE)
    created = models.DateTimeField(auto_now_add=True)
    text = models.TextField()
    internal = models.BooleanField(default=False)

    def __str__(self):
        return self.author.last_name + " " + self.author.first_name + " - " + self.text


class Rating(models.Model):
    author = models.ForeignKey(User, on_delete=models.CASCADE)
    video = models.ForeignKey(Video, on_delete=models.CASCADE, related_name="ratings")
    rating = models.IntegerField(
        default=1,
        validators=[
            MaxValueValidator(5),
            MinValueValidator(1)
        ]
    )
    review = models.TextField()
    created = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.author.last_name + " " + self.author.first_name + "(" + str(self.rating) + ") - " + self.video.title
