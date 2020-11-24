from django.contrib.auth import get_user_model
from django.contrib.auth.models import User
from django.core.validators import MaxValueValidator, MinValueValidator
from django.db import models
from phonenumber_field.modelfields import PhoneNumberField
from simple_history.models import HistoricalRecords


def get_sentinel_user():
    return get_user_model().objects.get_or_create(
        username="deleted",
        defaults={"first_name": "Felhasználó", "last_name": "Törölt"},
    )[0]


class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    avatar_url = models.URLField(blank=True)
    phone_number = PhoneNumberField(blank=True)

    def __str__(self):
        return f"{self.user.first_name} {self.user.last_name}'s ({self.user.username}) profile"


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
