from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .models import Request, Comment, CrewMember, Video, Rating
from .serializers import RequestSerializer, CommentSerializer, CrewMemberSerializer, VideoSerializer, RatingSerializer


class RequestListCreateView(generics.ListCreateAPIView):
    """ GET + POST /requests """
    queryset = Request.objects.all()
    serializer_class = RequestSerializer

    def create(self, request, *args, **kwargs):
        super(RequestListCreateView, self).create(request, args, kwargs)
        response = {"status_code": status.HTTP_200_OK,
                    "message": "Successfully created",
                    "result": request.data}
        return Response(response)


class RequestDetailView(generics.RetrieveUpdateDestroyAPIView):
    """ GET, PUT, PATCH, DELETE /requests/{id} """
    queryset = Request.objects.all()
    serializer_class = RequestSerializer

    def retrieve(self, request, *args, **kwargs):
        super(RequestDetailView, self).retrieve(request, args, kwargs)
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        data = serializer.data
        response = {"status_code": status.HTTP_200_OK,
                    "message": "Successfully retrieved",
                    "result": data}
        return Response(response)

    def patch(self, request, *args, **kwargs):
        super(RequestDetailView, self).patch(request, args, kwargs)
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        data = serializer.data
        response = {"status_code": status.HTTP_200_OK,
                    "message": "Successfully updated",
                    "result": data}
        return Response(response)

    def delete(self, request, *args, **kwargs):
        super(RequestDetailView, self).delete(request, args, kwargs)
        response = {"status_code": status.HTTP_200_OK,
                    "message": "Successfully deleted"}
        return Response(response)


class CommentListCreateView(generics.ListCreateAPIView):
    serializer_class = CommentSerializer
    permission_classes = (IsAuthenticated,)

    def get_queryset(self):
        return Comment.objects.filter(request=self.kwargs['requestId'])

    def perform_create(self, serializer):
        serializer.save(request=Request.objects.get(id=self.kwargs['requestId']),
                        author=self.request.user)


class CommentDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = CommentSerializer

    def get_queryset(self):
        return Comment.objects.filter(request=self.kwargs['requestId'])


class CrewListCreateView(generics.ListCreateAPIView):
    serializer_class = CrewMemberSerializer

    def get_queryset(self):
        return CrewMember.objects.filter(request=self.kwargs['requestId'])

    def perform_create(self, serializer):
        serializer.save(request=Request.objects.get(id=self.kwargs['requestId']))


class CrewDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = CrewMemberSerializer

    def get_queryset(self):
        return CrewMember.objects.filter(request=self.kwargs['requestId'])


class VideoListCreateView(generics.ListCreateAPIView):
    serializer_class = VideoSerializer
    permission_classes = (IsAuthenticated,)

    def get_queryset(self):
        return Video.objects.filter(request=self.kwargs['requestId'])

    def perform_create(self, serializer):
        serializer.save(request=Request.objects.get(id=self.kwargs['requestId']))


class VideoDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = VideoSerializer
    permission_classes = (IsAuthenticated,)

    def get_queryset(self):
        return Video.objects.filter(request=self.kwargs['requestId'])


class RatingListCreateView(generics.ListCreateAPIView):
    serializer_class = RatingSerializer

    def get_queryset(self):
        return Rating.objects.filter(video=self.kwargs['videoId'])

    def perform_create(self, serializer):
        serializer.save(video=Video.objects.get(id=self.kwargs['videoId']))


class RatingDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = RatingSerializer

    def get_queryset(self):
        return Rating.objects.filter(
            video=Video.objects.get(request=self.kwargs['requestId'], id=self.kwargs['videoId']))
