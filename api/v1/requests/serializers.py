from abc import ABC

from django.contrib.auth.models import User
from phonenumber_field.serializerfields import PhoneNumberField
from rest_framework import serializers
from rest_framework.fields import CharField, EmailField

from video_requests.models import Request, Video, Rating, Comment


class FilteredListSerializer(serializers.ListSerializer, ABC):
    def to_representation(self, data):
        if data.model is Comment:
            data = data.filter(internal=False)
        elif data.model is Rating:
            data = data.filter(author=self.context['request'].user)
        return super(FilteredListSerializer, self).to_representation(data)


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


class RatingFilteredSerializer(serializers.ModelSerializer):
    author = UserSerializer(read_only=True)

    class Meta:
        model = Rating
        list_serializer_class = FilteredListSerializer
        fields = ('id', 'created', 'author', 'rating', 'review',)
        read_only_fields = ('id', 'created', 'author',)


class CommentDefaultSerializer(serializers.ModelSerializer):
    author = UserSerializer(read_only=True)

    class Meta:
        model = Comment
        fields = ('id', 'created', 'author', 'text',)
        read_only_fields = ('id', 'created', 'author',)


class CommentFilteredSerializer(serializers.ModelSerializer):
    author = UserSerializer(read_only=True)

    class Meta:
        model = Comment
        list_serializer_class = FilteredListSerializer
        fields = ('id', 'created', 'author', 'text',)
        read_only_fields = ('id', 'created', 'author',)


class VideoDefaultSerializer(serializers.ModelSerializer):
    ratings = RatingFilteredSerializer(many=True, read_only=True)

    class Meta:
        model = Video
        fields = ('id', 'title', 'status', 'ratings',)
        read_only_fields = ('id', 'title', 'status', 'ratings',)


class RequestDefaultSerializer(serializers.ModelSerializer):
    videos = VideoDefaultSerializer(many=True, read_only=True)
    comments = CommentFilteredSerializer(many=True, read_only=True)
    requester = UserSerializer(read_only=True)
    responsible = UserSerializer(read_only=True)
    comment_text = CharField(write_only=True, required=False)

    class Meta:
        model = Request
        fields = ('id', 'title', 'created', 'time', 'type', 'place', 'status',
                  'responsible', 'requester', 'videos', 'comments', 'comment_text',)
        read_only_fields = ('id', 'created', 'status', 'responsible', 'requester', 'videos', 'comments',)

    def create_comment(self, comment_text, request):
        comment = Comment()
        comment.author = self.context['request'].user
        comment.text = comment_text
        comment.request = request
        comment.save()
        return comment

    def create(self, validated_data):
        comment_text = validated_data.pop('comment_text') if 'comment_text' in validated_data else None
        validated_data['requester'] = self.context['request'].user
        request = super(RequestDefaultSerializer, self).create(validated_data)
        if comment_text:
            request.comments.add(self.create_comment(comment_text, request))
        return request


class RequestAnonymousSerializer(serializers.ModelSerializer):
    requester = UserSerializer(read_only=True)
    comments = CommentFilteredSerializer(many=True, read_only=True)
    comment_text = CharField(write_only=True, required=False)
    requester_first_name = CharField(write_only=True, required=True)
    requester_last_name = CharField(write_only=True, required=True)
    requester_email = EmailField(write_only=True, required=True)
    requester_mobile = PhoneNumberField(write_only=True, required=False)

    class Meta:
        model = Request
        fields = ('id', 'title', 'time', 'type', 'place', 'comment_text', 'requester', 'comments',
                  'requester_first_name', 'requester_last_name', 'requester_email', 'requester_mobile',)

    def create_comment(self, comment_text, request):
        comment = Comment()
        comment.author = request.requester
        comment.text = comment_text
        comment.request = request
        comment.save()
        return comment

    def create_user(self, validated_data):
        user = User()
        user.first_name = validated_data.pop('requester_first_name')
        user.last_name = validated_data.pop('requester_last_name')
        user.email = validated_data.pop('requester_email').lower()
        user.username = user.email
        print(validated_data.pop('requester_mobile') if 'requester_mobile' in validated_data else None)
        user.set_unusable_password()
        user.is_active = False

        if User.objects.filter(email__iexact=user.email).exists():
            return User.objects.get(email__iexact=user.email)
        else:
            user.save()
            return user

    def create(self, validated_data):
        comment_text = validated_data.pop('comment_text') if 'comment_text' in validated_data else None
        validated_data['requester'] = self.create_user(validated_data)
        request = super(RequestAnonymousSerializer, self).create(validated_data)
        if comment_text:
            request.comments.add(self.create_comment(comment_text, request))
        return request
