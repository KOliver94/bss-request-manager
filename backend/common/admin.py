from common.models import UserProfile
from django.contrib import admin
from django.contrib.admin import ModelAdmin
from django.urls import reverse
from django.utils.html import format_html


class UserProfileAdmin(ModelAdmin):
    list_display = ["id", "user_link", "phone_number", "avatar_url"]
    search_fields = ["user__username"]

    def user_link(self, obj):
        url = reverse("admin:auth_user_change", args=(obj.user.id,))
        return format_html(f'<a href="{url}">{obj.user.get_full_name()}</a>')

    user_link.short_description = "User"


admin.site.register(UserProfile, UserProfileAdmin)
