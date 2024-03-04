from django.contrib.auth.models import User
from rest_framework.permissions import BasePermission

from video_requests.models import Comment, Rating, Request, Todo, Video


def is_admin(user):
    return bool(not user.is_anonymous and user.is_admin)


class IsNotAuthenticated(BasePermission):
    """
    Allows access only to unauthenticated (anonymous) users.
    """

    def has_permission(self, request, view):
        return not request.user.is_authenticated


class IsAuthenticated(BasePermission):
    """
    Allows access only to authenticated users except service accounts.
    """

    def has_permission(self, request, view):
        return bool(
            request.user
            and request.user.is_authenticated
            and not request.user.is_service_account
        )


class IsStaffUser(BasePermission):
    """
    Allows access only to staff members and admins.
    """

    def has_permission(self, request, view):
        return bool(
            request.user
            and request.user.is_authenticated
            and request.user.is_staff
            and not request.user.is_service_account
        )


class IsAdminUser(BasePermission):
    """
    Allows access only to admin members.
    """

    def has_permission(self, request, view):
        return bool(
            request.user
            and request.user.is_authenticated
            and is_admin(request.user)
            and not request.user.is_service_account
        )


class IsServiceAccount(BasePermission):
    """
    Allows access only to service accounts.
    """

    def has_permission(self, request, view):
        return bool(
            request.user
            and request.user.is_authenticated
            and request.user.is_service_account
        )

    def has_object_permission(self, request, view, obj):
        if isinstance(obj, Request):
            return bool(obj.requested_by == request.user)
        else:
            return False


class IsSelf(IsAuthenticated):
    """
    Allows access only if the user is authenticated and
    - Requester of the request OR
    - Requester of the request which contains the video OR
    - Author of the comment OR
    - Author of the rating
    - the requested user itself
    """

    def has_object_permission(self, request, view, obj):
        if isinstance(obj, Request):
            return bool(obj.requester == request.user)
        elif isinstance(obj, Video):
            return bool(obj.request.requester == request.user)
        elif isinstance(obj, Comment) or isinstance(obj, Rating):
            return bool(obj.author == request.user)
        elif isinstance(obj, Todo):
            return bool(obj.creator == request.user)
        elif isinstance(obj, User):
            return bool(obj == request.user)
        else:
            return False


class IsSelfOrStaff(IsSelf):
    """
    Allows access only to admin members and if the authenticated user is
    - Requester of the request OR
    - Requester of the request which contains the video OR
    - Author of the comment OR
    - Author of the rating
    - the requested user itself
    """

    def has_object_permission(self, request, view, obj):
        if request.user.is_staff:
            return True
        return super().has_object_permission(request, view, obj)


class IsSelfOrAdmin(IsSelf):
    """
    Allows access only to admin members and if the authenticated user is
    - Requester of the request OR
    - Requester of the request which contains the video OR
    - Author of the comment OR
    - Author of the rating
    - the requested user itself
    """

    def has_object_permission(self, request, view, obj):
        if is_admin(request.user):
            return True
        return super().has_object_permission(request, view, obj)


class IsStaffSelfOrAdmin(IsStaffUser, IsSelfOrAdmin):
    """
    Allows access only to admin members and if the authenticated user is staff member and
    - Requester of the request OR
    - Request is requested by them OR
    - Requester of the request which contains the video OR
    - Author of the comment OR
    - Author of the rating
    - the requested user itself

    This class is based on multiple inheritance. The sequence of the classes is important!
    """

    def has_object_permission(self, request, view, obj):
        if isinstance(obj, Request) and bool(obj.requested_by == request.user):
            return True
        return super().has_object_permission(request, view, obj)
