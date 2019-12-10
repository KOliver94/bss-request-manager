from rest_framework import generics, status
from rest_framework.response import Response

from .models import Request
from .serializers import RequestSerializer


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
