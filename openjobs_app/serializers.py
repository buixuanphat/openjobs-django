from rest_framework import serializers

from openjobs_app.models import User


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['first_name', 'last_name', 'username', 'password' ,'gender', 'avatar' , 'email', 'phone_number' ,'date_of_birth' ]
        extra_kwargs = {
            'password': {
                'write_only': True,
            }
        }


    def to_representation(self, instance):
        data = super().to_representation(instance)
        data['avatar'] = instance.avatar.url
        return data

    def create(self, validated_data):
        user = User(**validated_data)
        user.set_password(user.password)
        user.save()
        return user