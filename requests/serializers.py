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
        fields = ('id', 'created', 'author', 'rating', 'review')
        read_only_fields = ('id', 'created', 'author')


class CommentSerializer(serializers.ModelSerializer):
    author = UserSerializer(read_only=True)

    class Meta:
        model = Comment
        fields = ('id', 'created', 'author', 'text', 'internal')
        read_only_fields = ('id', 'created', 'author')


class VideoSerializer(serializers.ModelSerializer):
    ratings = RatingSerializer(many=True, read_only=True)
    editor = UserSerializer(read_only=True)

    class Meta:
        model = Video
        fields = ('id', 'title', 'editor', 'additional_data', 'ratings')
        read_only_fields = ('id',)


class CrewMemberSerializer(serializers.ModelSerializer):
    member = UserSerializer(read_only=True)

    class Meta:
        model = CrewMember
        fields = ('id', 'member', 'position')


class RequestSerializer(serializers.ModelSerializer):
    crew = CrewMemberSerializer(many=True, read_only=True)
    videos = VideoSerializer(many=True, read_only=True)
    comments = CommentSerializer(many=True, read_only=True)

    class Meta:
        model = Request
        fields = ('id', 'title', 'created', 'time', 'type', 'place', 'status',
                  'responsible', 'requester', 'additional_data', 'crew', 'videos', 'comments')
