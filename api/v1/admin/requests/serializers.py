from django.contrib.auth.models import User
from rest_framework import serializers
from rest_framework.fields import IntegerField, CharField

from common.serializers import UserSerializer
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


class HistoricalRecordField(serializers.ListField):
    child = serializers.DictField()

    def to_representation(self, data):
        return super().to_representation(data.values())


# noinspection PyAbstractClass
class HistorySerializer(serializers.Serializer):
    history = HistoricalRecordField(read_only=True)


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
        read_only_fields = ('id', 'editor', 'status', 'ratings',)
        write_only_fields = ('editor_id',)

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
        read_only_fields = ('id', 'member',)
        write_only_fields = ('member_id',)

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
    comment_text = CharField(write_only=True, required=False)

    class Meta:
        model = Request
        fields = ('id', 'title', 'created', 'date', 'type', 'place', 'status',
                  'responsible', 'requester', 'additional_data', 'crew', 'videos', 'comments', 'responsible_id',
                  'comment_text',)
        read_only_fields = (
            'id', 'created', 'status', 'responsible', 'requester', 'requester', 'crew', 'videos', 'comments',)
        write_only_fields = ('responsible_id', 'comment_text',)

    def create_comment(self, comment_text, request):
        comment = Comment()
        comment.author = self.context['request'].user
        comment.text = comment_text
        comment.request = request
        comment.save()
        return comment

    def create(self, validated_data):
        get_responsible_from_id(validated_data)
        comment_text = validated_data.pop('comment_text') if 'comment_text' in validated_data else None
        request = super(RequestAdminSerializer, self).create(validated_data)
        if comment_text:
            request.comments.add(self.create_comment(comment_text, request))
        return request

    def update(self, instance, validated_data):
        get_responsible_from_id(validated_data)
        validated_data.pop('comment_text') if 'comment_text' in validated_data else None
        return super(RequestAdminSerializer, self).update(instance, validated_data)
