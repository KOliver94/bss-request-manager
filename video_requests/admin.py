from django.contrib import admin

from video_requests.models import Comment, CrewMember, Video, Request, Rating

admin.site.register([Request, Video, Comment, CrewMember, Rating])
