from django.shortcuts import render
from rest_framework import viewsets, generics, permissions, parsers, status
from rest_framework.decorators import action
from rest_framework.response import Response

from openjobs_app.models import User
from openjobs_app.serializers import UserSerializer


class UserView(viewsets.ViewSet, generics.CreateAPIView):
    queryset = User.objects.filter(active=True)
    serializer_class = UserSerializer
    parser_classes = [parsers.MultiPartParser]

    @action(methods=['get'], url_path='current-user' ,detail=False, permission_classes=[permissions.IsAuthenticated])
    def get_current_user(self, request):
        return Response(UserSerializer(request.user).data, status=status.HTTP_200_OK)

