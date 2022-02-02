from django.contrib import admin
from django.contrib.admin import ModelAdmin
from django.contrib.auth import get_user_model
from django.contrib.auth.admin import UserAdmin
from django.db import IntegrityError
from django.urls import reverse
from django.utils.html import format_html

from common.models import Ban, UserProfile

USER_MODEL = get_user_model()


class UserProfileAdmin(ModelAdmin):
    list_display = ["user", "phone_number", "avatar_url", "user_link"]
    search_fields = ["user__username"]

    def user_link(self, obj):
        url = reverse("admin:auth_user_change", args=(obj.user.id,))
        return format_html(f'<a href="{url}">{obj.user.get_full_name()}</a>')

    user_link.short_description = "Link to User"


class ExtendedUserAdmin(UserAdmin):
    actions = [
        "ban_selected_users",
    ]

    def ban_selected_users(self, request, queryset):
        for user in queryset:
            try:
                Ban.objects.create(receiver=user, creator=request.user)
            except IntegrityError:
                continue
        self.message_user(request, "Successfully banned selected users.")


class BanAdmin(admin.ModelAdmin):
    list_display = ("receiver", "created", "reason", "creator")


admin.site.unregister(USER_MODEL)
admin.site.register(USER_MODEL, ExtendedUserAdmin)

admin.site.register(UserProfile, UserProfileAdmin)
admin.site.register(Ban, BanAdmin)
