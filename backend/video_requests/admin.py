from django.contrib import admin
from django.contrib.admin import ModelAdmin
from django.db.models import Avg
from django.urls import reverse
from django.utils.html import format_html
from simple_history.admin import SimpleHistoryAdmin

from video_requests.models import Comment, CrewMember, Rating, Request, Todo, Video


@admin.register(Request)
class RequestHistoryAdmin(SimpleHistoryAdmin):
    list_display = [
        "id",
        "title",
        "status",
        "start_datetime",
        "end_datetime",
        "num_of_videos",
        "requester_link",
    ]
    exclude = ["requested_by"]
    readonly_fields = ["requested_by"]
    search_fields = ["title"]

    @admin.display(description="Number of Videos")
    def num_of_videos(self, obj):
        return Video.objects.filter(request=obj).count()

    @admin.display(description="Requester")
    def requester_link(self, obj):
        url = reverse("admin:auth_user_change", args=(obj.requester.id,))
        return format_html(f'<a href="{url}">{obj.requester.get_full_name()}</a>')

    def save_model(self, request, obj, form, change):
        if not change:
            obj.requested_by = request.user
        super().save_model(request, obj, form, change)


@admin.register(CrewMember)
class CrewMemberHistoryAdmin(SimpleHistoryAdmin):
    list_display = ["id", "request_link", "position", "member_link"]
    search_fields = ["request__title"]

    @admin.display(description="Request")
    def request_link(self, obj):
        url = reverse("admin:video_requests_request_change", args=(obj.request.id,))
        return format_html(f'<a href="{url}">{obj.request.title}</a>')

    @admin.display(description="Crew Member")
    def member_link(self, obj):
        url = reverse("admin:auth_user_change", args=(obj.member.id,))
        return format_html(f'<a href="{url}">{obj.member.get_full_name()}</a>')


@admin.register(Video)
class VideoHistoryAdmin(SimpleHistoryAdmin):
    list_display = ["id", "title", "status", "request_link", "avg_rating"]
    search_fields = ["title"]

    @admin.display(description="Request")
    def request_link(self, obj):
        url = reverse("admin:video_requests_request_change", args=(obj.request.id,))
        return format_html(f'<a href="{url}">{obj.request.title}</a>')

    @admin.display(description="Average Rating")
    def avg_rating(self, obj):
        return Rating.objects.filter(video=obj).aggregate(Avg("rating"))["rating__avg"]


@admin.register(Comment)
class CommentHistoryAdmin(SimpleHistoryAdmin):
    list_display = ["id", "request_link", "part_of_comment", "author_link"]
    search_fields = ["request__title"]

    @admin.display(description="Comment")
    def part_of_comment(self, obj):
        return obj.text[:100]

    @admin.display(description="Request")
    def request_link(self, obj):
        url = reverse("admin:video_requests_request_change", args=(obj.request.id,))
        return format_html(f'<a href="{url}">{obj.request.title}</a>')

    @admin.display(description="Author")
    def author_link(self, obj):
        url = reverse("admin:auth_user_change", args=(obj.author.id,))
        return format_html(f'<a href="{url}">{obj.author.get_full_name()}</a>')


@admin.register(Rating)
class RatingHistoryAdmin(SimpleHistoryAdmin):
    list_display = [
        "id",
        "video_link",
        "rating",
        "part_of_review",
        "author_link",
    ]
    search_fields = ["request__title"]

    @admin.display(description="Review")
    def part_of_review(self, obj):
        return obj.review[:100]

    @admin.display(description="Video")
    def video_link(self, obj):
        url = reverse("admin:video_requests_video_change", args=(obj.video.id,))
        return format_html(f'<a href="{url}">{obj.video.title}</a>')

    @admin.display(description="Author")
    def author_link(self, obj):
        url = reverse("admin:auth_user_change", args=(obj.author.id,))
        return format_html(f'<a href="{url}">{obj.author.get_full_name()}</a>')


@admin.register(Todo)
class TodoAdmin(ModelAdmin):
    list_display = [
        "id",
        "created",
        "request_link",
        "video_link",
        "description",
        "assignee_names",
    ]
    search_fields = ["request__title", "video__title"]

    @admin.display(description="Request")
    def request_link(self, obj):
        url = reverse("admin:video_requests_request_change", args=(obj.request.id,))
        return format_html(f'<a href="{url}">{obj.request.title}</a>')

    @admin.display(description="Video")
    def video_link(self, obj):
        if obj.video:
            url = reverse("admin:video_requests_video_change", args=(obj.video.id,))
            return format_html(f'<a href="{url}">{obj.video.title}</a>')
        return None

    @admin.display(description="Assignees")
    def assignee_names(self, obj):
        names = ""
        for assignee in obj.assignees.all():
            url = reverse("admin:auth_user_change", args=(assignee.id,))
            names += f'<a href="{url}">{assignee.get_full_name_eastern_order()}</a>&comma;&nbsp;'
        if names:
            names = names[:-13]
        return format_html(names)
