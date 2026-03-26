import logging

from django.core.exceptions import ValidationError as DjangoValidationError
from rest_framework.exceptions import ValidationError as DRFValidationError
from rest_framework.fields import get_error_detail
from rest_framework.views import exception_handler as drf_exception_handler

LOG = logging.getLogger(__name__)


def exception_handler(exception, context):
    # Transform model validation errors into an equivalent DRF ValidationError.
    if isinstance(exception, DjangoValidationError):
        exception = DRFValidationError(detail=get_error_detail(exception))

    # Call REST Framework's default exception handler with the transformed exception.
    response = drf_exception_handler(exception, context)

    if response is not None and response.status_code == 403:
        request = context.get("request")
        LOG.warning(
            "Permission denied: %s %s user=%s status=%s detail=%s",
            request.method if request else "?",
            request.get_full_path() if request else "?",
            getattr(request.user, "id", None) if request else None,
            response.status_code,
            response.data,
        )

    return response
