from datetime import timedelta

from common.models import AbstractComment, AbstractRating
from django.contrib.auth.models import User
from django.db import models
from django.db.models import JSONField
from jsonschema import ValidationError as JsonValidationError
from jsonschema import validate
from rest_framework.exceptions import ValidationError
from simple_history.models import HistoricalRecords
from video_requests.choices import REQUEST_STATUS_CHOICES, VIDEO_STATUS_CHOICES
from video_requests.schemas import (
    REQUEST_ADDITIONAL_DATA_SCHEMA,
    VIDEO_ADDITIONAL_DATA_SCHEMA,
)


def validate_request_additional_data(value):
    try:
        validate(value, REQUEST_ADDITIONAL_DATA_SCHEMA)
    except JsonValidationError as e:
        raise ValidationError(e)


def validate_video_additional_data(value):
    try:
        validate(value, VIDEO_ADDITIONAL_DATA_SCHEMA)
    except JsonValidationError as e:
        raise ValidationError(e)


class Request(models.Model):
    title = models.CharField(max_length=200)
    created = models.DateTimeField(auto_now_add=True)
    start_datetime = models.DateTimeField()
    end_datetime = models.DateTimeField()
    deadline = models.DateField()
    type = models.CharField(max_length=50)
    place = models.CharField(max_length=150)
    status = models.PositiveSmallIntegerField(choices=REQUEST_STATUS_CHOICES, default=1)
    responsible = models.ForeignKey(
        User,
        related_name="responsible_user",
        on_delete=models.SET_NULL,
        blank=True,
        null=True,
    )
    requester = models.ForeignKey(
        User, related_name="requester_user", on_delete=models.SET_NULL, null=True
    )
    additional_data = JSONField(
        validators=[validate_request_additional_data], default=dict, blank=True
    )
    history = HistoricalRecords()

    def clean(self):
        super().clean()
        if not (self.start_datetime <= self.end_datetime):
            raise ValidationError("Start time must be earlier than end.")
        if not (self.end_datetime < self.deadline):
            raise ValidationError("Deadline must be later than end of the event.")

    def save(self, *args, **kwargs):
        if not self.deadline:
            self.deadline = self.end_datetime + timedelta(weeks=3)
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.title} - {self.start_datetime}"


class CrewMember(models.Model):
    member = models.ForeignKey(User, on_delete=models.CASCADE)
    request = models.ForeignKey(Request, on_delete=models.CASCADE, related_name="crew")
    position = models.CharField(max_length=20)

    def __str__(self):
        return f"{self.request.title} - {self.position} - {self.member.get_full_name()}"


class Video(models.Model):
    title = models.CharField(max_length=200)
    request = models.ForeignKey(
        Request, on_delete=models.CASCADE, related_name="videos"
    )
    editor = models.ForeignKey(User, on_delete=models.SET_NULL, blank=True, null=True)
    status = models.PositiveSmallIntegerField(choices=VIDEO_STATUS_CHOICES, default=1)
    additional_data = JSONField(
        validators=[validate_video_additional_data], default=dict, blank=True
    )
    history = HistoricalRecords()

    def __str__(self):
        return f"{self.request.title} - {self.title}"


class Comment(AbstractComment):
    request = models.ForeignKey(
        Request, on_delete=models.CASCADE, related_name="comments"
    )

    def __str__(self):
        return f"{self.author.get_full_name()} - {self.text}"


class Rating(AbstractRating):
    video = models.ForeignKey(Video, on_delete=models.CASCADE, related_name="ratings")

    def __str__(self):
        return f"{self.video.title} - {self.author.get_full_name()} ({self.rating})"
