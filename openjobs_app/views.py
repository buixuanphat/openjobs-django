from django.shortcuts import render
from rest_framework import viewsets, generics, permissions, parsers, status
from rest_framework.decorators import action
from rest_framework.response import Response

from openjobs_app.models import User, RoleUser
from openjobs_app.serializers import UserSerializer, CandidateRegistrationSerializer, EmployerRegistrationSerializer


# class UserView(viewsets.ViewSet, generics.CreateAPIView):
#     queryset = User.objects.filter(active=True)
#     serializer_class = UserSerializer
#     parser_classes = [parsers.MultiPartParser]
#
#     @action(methods=['get'], url_path='current-user' ,detail=False, permission_classes=[permissions.IsAuthenticated])
#     def get_current_user(self, request):
#         return Response(UserSerializer(request.user).data, status=status.HTTP_200_OK)

class CandidateRegistrationView(generics.CreateAPIView):
    serializer_class = CandidateRegistrationSerializer
    permission_classes = [permissions.AllowAny]
    parser_classes = [parsers.MultiPartParser]

class EmployerRegistrationView(generics.CreateAPIView):
    serializer_class = EmployerRegistrationSerializer
    permission_classes = [permissions.AllowAny]
    parser_classes = [parsers.MultiPartParser]

class UserProfileViewSet(viewsets.ViewSet):
    parser_classes = [parsers.MultiPartParser]
    @action(methods=['get'], detail=False, url_path='current-user',
            permission_classes=[permissions.IsAuthenticated])
    def get_current_user(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data, status=status.HTTP_200_OK)

    @action(methods=['put', 'patch'], detail=False, url_path='update-profile',
            permission_classes=[permissions.IsAuthenticated])

    def update_profile(self, request):
        serializer = UserSerializer(request.user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)




