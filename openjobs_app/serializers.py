from cloudinary.models import CloudinaryField
from django.conf import settings
from drf_yasg import openapi
from rest_framework import serializers
from openjobs_app.models import User, RoleUser, Employer, UserEmployer, Image, Job, Application, Category


class UserSerializer(serializers.ModelSerializer):
    # avatar = serializers.ImageField(required=False,allow_null=True)

    class Meta:
        model = User
        fields = ['first_name', 'last_name', 'username', 'password' ,'gender', 'avatar' , 'email', 'phone_number' ,'date_of_birth','role']
        extra_kwargs = {
            'password': {
                'write_only': True,
                'style': {'input_type': 'password'}
            }
        }

    def to_representation(self, instance):
        data = super().to_representation(instance)
        data['avatar'] = instance.avatar.url
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
    working_times=serializers.SerializerMethodField()
    categories=serializers.SerializerMethodField()
    class Meta:
        model = Job
        fields = ['name','description','skills','min_salary','max_salary','location',
                  'map_url', 'payment_type','duration', 'employer', 'created_date',
                  'employer_name','working_times','categories']
        read_only_fields = ['employer','created_date']

    def get_working_times(self, obj):
        slots=obj.job_time_slots.all()
        return [slot.working_time.name for slot in slots]

    def get_categories(self, obj):
        links = obj.job_categories_links.all()
        return [link.category.name for link in links]


class ApplicationSerializer(serializers.ModelSerializer):
    user_name=serializers.CharField(source='user.username', read_only=True)
    job_name=serializers.CharField(source='job.name', read_only=True)
    status_display=serializers.CharField(source='get_status_display', read_only=True)

    cv = serializers.FileField(required=False)
    class Meta:
        model = Application
        fields = ['id', 'cv', 'status','status_display', 'job', 'user', 'user_name', 'job_name', 'created_date']
        read_only_fields = ['user','status', 'created_date']

    def get_cv(self, obj):
        if obj.cv:
            if obj.cv:
                return f"https://res.cloudinary.com/dyupzyqwj/raw/upload/{obj.cv.public_id}"
            return None
        return None

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name']