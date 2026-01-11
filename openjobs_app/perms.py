from rest_framework import permissions

from openjobs_app.models import RoleUser


class isEmployer(permissions.BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated
                    and request.user.role==RoleUser.EMPLOYER)

    def has_object_permission(self, request, view, obj):
        return obj.job.employer.managed_employers.filter(user=request.user).exists()
