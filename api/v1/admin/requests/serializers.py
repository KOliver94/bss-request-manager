from django.contrib.auth.models import User
from rest_framework import serializers
from rest_framework.fields import IntegerField

from video_requests.models import Request, Video, CrewMember, Rating, Comment


def get_editor_from_id(validated_data):
    if 'editor_id' in validated_data:
        editor_id = validated_data.pop('editor_id')
        editor = User.objects.get(id=editor_id)
        validated_data['editor'] = editor


def get_responsible_from_id(validated_data):
    if 'responsible_id' in validated_data:
        responsible_id = validated_data.pop('responsible_id')
        responsible = User.objects.get(id=responsible_id)
        validated_data['responsible'] = responsible


def get_member_from_id(validated_data):
    member_id = validated_data.pop('member_id')
    member = User.objects.get(id=member_id)
    validated_data['member'] = member


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'first_name', 'last_name', 'username',)


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
    editor_id = IntegerField(write_only=True, required=False)

    class Meta:
        model = Video
        fields = ('id', 'title', 'editor', 'status', 'additional_data', 'ratings', 'editor_id',)
        read_only_fields = ('id', 'ratings',)

    def create(self, validated_data):
        get_editor_from_id(validated_data)
        return super(VideoAdminSerializer, self).create(validated_data)

    def update(self, instance, validated_data):
        get_editor_from_id(validated_data)
        return super(VideoAdminSerializer, self).update(instance, validated_data)


class CrewMemberAdminSerializer(serializers.ModelSerializer):
    member = UserSerializer(read_only=True)
    member_id = IntegerField(write_only=True, required=True)

    class Meta:
        model = CrewMember
        fields = ('id', 'member', 'position', 'member_id')

    def create(self, validated_data):
        get_member_from_id(validated_data)
        return super(CrewMemberAdminSerializer, self).create(validated_data)

    def update(self, instance, validated_data):
        get_member_from_id(validated_data)
        return super(CrewMemberAdminSerializer, self).update(instance, validated_data)


class RequestAdminSerializer(serializers.ModelSerializer):
    crew = CrewMemberAdminSerializer(many=True, read_only=True)
    videos = VideoAdminSerializer(many=True, read_only=True)
    comments = CommentAdminSerializer(many=True, read_only=True)
    requester = UserSerializer(read_only=True)
    responsible = UserSerializer(read_only=True)
    responsible_id = IntegerField(write_only=True, required=False)

    class Meta:
        model = Request
        fields = ('id', 'title', 'created', 'time', 'type', 'place', 'status',
                  'responsible', 'requester', 'additional_data', 'crew', 'videos', 'comments', 'responsible_id',)

    def create(self, validated_data):
        get_responsible_from_id(validated_data)
        return super(RequestAdminSerializer, self).create(validated_data)

    def update(self, instance, validated_data):
        get_responsible_from_id(validated_data)
        return super(RequestAdminSerializer, self).update(instance, validated_data)
