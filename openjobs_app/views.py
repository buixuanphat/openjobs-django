from django.contrib.auth import authenticate, get_user_model
from django.contrib.auth.backends import ModelBackend
from django.shortcuts import render
from drf_yasg import openapi
from drf_yasg.utils import swagger_auto_schema
from oauth2_provider.models import AccessToken
from rest_framework import viewsets, generics, permissions, parsers, status, serializers, mixins
from rest_framework.authtoken.models import Token
from rest_framework.decorators import action
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView
from django.conf import settings

from openjobs.wsgi import application
from openjobs_app import perms, paginators
from openjobs_app.models import User, RoleUser, Job, UserEmployer, Application, ApplicationStatus, Category, \
    WorkingTime, Follow, Employer, Employment
from openjobs_app.perms import isEmployer
from openjobs_app.serializers import UserSerializer, CandidateRegistrationSerializer, EmployerRegistrationSerializer, \
    JobSerializer, ApplicationSerializer, CategorySerializer, WorkingTimeSerializer, FollowSerializer, \
    EmployerSerializer
from django.core.mail import send_mail


class CandidateRegistrationView(generics.CreateAPIView):
    serializer_class = CandidateRegistrationSerializer
    permission_classes = [AllowAny]
    parser_classes = [parsers.MultiPartParser, parsers.FormParser]

    @swagger_auto_schema(operation_description='CandidateRegistration')
    def post(self, request, *args, **kwargs):
        return super().post(request, *args, **kwargs)

class EmployerRegistrationView(generics.CreateAPIView):
    serializer_class = EmployerRegistrationSerializer
    permission_classes = [AllowAny]
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

    @action(methods=['get','patch','put'], detail=False, url_path='current-user')
    def get_current_user(self, request):
        user = self.request.user
        if request.method in ['PATCH', 'PUT']:
            serializers=UserSerializer(user,data=request.data,partial=True)
            if serializers.is_valid():
                serializers.save()
                return Response(serializers.data, status=status.HTTP_200_OK)
            return Response(serializers.errors, status=status.HTTP_400_BAD_REQUEST)
        if not user.is_active:
            return Response(
                {"error": "pending_approval", "message": "Tài khoản của bạn đang chờ quản trị viên phê duyệt."},
                status=status.HTTP_403_FORBIDDEN
            )
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
    pagination_class = paginators.ItemPaginator

    def get_permissions(self):
        if self.action in ['create', 'my_jobs']:
            return [perms.isEmployer()]
        if self.action in ['update', 'partial_update', 'destroy']:
            return [permissions.IsAuthenticated()]
        return [permissions.AllowAny()]

    @action(methods=['get'],detail=False,url_path='my-jobs')
    def my_jobs(self, request):
        user_emp_link = UserEmployer.objects.filter(user=request.user).first()
        if not user_emp_link:
            return Response({"detail": "Tài khoản của bạn chưa được liên kết với công ty nào."},
                            status=status.HTTP_404_NOT_FOUND)
        jobs = Job.objects.filter(employer=user_emp_link.employer, active=True).order_by('-created_date')
        page = self.paginate_queryset(jobs)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = self.get_serializer(jobs, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def perform_create(self, serializer):
        user_emp = UserEmployer.objects.filter(user=self.request.user).first()
        if user_emp:
            serializer.save(employer=user_emp.employer)





            # Gửi mail cho người theo dõi
            employer = user_emp.employer

            followers = Follow.objects.filter(employer=employer)

            emails = []
            for f in followers:
                emails.append(f.user.email)
            print(self.request.data)
            print(emails)
            send_mail(
                subject='Test mail',
                message=self.request.data.get('name'),
                from_email=None,
                recipient_list=emails,
                fail_silently=False,
            )
        else:
            raise serializers.ValidationError({"detail": "Lỗi xác thực Employer"})

    def perform_update(self, serializer):
        user_emp=UserEmployer.objects.filter(user=self.request.user).first()
        if user_emp and serializer.instance.employer==user_emp.employer:
            serializer.save()
        else:
            raise serializers.ValidationError({"detail": "Lỗi xác thực Employer"})
    def perform_destroy(self, instance):
        user_emp=UserEmployer.objects.filter(user=self.request.user).first()
        if user_emp and instance.employer==user_emp.employer:
            instance.active=False
            instance.save()
            return Response({"message": "Đã xóa tin tuyển dụng thành công!"},
                            status=status.HTTP_204_NO_CONTENT)
        else:
            return Response({"detail": "Bạn không có quyền xóa tin này!"},
                            status=status.HTTP_403_FORBIDDEN)

    @action(methods=['get'], detail=False, url_path='my-jobs')
    def my_jobs(self, request):
        user_emp=UserEmployer.objects.filter(user=request.user).first()
        if not user_emp:
            return Response({"detail": "Bạn không phải là Employer hợp lệ."}, status=403)
        is_history = request.query_params.get('history') == 'true'
        if is_history:
            jobs = Job.objects.filter(employer=user_emp.employer)
        else:
            jobs = Job.objects.filter(employer=user_emp.employer, active=True)

        jobs = jobs.order_by('-created_date')
        page = self.paginate_queryset(jobs)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = self.get_serializer(jobs, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def get_queryset(self):
        queryset=Job.objects.filter(active=True)

        q=self.request.query_params.get('name')
        if q:
            queryset = queryset.filter(name__icontains=q)

        location=self.request.query_params.get('location')
        if location:
            queryset=queryset.filter(location__icontains=location)

        min_salary=self.request.query_params.get('min_salary')
        if min_salary:
            queryset=queryset.filter(min_salary__gte=float(min_salary))

        category_id=self.request.query_params.get('category_id')
        if category_id and category_id!='null':
            queryset=queryset.filter(job_categories_links__category_id=category_id)

        working_time = self.request.query_params.get('working_time_id')
        if working_time:
            queryset = queryset.filter(job_time_slots__working_time__name__icontains=working_time)
        return queryset


    # Follow nhà tuyển dụng
    @action(methods=['post'],detail=True,url_path='follow', permission_classes=[permissions.IsAuthenticated])
    def follow (self, request, pk):
        employer= self.get_object().employer
        user = request.user
        follow = Follow.objects.filter(user=user,employer=employer).first()
        if follow:
            follow.delete()
        else:
            follow = Follow.objects.create(user=user,employer=employer)
        return Response(FollowSerializer(follow).data, status=status.HTTP_201_CREATED)


class ApplicationViewSet(mixins.CreateModelMixin,mixins.ListModelMixin,
                         mixins.RetrieveModelMixin,mixins.UpdateModelMixin,
                         viewsets.GenericViewSet):
    queryset = Application.objects.filter(active=True)
    serializer_class = ApplicationSerializer

    def get_queryset(self):
        user=self.request.user
        queryset = self.queryset
        if user.role == RoleUser.ADMIN or user.is_staff:
            queryset = queryset
        elif user.role == RoleUser.EMPLOYER:
            queryset = queryset.filter(job__employer__managing_users__user=user)
        else:
            queryset = queryset.filter(user=user)
        job_id = self.request.query_params.get('job_id')
        if job_id:
            queryset = queryset.filter(job_id=job_id)
        return queryset.order_by('-created_date')

    def get_permissions(self):
        if self.action=='change-status':
            return [permissions.IsAuthenticated(),isEmployer()]
        return [permissions.IsAuthenticated()]

    def perform_create(self, serializer):
        user=self.request.user
        cv_from_request=self.request.data.get('cv')
        if cv_from_request:
            serializer.save(user=user,cv=cv_from_request)
        else:
            user_cv = getattr(user, 'cv', None)
            if user_cv:
                serializer.save(user=user, cv=user_cv)
            else:
                serializer.save(user=user)

    @action(methods=['patch'], detail=True, url_path='change-status')
    def change_status(self, request, pk=None):
        application = self.get_object()
        new_status = self.request.data.get('status')

        valid_statuses = ApplicationStatus.values
        if new_status in valid_statuses:
            application.status=new_status
            application.save()

            # Nếu đồng ý thì tạo Employment
            Employment.objects.create()

            return Response({"msg":f"Đã cập nhật trạng thái thành công {application.get_status_display()}"},
                            status=status.HTTP_200_OK)
        return Response({"error":f"Trạng thái không hợp lê!"}, status=status.HTTP_400_BAD_REQUEST)


class CategoryView(viewsets.ModelViewSet, generics.ListAPIView):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [permissions.AllowAny]

class WorkingTimeViewSet(viewsets.ViewSet, generics.CreateAPIView):

    queryset = WorkingTime.objects.all()
    serializer_class = WorkingTimeSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        user = self.request.user

        user_employer = UserEmployer.objects.filter(user=user).first()
        if not user_employer:
            raise serializers.ValidationError("Người dùng không thuộc nhà tuyển dụng nào")

        serializer.save(employer=user_employer.employer)


class EmployerViewSet(viewsets.ViewSet):
    queryset = Employer.objects.filter(active=True)
    serializer_class = EmployerSerializer
    permission_classes = [permissions.IsAuthenticated]

    @action(methods=['get'], detail=False, url_path='working-times')
    def get_working_time(self, request):
        user=self.request.user
        employer = UserEmployer.objects.filter(user=user).first().employer
        working_times = WorkingTime.objects.filter(employer=employer).all()
        return Response(WorkingTimeSerializer(working_times, many=True).data)
















