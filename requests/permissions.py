from rest_framework import permissions


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


class IsSelfOrStaff(permissions.BasePermission):
    """
    Allows access only to staff members and if the user was the author.
    """

    def has_object_permission(self, request, view, obj):
        return obj.author == request.user or request.user.is_staff


class IsSelfOrAdmin(permissions.BasePermission):
    """
    Allows access only to admin members and if the user was the author.
    """

    def has_object_permission(self, request, view, obj):
        return obj.author == request.user or request.user.is_superuser


class IsStaffSelfOrAdmin(permissions.BasePermission):
    """
    Allows access only to admin members and if the user was the author and is staff member.
    """

    def has_object_permission(self, request, view, obj):
        return (obj.author == request.user and request.user.is_staff) or request.user.is_superuser
