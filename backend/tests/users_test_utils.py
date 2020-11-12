import datetime
import uuid

from django.contrib.auth.models import User

PASSWORD = "ae9U$89z#zyA!YoPE$6m"


def get_default_password():
    return PASSWORD


def create_user(username=None, password=PASSWORD, is_staff=False, is_admin=False):
    suffix = datetime.datetime.now().strftime("%y%m%d_%H%M%S")
    username = username if username else str(uuid.uuid4())
    user = User.objects.create_user(
        username=username, password=password, email=f"{username}@example.com"
    )
    if is_admin:
        user.first_name = "Admin"
    elif is_staff:
        user.first_name = "Staff"
    else:
        user.first_name = "User"
    user.last_name = f"Test_{suffix}"
    user.is_staff = is_staff or is_admin
    user.is_superuser = is_admin
    user.userprofile.avatar_url = "https://via.placeholder.com/150"
    user.userprofile.phone_number = "+36701234567"
    user.save()
    return user
