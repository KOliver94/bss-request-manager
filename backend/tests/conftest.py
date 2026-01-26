from datetime import timedelta

from django.utils import timezone
from model_bakery import baker

# Ensure Request.end_datetime is always after start_datetime
_original_make = baker.make


def _patched_make(*args, **kwargs):
    from video_requests.models import Request

    # Check if we're making a Request model
    model = args[0] if args else kwargs.get("_model")
    is_request = model in (Request, "video_requests.Request", "Request")

    if is_request:
        if "start_datetime" not in kwargs:
            kwargs["start_datetime"] = timezone.now()
        if "end_datetime" not in kwargs:
            kwargs["end_datetime"] = kwargs["start_datetime"] + timedelta(hours=2)

    return _original_make(*args, **kwargs)


baker.make = _patched_make
