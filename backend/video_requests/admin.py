from django.contrib import admin
from django.db.models import Avg
from django.urls import reverse
from django.utils.html import format_html
from simple_history.admin import SimpleHistoryAdmin
from video_requests.models import Comment, CrewMember, Rating, Request, Video


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
    search_fields = ["title"]

    def num_of_videos(self, obj):
        return Video.objects.filter(request=obj).count()

    num_of_videos.short_description = "Number of Videos"

    def requester_link(self, obj):
        url = reverse("admin:auth_user_change", args=(obj.requester.id,))
        return format_html(f'<a href="{url}">{obj.requester.get_full_name()}</a>')

    requester_link.short_description = "Requester"


class CrewMemberHistoryAdmin(SimpleHistoryAdmin):
    list_display = ["id", "request_link", "position", "member_link"]
    search_fields = ["request__title"]

    def request_link(self, obj):
        url = reverse("admin:video_requests_request_change", args=(obj.request.id,))
        return format_html(f'<a href="{url}">{obj.request.title}</a>')

    request_link.short_description = "Request"

    def member_link(self, obj):
        url = reverse("admin:auth_user_change", args=(obj.member.id,))
        return format_html(f'<a href="{url}">{obj.member.get_full_name()}</a>')

    member_link.short_description = "Crew Member"


class VideoHistoryAdmin(SimpleHistoryAdmin):
    list_display = ["id", "title", "status", "request_link", "avg_rating"]
    search_fields = ["title"]

    def request_link(self, obj):
        url = reverse("admin:video_requests_request_change", args=(obj.request.id,))
        return format_html(f'<a href="{url}">{obj.request.title}</a>')

    request_link.short_description = "Request"

    def avg_rating(self, obj):
        return Rating.objects.filter(video=obj).aggregate(Avg("rating"))["rating__avg"]

    avg_rating.short_description = "Average Rating"


class CommentHistoryAdmin(SimpleHistoryAdmin):
    list_display = ["id", "request_link", "part_of_comment", "author_link"]
    search_fields = ["request__title"]

    def part_of_comment(self, obj):
        return obj.text[:100]

    part_of_comment.short_description = "Comment"

    def request_link(self, obj):
        url = reverse("admin:video_requests_request_change", args=(obj.request.id,))
        return format_html(f'<a href="{url}">{obj.request.title}</a>')

    request_link.short_description = "Request"

    def author_link(self, obj):
        url = reverse("admin:auth_user_change", args=(obj.author.id,))
        return format_html(f'<a href="{url}">{obj.author.get_full_name()}</a>')

    author_link.short_description = "Author"


class RatingHistoryAdmin(SimpleHistoryAdmin):
    list_display = [
        "id",
        "video_link",
        "rating",
        "part_of_review",
        "author_link",
    ]
    search_fields = ["request__title"]

    def part_of_review(self, obj):
        return obj.review[:100]

    part_of_review.short_description = "Review"

    def video_link(self, obj):
        url = reverse("admin:video_requests_video_change", args=(obj.video.id,))
        return format_html(f'<a href="{url}">{obj.video.title}</a>')

    video_link.short_description = "Video"

    def author_link(self, obj):
        url = reverse("admin:auth_user_change", args=(obj.author.id,))
        return format_html(f'<a href="{url}">{obj.author.get_full_name()}</a>')

    author_link.short_description = "Author"


admin.site.register(Request, RequestHistoryAdmin)
admin.site.register(CrewMember, CrewMemberHistoryAdmin)
admin.site.register(Video, VideoHistoryAdmin)
admin.site.register(Comment, CommentHistoryAdmin)
admin.site.register(Rating, RatingHistoryAdmin)
