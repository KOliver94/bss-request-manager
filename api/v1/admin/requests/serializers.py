from django.contrib.auth.models import User
from rest_framework import serializers

from requests.models import Request, Video, CrewMember, Rating, Comment


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('first_name', 'last_name', 'username',)


class RatingAdminSerializer(serializers.ModelSerializer):
    author = UserSerializer(read_only=True)

    class Meta:
        model = Rating
        fields = ('id', 'created', 'author', 'rating', 'review',)
        read_only_fields = ('id', 'created', 'author',)


class CommentAdminSerializer(serializers.ModelSerializer):
    author = UserSerializer(read_only=True)

    class Meta:
        model = Comment
        fields = ('id', 'created', 'author', 'text', 'internal',)
        read_only_fields = ('id', 'created', 'author',)


class VideoAdminSerializer(serializers.ModelSerializer):
    ratings = RatingAdminSerializer(many=True, read_only=True)
    editor = UserSerializer(read_only=True)

    class Meta:
        model = Video
        fields = ('id', 'title', 'editor', 'status', 'additional_data', 'ratings',)
        read_only_fields = ('id', 'ratings',)


class CrewMemberAdminSerializer(serializers.ModelSerializer):
    member = UserSerializer(read_only=True)

    class Meta:
        model = CrewMember
        fields = ('id', 'member', 'position',)


class RequestAdminSerializer(serializers.ModelSerializer):
    crew = CrewMemberAdminSerializer(many=True, read_only=True)
    videos = VideoAdminSerializer(many=True, read_only=True)
    comments = CommentAdminSerializer(many=True, read_only=True)
    requester = UserSerializer(read_only=True)
    responsible = UserSerializer(read_only=True)

    class Meta:
        model = Request
        fields = ('id', 'title', 'created', 'time', 'type', 'place', 'status',
                  'responsible', 'requester', 'additional_data', 'crew', 'videos', 'comments',)
