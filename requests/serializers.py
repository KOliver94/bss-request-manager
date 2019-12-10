from rest_framework import serializers

from .models import Request, Video, CrewMember, Rating, Comment


class RatingSerializer(serializers.ModelSerializer):
    class Meta:
        model = Rating
        fields = ('id', 'rating', 'review', 'created', 'author')


class CommentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Comment
        fields = '__all__'


class VideoSerializer(serializers.ModelSerializer):
    ratings = RatingSerializer(many=True, read_only=True)

    class Meta:
        model = Video
        fields = ('id', 'title', 'editor', 'statuses', 'ratings')


class CrewMemberSerializer(serializers.ModelSerializer):
    class Meta:
        model = CrewMember
        fields = ('id', 'member', 'position')


class RequestSerializer(serializers.ModelSerializer):
    crew = CrewMemberSerializer(many=True, read_only=True)
    videos = VideoSerializer(many=True, read_only=True)
    comments = CommentSerializer(many=True, read_only=True)

    class Meta:
        model = Request
        fields = ('title', 'created', 'time', 'type', 'place', 'path_to_footage', 'status',
                  'responsible', 'requester', 'crew', 'videos', 'comments')
