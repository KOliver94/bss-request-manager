from django.contrib.auth.models import User
from django.core.exceptions import ObjectDoesNotExist
from django.core.management import BaseCommand


class Command(BaseCommand):
    help = 'Create default user with first ID in DB'

    def handle(self, *args, **options):
        try:
            user = User.objects.get(pk=1)
        except ObjectDoesNotExist:
            user = User.objects.create(pk=1, first_name='User', last_name='Default', username='defaultuser')
            user.set_unusable_password()
            user.is_active = False
            user.save()

        if user.username != 'defaultuser':
            raise Exception(f'The user with ID = 1 is not defaultuser. User found: {user.username}')

        self.stdout.write(self.style.SUCCESS('Default user was created successfully.'))
