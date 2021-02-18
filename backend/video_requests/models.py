from datetime import datetime, timedelta

from common.models import AbstractComment, AbstractRating, get_sentinel_user
from django.contrib.auth.models import User
from django.core.exceptions import ValidationError
from django.core.serializers.json import DjangoJSONEncoder
from django.db import models
from django.db.models import Avg, JSONField
from jsonschema import FormatChecker
from jsonschema import ValidationError as JsonValidationError
from jsonschema import validate
from simple_history.models import HistoricalRecords
from video_requests.schemas import (
    REQUEST_ADDITIONAL_DATA_SCHEMA,
    VIDEO_ADDITIONAL_DATA_SCHEMA,
)


def validate_request_additional_data(value):
    try:
        validate(value, REQUEST_ADDITIONAL_DATA_SCHEMA, format_checker=FormatChecker())
    except JsonValidationError as e:
        raise ValidationError(e)


def validate_video_additional_data(value):
    try:
        validate(value, VIDEO_ADDITIONAL_DATA_SCHEMA, format_checker=FormatChecker())
    except JsonValidationError as e:
        raise ValidationError(e)


class AnnotatedManager(models.Manager):
    def get_queryset(self):
        return super().get_queryset().annotate(avg_rating=Avg("ratings__rating"))


class Request(models.Model):
    class Statuses(models.IntegerChoices):
        DENIED = 0, "Elutasítva"
        REQUESTED = 1, "Felkérés"
        ACCEPTED = 2, "Elvállalva"
        RECORDED = 3, "Leforgatva"
        UPLOADED = 4, "Beírva"
        EDITED = 5, "Megvágva"
        ARCHIVED = 6, "Archiválva"
        DONE = 7, "Lezárva"
        CANCELED = 9, "Szervezők által lemondva"
        FAILED = 10, "Meghiúsult"

    title = models.CharField(max_length=200)
    created = models.DateTimeField(auto_now_add=True)
    start_datetime = models.DateTimeField()
    end_datetime = models.DateTimeField()
    deadline = models.DateField(blank=True)
    type = models.CharField(max_length=50)
    place = models.CharField(max_length=150)
    status = models.PositiveSmallIntegerField(
        choices=Statuses.choices, default=Statuses.REQUESTED
    )
    responsible = models.ForeignKey(
        User,
        related_name="responsible_user",
        on_delete=models.SET_NULL,
        blank=True,
        null=True,
    )
    requester = models.ForeignKey(
        User, related_name="requester_user", on_delete=models.SET(get_sentinel_user)
    )
    additional_data = JSONField(
        encoder=DjangoJSONEncoder,
        validators=[validate_request_additional_data],
        default=dict,
        blank=True,
    )
    history = HistoricalRecords()

    def clean(self):
        super().clean()
        if not (self.start_datetime <= self.end_datetime):
            raise ValidationError("Start time must be earlier than end.")
        if self.deadline and not (self.end_datetime.date() < self.deadline):
            raise ValidationError("Deadline must be later than end of the event.")

    def save(self, *args, **kwargs):
        if not self.deadline:
            self.deadline = (self.end_datetime + timedelta(weeks=3)).date()
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.title} || {self.start_datetime.date()}"


class CrewMember(models.Model):
    member = models.ForeignKey(User, on_delete=models.CASCADE)
    request = models.ForeignKey(Request, on_delete=models.CASCADE, related_name="crew")
    position = models.CharField(max_length=20)

    def __str__(self):
        return f"{self.request.title} || {self.member.get_full_name_eastern_order()} - {self.position}"


class Video(models.Model):
    class Statuses(models.IntegerChoices):
        PENDING = 1, "Vágásra vár"
        IN_PROGRESS = 2, "Vágás alatt"
        EDITED = 3, "Megvágva"
        CODED = 4, "Kikódolva"
        PUBLISHED = 5, "Közzétéve"
        DONE = 6, "Lezárva"

    title = models.CharField(max_length=200)
    request = models.ForeignKey(
        Request, on_delete=models.CASCADE, related_name="videos"
    )
    editor = models.ForeignKey(
        User, on_delete=models.SET(get_sentinel_user), blank=True, null=True
    )
    status = models.PositiveSmallIntegerField(
        choices=Statuses.choices, default=Statuses.PENDING
    )
    additional_data = JSONField(
        encoder=DjangoJSONEncoder,
        validators=[validate_video_additional_data],
        default=dict,
        blank=True,
    )
    history = HistoricalRecords()
    objects = AnnotatedManager()

    __original_aired = None

    def __init__(self, *args, **kwargs):
        super(Video, self).__init__(*args, **kwargs)
        self.__original_aired = self.additional_data.get("aired", None)

    def save(self, *args, **kwargs):
        aired = self.additional_data.get("aired", None)
        if aired and aired != self.__original_aired:
            aired.sort(
                key=lambda date: datetime.strptime(date, "%Y-%m-%d"), reverse=True
            )
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.request.title} || {self.title}"


class Comment(AbstractComment):
    request = models.ForeignKey(
        Request, on_delete=models.CASCADE, related_name="comments"
    )

    def __str__(self):
        return f"{self.request.title} || {self.text} - {self.author.get_full_name_eastern_order()}"


class Rating(AbstractRating):
    video = models.ForeignKey(Video, on_delete=models.CASCADE, related_name="ratings")

    def __str__(self):
        return f"{self.video.title} || {self.author.get_full_name_eastern_order()} ({self.rating})"
