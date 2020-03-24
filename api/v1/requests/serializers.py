from abc import ABC

from django.contrib.auth.models import User
from phonenumber_field.serializerfields import PhoneNumberField
from rest_framework import serializers
from rest_framework.fields import CharField, EmailField

from common.serializers import UserSerializer
from video_requests.models import Request, Video, Rating, Comment


class FilteredListSerializer(serializers.ListSerializer, ABC):
    def to_representation(self, data):
        if data.model is Comment:
            data = data.filter(internal=False)
        elif data.model is Rating:
            data = data.filter(author=self.context['request'].user)
        return super(FilteredListSerializer, self).to_representation(data)


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


def create_comment(comment_text, request):
    comment = Comment()
    comment.author = request.requester
    comment.text = comment_text
    comment.request = request
    comment.save()
    return comment


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

    def create(self, validated_data):
        comment_text = validated_data.pop('comment_text') if 'comment_text' in validated_data else None
        validated_data['requester'] = self.context['request'].user
        request = super(RequestDefaultSerializer, self).create(validated_data)
        if comment_text:
            request.comments.add(create_comment(comment_text, request))
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

    def create_user(self, validated_data):
        user = User()
        user.first_name = validated_data.pop('requester_first_name')
        user.last_name = validated_data.pop('requester_last_name')
        user.email = validated_data.pop('requester_email').lower()
        user.username = user.email
        user.set_unusable_password()
        user.is_active = False
        phone_number = validated_data.pop('requester_mobile') if 'requester_mobile' in validated_data else None

        if User.objects.filter(email__iexact=user.email).exists():
            # If user with given e-mail address already exist set it as requester but save the provided data.
            # The user's data will be not overwritten so useful to check phone number or anything else.
            additional_data = {
                'requester': {
                    'first_name': user.first_name,
                    'last_name': user.last_name,
                    'phone_number': phone_number.as_e164
                }}
            return User.objects.get(email__iexact=user.email), additional_data
        else:
            user.save()
            user.userprofile.phone_number = phone_number
            user.save()
            return user, None

    def create(self, validated_data):
        comment_text = validated_data.pop('comment_text') if 'comment_text' in validated_data else None
        validated_data['requester'], additional_data = self.create_user(validated_data)
        request = super(RequestAnonymousSerializer, self).create(validated_data)
        if additional_data:
            request.additional_data = additional_data
        if comment_text:
            request.comments.add(create_comment(comment_text, request))
        request.save()
        return request
