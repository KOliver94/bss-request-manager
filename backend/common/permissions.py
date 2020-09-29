from django.contrib.auth.models import User
from rest_framework.permissions import BasePermission, IsAuthenticated
from video_requests.models import Comment, Rating, Request, Video


def is_staff(user):
    return bool(user.is_staff or user.is_superuser)


class IsNotAuthenticated(BasePermission):
    """
    Allows access only to unauthenticated (anonymous) users.
    """

    def has_permission(self, request, view):
        return not request.user.is_authenticated


class IsStaffUser(BasePermission):
    """
    Allows access only to staff members and admins.
    """

    def has_permission(self, request, view):
        return bool(request.user and is_staff(request.user))


class IsAdminUser(BasePermission):
    """
    Allows access only to admin members.
    """

    def has_permission(self, request, view):
        return bool(request.user and request.user.is_superuser)


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
        elif isinstance(obj, User):
            return bool(obj == request.user)
        else:
            return False


class IsSelfOrStaff(IsAuthenticated):
    """
    Allows access only to admin members and if the authenticated user is
    - Requester of the request OR
    - Requester of the request which contains the video OR
    - Author of the comment OR
    - Author of the rating
    - the requested user itself
    """

    def has_object_permission(self, request, view, obj):
        if isinstance(obj, Request):
            return bool(obj.requester == request.user or is_staff(request.user))
        elif isinstance(obj, Video):
            return bool(obj.request.requester == request.user or is_staff(request.user))
        elif isinstance(obj, Comment) or isinstance(obj, Rating):
            return bool(obj.author == request.user or is_staff(request.user))
        elif isinstance(obj, User):
            return bool(obj == request.user or is_staff(request.user))
        else:
            return False


class IsSelfOrAdmin(IsAuthenticated):
    """
    Allows access only to admin members and if the authenticated user is
    - Requester of the request OR
    - Requester of the request which contains the video OR
    - Author of the comment OR
    - Author of the rating
    - the requested user itself
    """

    def has_object_permission(self, request, view, obj):
        if isinstance(obj, Request):
            return bool(obj.requester == request.user or request.user.is_superuser)
        elif isinstance(obj, Video):
            return bool(
                obj.request.requester == request.user or request.user.is_superuser
            )
        elif isinstance(obj, Comment) or isinstance(obj, Rating):
            return bool(obj.author == request.user or request.user.is_superuser)
        elif isinstance(obj, User):
            return bool(obj == request.user or request.user.is_superuser)
        else:
            return False


class IsStaffSelfOrAdmin(IsStaffUser, IsSelfOrAdmin):
    """
    Allows access only to admin members and if the authenticated user is staff member and
    - Requester of the request OR
    - Requester of the request which contains the video OR
    - Author of the comment OR
    - Author of the rating
    - the requested user itself

    This class is based on multiple inheritance. The sequence of the classes is important!
    """
