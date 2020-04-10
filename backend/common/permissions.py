from django.contrib.auth.models import User
from rest_framework import permissions

from video_requests.models import Comment, Rating, Request, Video


class IsStaffUser(permissions.BasePermission):
    """
    Allows access only to staff members.
    """

    def has_permission(self, request, view):
        return request.user and request.user.is_staff


class IsAdminUser(permissions.BasePermission):
    """
    Allows access only to admin members.
    """

    def has_permission(self, request, view):
        return request.user and request.user.is_superuser


class IsSelf(permissions.BasePermission):
    """
    Allows access only if the user is
    - Requester of the request OR
    - Requester of the request which contains the video OR
    - Author of the comment OR
    - Author of the rating
    - the requested user itself
    """

    def has_object_permission(self, request, view, obj):
        if isinstance(obj, Request):
            return obj.requester == request.user
        elif isinstance(obj, Video):
            return obj.request.requester == request.user
        elif isinstance(obj, Comment) or isinstance(obj, Rating):
            return obj.author == request.user
        elif isinstance(obj, User):
            return obj == request.user
        else:
            return False


class IsSelfOrStaff(permissions.BasePermission):
    """
    Allows access only to admin members and if the user is
    - Requester of the request OR
    - Requester of the request which contains the video OR
    - Author of the comment OR
    - Author of the rating
    - the requested user itself
    """

    def has_object_permission(self, request, view, obj):
        if isinstance(obj, Request):
            return obj.requester == request.user or request.user.is_staff
        elif isinstance(obj, Video):
            return obj.request.requester == request.user or request.user.is_staff
        elif isinstance(obj, Comment) or isinstance(obj, Rating):
            return obj.author == request.user or request.user.is_staff
        elif isinstance(obj, User):
            return obj == request.user or request.user.is_staff
        else:
            return False


class IsSelfOrAdmin(permissions.BasePermission):
    """
    Allows access only to admin members and if the user is
    - Requester of the request OR
    - Requester of the request which contains the video OR
    - Author of the comment OR
    - Author of the rating
    - the requested user itself
    """

    def has_object_permission(self, request, view, obj):
        if isinstance(obj, Request):
            return obj.requester == request.user or request.user.is_superuser
        elif isinstance(obj, Video):
            return obj.request.requester == request.user or request.user.is_superuser
        elif isinstance(obj, Comment) or isinstance(obj, Rating):
            return obj.author == request.user or request.user.is_superuser
        elif isinstance(obj, User):
            return obj == request.user or request.user.is_superuser
        else:
            return False


class IsStaffSelfOrAdmin(permissions.BasePermission):
    """
    Allows access only to admin members and if the user is staff member and
    - Requester of the request OR
    - Requester of the request which contains the video OR
    - Author of the comment OR
    - Author of the rating
    - the requested user itself
    """

    def has_object_permission(self, request, view, obj):
        if isinstance(obj, Request):
            return (obj.requester == request.user and request.user.is_staff) or request.user.is_superuser
        elif isinstance(obj, Video):
            return (obj.request.requester == request.user and request.user.is_staff) or request.user.is_superuser
        elif isinstance(obj, Comment) or isinstance(obj, Rating):
            return (obj.author == request.user and request.user.is_staff) or request.user.is_superuser
        elif isinstance(obj, User):
            return (obj == request.user and request.user.is_staff) or request.user.is_superuser
        else:
            return False
