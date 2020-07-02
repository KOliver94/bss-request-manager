from django.contrib import admin
from simple_history.admin import SimpleHistoryAdmin
from video_requests.models import Comment, CrewMember, Rating, Request, Video

admin.site.register(Request, SimpleHistoryAdmin)
admin.site.register(Video, SimpleHistoryAdmin)
admin.site.register(Comment, SimpleHistoryAdmin)
admin.site.register(CrewMember, SimpleHistoryAdmin)
admin.site.register(Rating, SimpleHistoryAdmin)
