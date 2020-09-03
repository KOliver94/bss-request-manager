from django.contrib.auth.models import User
from django.core.exceptions import ObjectDoesNotExist
from django.core.management import BaseCommand


class Command(BaseCommand):
    help = "Create default user with first ID in DB"

    def handle(self, *args, **options):
        try:
            user = User.objects.get(pk=1)
        except ObjectDoesNotExist:
            if not User.objects.exists():
                user = User.objects.create_user(
                    first_name="User", last_name="Default", username="defaultuser"
                )
                user.set_unusable_password()
                user.is_active = False
                user.save()
            else:
                raise Exception("There are users in the database but not with ID = 1.")

        if user.username != "defaultuser":
            raise Exception(
                f"The user with ID = 1 is not defaultuser. User found: {user.username}"
            )

        if user.pk != 1:
            raise Exception(
                "The default user was not created with ID = 1. Check the database and modify manually."
            )

        self.stdout.write(self.style.SUCCESS("Default user was created successfully."))
