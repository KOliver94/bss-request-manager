import logging
import time

logger = logging.getLogger("api.access")


class RequestLoggingMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        start = time.monotonic()
        response = self.get_response(request)
        duration_ms = (time.monotonic() - start) * 1000

        if response.status_code >= 400:
            logger.warning(
                "%s %s %s %.0fms user=%s ip=%s",
                request.method,
                request.get_full_path(),
                response.status_code,
                duration_ms,
                getattr(request.user, "id", None),
                request.META.get("REMOTE_ADDR"),
            )

        return response
