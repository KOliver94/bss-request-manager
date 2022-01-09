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
    return drf_exception_handler(exception, context)
