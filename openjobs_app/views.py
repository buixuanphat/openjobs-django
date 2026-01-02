from django.contrib.auth import authenticate, get_user_model
from django.contrib.auth.backends import ModelBackend
from django.shortcuts import render
from drf_yasg import openapi
from drf_yasg.utils import swagger_auto_schema
from oauth2_provider.models import AccessToken
from rest_framework import viewsets, generics, permissions, parsers, status, serializers, mixins
from rest_framework.authtoken.models import Token
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView
from django.conf import settings

from openjobs.wsgi import application
from openjobs_app import perm
from openjobs_app.models import User, RoleUser, Job, UserEmployer, Application, ApplicationStatus, Category
from openjobs_app.perm import isEmployer
from openjobs_app.serializers import UserSerializer, CandidateRegistrationSerializer, EmployerRegistrationSerializer, \
    JobSerializer, ApplicationSerializer, CategorySerializer


class CandidateRegistrationView(generics.CreateAPIView):
    serializer_class = CandidateRegistrationSerializer
    permission_classes = [permissions.AllowAny()]
    parser_classes = [parsers.MultiPartParser, parsers.FormParser]

    @swagger_auto_schema(operation_description='CandidateRegistration')
    def post(self, request, *args, **kwargs):
        return super().post(request, *args, **kwargs)

class EmployerRegistrationView(generics.CreateAPIView):
    serializer_class = EmployerRegistrationSerializer
    permission_classes = [permissions.AllowAny()]
    parser_classes = [parsers.MultiPartParser,parsers.FormParser]

    @swagger_auto_schema(operation_description='EmployerRegistration',
                         manual_parameters=[
                             openapi.Parameter(
                                 name="images",
                                 in_=openapi.IN_FORM,
                                 type=openapi.TYPE_ARRAY,
                                 items=openapi.Items(type=openapi.TYPE_FILE),
                                 required=True,
                                 description="Chọn ít nhất 3 ảnh môi trường"
                             ),
                         ],
                         consumes=['multipart/form-data'])
    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

class UserProfileViewSet(viewsets.ViewSet):
    queryset = User.objects.filter(is_active=True)
    serializer_class = UserSerializer
    # parser_classes = [parsers.MultiPartParser, parsers.FormParser,parsers.JSONParser]

    def get_permissions(self):
        if self.action=='get_current_user':
            return [permissions.IsAuthenticated()]
        if self.action=='verify_employer':
            return [permissions.IsAdminUser()]
        return [permissions.AllowAny()]

    @action(methods=['get'], detail=False, url_path='current-user')
    def get_current_user(self, request):
        return Response(self.serializer_class(request.user).data, status=status.HTTP_200_OK)

    @action(methods=['post'], detail=True, url_path='verify-employer')
    def verify_employer(self, request, pk=None):
        try:
            user = User.objects.get(pk=pk,role=RoleUser.EMPLOYER)
            user.is_active = True
            user.save()
            return Response({'message': f"Đã duyệt Employer: {user.username}"}, status=status.HTTP_200_OK)
        except User.DoesNotExist:
            return Response({'message':'Không tìm thấy Employer'}, status=status.HTTP_404_NOT_FOUND)

class AuthInfo(APIView):
    def get(self,request):
        return Response(settings.OAUTH2_INFO,status=status.HTTP_200_OK)

####################
# MANAGE JOBS
####################


class JobViewSet(viewsets.ModelViewSet):
    queryset = Job.objects.filter(active=True)
    serializer_class = JobSerializer

    def get_permissions(self):
        if self.action=='create':
            return [perm.isEmployer()]

        if self.action in ['update', 'partial_update', 'destroy']:
            return [permissions.IsAuthenticated()]

        return [permissions.AllowAny()]


    def perform_create(self, serializer):
        user_emp_link = UserEmployer.objects.filter(user=self.request.user).first()
        if user_emp_link:
            serializer.save(employer=user_emp_link.employer)
        else:
            raise serializers.ValidationError({"detail": "Tài khoản của bạn chưa được liên kết "
                                                         "với công ty nào."})

    def get_queryset(self):
        queryset=Job.objects.filter(active=True)
        location=self.request.query_params.get('location')
        if location:
            queryset=queryset.filter(location__icontains=location)

        min_salary=self.request.query_params.get('min_salary')
        if min_salary:
            queryset=queryset.filter(min_salary__gte=min_salary)

        category_id=self.request.query_params.get('category_id')
        if category_id:
            queryset=queryset.filter(job_categories_links__category_id=category_id)

        working_time_id=self.request.query_params.get('working_time_id')
        if working_time_id:
            queryset=queryset.filter(job_time_slots__working_time_id=working_time_id)
        return queryset


class ApplicationViewSet(mixins.CreateModelMixin,mixins.ListModelMixin,
                         mixins.RetrieveModelMixin,mixins.UpdateModelMixin,
                         viewsets.GenericViewSet):
    queryset = Application.objects.filter(active=True)
    serializer_class = ApplicationSerializer

    def get_queryset(self):
        user=self.request.user
        if user.role == RoleUser.ADMIN or user.is_staff:
            return self.queryset
        if user.role == RoleUser.EMPLOYER:
            return self.queryset.filter(job__employer__managing_users__user=user)
        return self.queryset.filter(user=user)

    def get_permissions(self):
        if self.action=='change-status':
            return [permissions.IsAuthenticated(),isEmployer()]
        return [permissions.IsAuthenticated()]

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    @action(methods=['patch'], detail=True, url_path='change-status')
    def change_status(self, request, pk=None):
        application = self.get_object()
        status = self.request.data.get('status')

        valid_statuses = ApplicationStatus.values
        if status in valid_statuses:
            application.status=status
            application.save()
            return Response({"msg":f"Đã cập nhật trạng thái thành công {application.get_status_display()}"},
                            status=status.HTTP_200_OK)
        return Response({"error":f"Trạng thái không hợp lê!"}, status=status.HTTP_400_BAD_REQUEST)


class CategoryView(viewsets.ViewSet, generics.ListAPIView):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [permissions.AllowAny]


















