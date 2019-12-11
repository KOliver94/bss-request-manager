from django.contrib.auth.models import User
from rest_framework import serializers

from .models import Request, Video, CrewMember, Rating, Comment


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('first_name', 'last_name', 'username')


class RatingSerializer(serializers.ModelSerializer):
    author = UserSerializer(read_only=True)

    class Meta:
        model = Rating
        fields = ('id', 'rating', 'review', 'created', 'author')
        read_only_fields = ('video', 'author')


class CommentSerializer(serializers.ModelSerializer):
    author = UserSerializer(read_only=True)

    class Meta:
        model = Comment
        fields = ('id', 'created', 'text', 'internal', 'author')
        read_only_fields = ('request', 'author')


class VideoSerializer(serializers.ModelSerializer):
    ratings = RatingSerializer(many=True, read_only=True)
    editor = UserSerializer(read_only=True)

    class Meta:
        model = Video
        fields = ('id', 'title', 'editor', 'statuses', 'ratings')
        read_only_fields = ('request',)


class CrewMemberSerializer(serializers.ModelSerializer):
    member = UserSerializer(read_only=True)

    class Meta:
        model = CrewMember
        fields = ('id', 'member', 'position')
        read_only_fields = ('request',)


class RequestSerializer(serializers.ModelSerializer):
    crew = CrewMemberSerializer(many=True, read_only=True)
    videos = VideoSerializer(many=True, read_only=True)
    comments = CommentSerializer(many=True, read_only=True)

    class Meta:
        model = Request
        fields = ('id', 'title', 'created', 'time', 'type', 'place', 'path_to_footage', 'status',
                  'responsible', 'requester', 'crew', 'videos', 'comments')
