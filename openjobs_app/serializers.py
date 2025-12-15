from cloudinary.models import CloudinaryField
from django.conf import settings
from pip._internal.resolution.resolvelib.base import Candidate
from rest_framework import serializers

from openjobs_app.models import User, RoleUser, Employer, UserEmployer, Image


class UserSerializer(serializers.ModelSerializer):
    avatar = serializers.ImageField(required=False,allow_null=True)
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
        data['avatar'] = instance.avatar.url if instance.avatar else None
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

class EmployerRegistrationSerializer(UserSerializer):
    tax_code=serializers.CharField(write_only=True)
    company_name=serializers.CharField(write_only=True)
    address=serializers.CharField(write_only=True)
    logo = serializers.ImageField(write_only=True)
    description=serializers.CharField(write_only=True,required=False,allow_blank=True)
    images=serializers.ListField(child=serializers.ImageField(),write_only=True,required=True)


    class Meta(UserSerializer.Meta):
        fields =[f for f in UserSerializer.Meta.fields if f!='role']
        fields+=['tax_code','company_name','address','logo','description','images']

    def validate_images(self, value):
        MIN_IMAGES=settings.EMPLOYER_MIN_IMAGES
        if len(value)<MIN_IMAGES:
            raise serializers.ValidationError(f"Phải cung cấp tối thiểu {MIN_IMAGES} "
                                              f"hình ảnh môi trường làm việc")
        return value

    def create(self, validated_data):
        employer_fields=['tax_code','company_name','address','logo','description','images']
        employer_data={f:validated_data.pop(f) for f in employer_fields if f in validated_data}

        image_list=employer_data.pop('images',[])

        validated_data['role'] =RoleUser.EMPLOYER
        validated_data['is_active']=False
        user = super().create(validated_data)

        employer=Employer.objects.create(**employer_data)
        UserEmployer.objects.create(user=user,employer=employer)

        if image_list:
            for image in image_list:
                Image.objects.create(employer=employer,image=image)
        return user


