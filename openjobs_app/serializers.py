from cloudinary.models import CloudinaryField
from django.conf import settings
from drf_yasg import openapi
from rest_framework import serializers
from openjobs_app.models import User, RoleUser, Employer, UserEmployer, Image, Job, Application, Category,WorkingTime

class UserSerializer(serializers.ModelSerializer):
    # avatar = serializers.ImageField(required=False,allow_null=True)
    company_images = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ['first_name', 'last_name', 'username', 'password' ,'gender', 'avatar' ,
                  'email', 'phone_number' ,'date_of_birth','role','cv','company_images']
        extra_kwargs = {
            'password': {
                'write_only': True,
                'style': {'input_type': 'password'}
            }
        }
    def get_company_images(self, obj):
        if obj.id and obj.role == RoleUser.EMPLOYER:
            try:
                user_emp = UserEmployer.objects.filter(user=obj).first()
                if user_emp and hasattr(user_emp, 'employer') and user_emp.employer:
                    images = Image.objects.filter(employer=user_emp.employer)
                    return [img.images.url for img in images if img.images]
            except Exception as e:
                print(f"Lỗi lấy ảnh công ty: {e}")
                return []
        return []

    def to_representation(self, instance):
        data = super().to_representation(instance)
        # data['avatar'] = instance.avatar.url
        if instance.avatar:
            data['avatar'] = instance.avatar.url
        else:
            data['avatar'] = None
        if hasattr(instance, 'cv') and instance.cv:
            if hasattr(instance.cv, 'url'):
                data['cv'] = instance.cv.url
            else:
                data['cv'] = str(instance.cv)
        else:
            data['cv'] = None
        if instance.role == RoleUser.EMPLOYER:
            user_emp = UserEmployer.objects.filter(user=instance).first()
            if user_emp and user_emp.employer:
                data['company_name'] = user_emp.employer.company_name
                data['tax_code'] = user_emp.employer.tax_code
                data['address'] = user_emp.employer.address
        data['is_active'] = instance.is_active
        return data

    def create(self, validated_data):
        password = validated_data.pop('password')
        user = User(**validated_data)
        user.set_password(password)
        user.save()
        return user

class CandidateRegistrationSerializer(UserSerializer):
    class Meta(UserSerializer.Meta):
        fields = [f for f in UserSerializer.Meta.fields if f!='role']

    def create(self, validated_data):
        validated_data['role'] =RoleUser.CANDIDATE
        user=super().create(validated_data)
        user.is_active=True
        user.save()
        return user

class ImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = Image
        fields = ['id','image']
    def to_representation(self, instance):
        data=super().to_representation(instance)
        if instance.image:
            data['image'] = instance.image.url
        return data


class EmployerRegistrationSerializer(UserSerializer):
    tax_code=serializers.CharField(write_only=True)
    company_name=serializers.CharField(write_only=True)
    address=serializers.CharField(write_only=True)
    logo = serializers.ImageField(write_only=True)
    description=serializers.CharField(write_only=True,required=False,allow_blank=True)

    class Meta(UserSerializer.Meta):
        fields =[f for f in UserSerializer.Meta.fields if f!='role']
        fields+=['tax_code','company_name','address','logo','description']
        ref_name = 'EmployerRegistration'


    def validate_images(self, value):

        min_images = getattr(settings, 'EMPLOYER_MIN_IMAGES', 3)
        if len(value)<min_images:
            raise serializers.ValidationError(f"Phải cung cấp tối thiểu {min_images} "
                                              f"hình ảnh môi trường làm việc")
        return value

    def create(self, validated_data):
        request = self.context.get('request')
        image_list = request.FILES.getlist('images')

        employer_fields=['tax_code','company_name','address','logo','description']
        employer_data={f:validated_data.pop(f) for f in employer_fields if f in validated_data}

        validated_data['role'] =RoleUser.EMPLOYER
        validated_data['is_active']=False
        user = super().create(validated_data)

        employer=Employer.objects.create(**employer_data)
        UserEmployer.objects.create(user=user,employer=employer)

        if image_list:
            for image in image_list:
                Image.objects.create(employer=employer,images=image)
        return user

class JobSerializer(serializers.ModelSerializer):
    employer_name = serializers.CharField(source='employer.company_name', read_only=True)
    employer_logo=serializers.SerializerMethodField()
    working_times=serializers.SerializerMethodField()
    categories=serializers.SerializerMethodField()
    company_images = serializers.SerializerMethodField()

    class Meta:
        model = Job
        fields = ['id','name','active','description','skills','min_salary','max_salary','location',
                  'map_url', 'payment_type','deadline', 'employer', 'created_date',
                  'employer_name','working_times','categories','employer_logo','company_images']
        read_only_fields = ['employer','created_date']

    def get_working_times(self, obj):
        slots=obj.job_time_slots.all()
        return [slot.working_time.name for slot in slots]

    def get_categories(self, obj):
        links = obj.job_categories_links.all()
        return [link.category.name for link in links]

    def get_employer_logo(self, obj):
        if obj.employer and obj.employer.logo:
            return obj.employer.logo.url
        return None

    def get_company_images(self, obj):
        if obj.employer:
            images = Image.objects.filter(employer=obj.employer)
            return [img.images.url for img in images if img.images]
        return []


class ApplicationSerializer(serializers.ModelSerializer):
    user_name=serializers.CharField(source='user.username', read_only=True)
    job_name=serializers.CharField(source='job.name', read_only=True)
    status_display=serializers.CharField(source='get_status_display', read_only=True)
    cv = serializers.SerializerMethodField()
    class Meta:
        model = Application
        fields = ['id', 'cv', 'status','status_display', 'job', 'user', 'user_name', 'job_name', 'created_date']
        read_only_fields = ['user','status', 'created_date']

    #notesimpo
    def get_cv(self, obj):
        if hasattr(obj.cv, 'url'):
            url = obj.cv.url
        else:
            url = str(obj.cv)
        if url.startswith('//'):
            url = f"https:{url}"
        if 'raw/upload' in url:
            if not url.lower().endswith('.pdf'):
                url = f"{url}.pdf"
            return url
        return None

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name']

class WorkingTimeSerializer(serializers.ModelSerializer):
    class Meta:
        model = WorkingTime
        fields = ['id', 'name', 'start_time', 'end_time']