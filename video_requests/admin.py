from django.contrib import admin

from .models import Comment, CrewMember, Video, Request, Rating

admin.site.register([Request, Video, Comment, CrewMember, Rating])
