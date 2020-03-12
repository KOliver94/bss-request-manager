from abc import ABC

from django.contrib.auth.models import User
from rest_framework import serializers

from video_requests.models import Request, Video, Rating, Comment


class FilteredCommentListSerializer(serializers.ListSerializer, ABC):
    def to_representation(self, data):
        data = data.filter(internal=False)
        return super(FilteredCommentListSerializer, self).to_representation(data)


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('first_name', 'last_name', 'username',)


class RatingDefaultSerializer(serializers.ModelSerializer):
    author = UserSerializer(read_only=True)

    class Meta:
        model = Rating
        fields = ('id', 'created', 'author', 'rating', 'review',)
        read_only_fields = ('id', 'created', 'author',)


class CommentDefaultSerializer(serializers.ModelSerializer):
    author = UserSerializer(read_only=True)

    class Meta:
        model = Comment
        list_serializer_class = FilteredCommentListSerializer
        fields = ('id', 'created', 'author', 'text',)
        read_only_fields = ('id', 'created', 'author',)


class VideoDefaultSerializer(serializers.ModelSerializer):
    ratings = RatingDefaultSerializer(many=True, read_only=True)

    class Meta:
        model = Video
        fields = ('id', 'title', 'status', 'ratings',)
        read_only_fields = ('id', 'title', 'status', 'ratings',)


class RequestDefaultSerializer(serializers.ModelSerializer):
    videos = VideoDefaultSerializer(many=True, read_only=True)
    comments = CommentDefaultSerializer(many=True, read_only=True)
    requester = UserSerializer(read_only=True)
    responsible = UserSerializer(read_only=True)

    class Meta:
        model = Request
        fields = ('id', 'title', 'created', 'time', 'type', 'place', 'status',
                  'responsible', 'requester', 'videos', 'comments',)
        read_only_field = ('id', 'created', 'status', 'responsible', 'requester', 'videos', 'comments',)
