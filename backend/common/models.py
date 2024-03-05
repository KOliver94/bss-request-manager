from django.contrib.auth import get_user_model
from django.contrib.auth.models import User
from django.core.exceptions import ValidationError
from django.core.serializers.json import DjangoJSONEncoder
from django.core.validators import MaxValueValidator, MinValueValidator
from django.db import models
from django.db.models import JSONField
from django.utils.translation import gettext_lazy as _
from jsonschema import FormatChecker
from jsonschema import ValidationError as JsonValidationError
from jsonschema import validate
from phonenumber_field.modelfields import PhoneNumberField
from simple_history.models import HistoricalRecords

from common.schemas import USER_PROFILE_AVATAR_SCHEMA


def get_sentinel_user():
    return get_user_model().objects.get_or_create(
        username="deleted",
        defaults={"first_name": "Felhasználó", "last_name": "Törölt"},
    )[0]


def get_anonymous_user():
    return get_user_model().objects.get_or_create(
        username="anonymous",
        defaults={"first_name": "Felhasználó", "last_name": "Nem Azonosított"},
    )[0]


def get_system_user():
    return get_user_model().objects.get_or_create(
        username="system",
        defaults={"first_name": "Automatizáció", "last_name": "Rendszer"},
    )[0]


def validate_profile_avatar(value):
    try:
        validate(value, USER_PROFILE_AVATAR_SCHEMA, format_checker=FormatChecker())
    except JsonValidationError as e:
        raise ValidationError(e)


class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, primary_key=True)
    avatar = JSONField(
        encoder=DjangoJSONEncoder,
        validators=[validate_profile_avatar],
        default=dict,
        blank=True,
    )
    phone_number = PhoneNumberField(blank=True)

    def __str__(self):
        return f"{self.user.get_full_name()}'s ({self.user.username}) profile"

    @property
    def avatar_url(self) -> str:
        return self.avatar.get(self.avatar.get("provider", None), None)


class Ban(models.Model):
    receiver = models.OneToOneField(
        User, on_delete=models.CASCADE, primary_key=True, unique=True
    )
    creator = models.ForeignKey(
        User,
        related_name="ban_creator",
        on_delete=models.SET_NULL,
        blank=True,
        null=True,
    )
    reason = models.CharField(max_length=100, blank=True)
    created = models.DateTimeField(auto_now_add=True)

    def clean(self):
        if self.receiver == self.creator:
            raise ValidationError({"receiver": [_("Users cannot ban themselves.")]})

    def save(self, *args, **kwargs):
        self.full_clean()
        return super().save(*args, **kwargs)


class AbstractComment(models.Model):
    author = models.ForeignKey(User, on_delete=models.SET(get_sentinel_user))
    created = models.DateTimeField(auto_now_add=True)
    text = models.TextField()
    internal = models.BooleanField(default=False)
    history = HistoricalRecords(inherit=True)

    class Meta:
        abstract = True


class AbstractRating(models.Model):
    author = models.ForeignKey(User, on_delete=models.SET(get_sentinel_user))
    rating = models.PositiveSmallIntegerField(
        validators=[MaxValueValidator(5), MinValueValidator(1)]
    )
    review = models.TextField(blank=True)
    created = models.DateTimeField(auto_now_add=True)
    history = HistoricalRecords(inherit=True)

    class Meta:
        abstract = True


class AbstractTodo(models.Model):
    assignees = models.ManyToManyField(User, blank=True)
    created = models.DateTimeField(auto_now_add=True)
    creator = models.ForeignKey(
        User, on_delete=models.SET(get_sentinel_user), related_name="todo_creator"
    )
    description = models.TextField()

    class Meta:
        abstract = True
