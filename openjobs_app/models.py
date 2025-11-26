import datetime

from cloudinary.models import CloudinaryField
from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    ROLE_CHOICES = [
        ('candidate', 'candidate'),
        ('employer', 'employer'),
        ('admin', 'admin'),
    ]

    GENDER_CHOICES = [
        ('male', 'Nam'),
        ('female', 'Nữ')
    ]

    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    password = models.CharField(max_length=255)
    gender = models.CharField(max_length=10, choices=GENDER_CHOICES)
    email = models.EmailField(unique=True)
    phone_number = models.CharField(max_length=20)
    date_of_birth = models.DateField(default=datetime.date.today)
    avatar = CloudinaryField(null=True, blank=True)
    role = models.CharField(max_length=20, choices=ROLE_CHOICES)
    active = models.BooleanField(default=True)
    created_date = models.DateTimeField(auto_now_add=True)
    updated_date = models.DateTimeField(auto_now=True)


    def __str__(self):
        return self.email


class BaseModel(models.Model):
    active = models.BooleanField(default=True)
    created_date = models.DateTimeField(auto_now_add=True)
    updated_date = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True