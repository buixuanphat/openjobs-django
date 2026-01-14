import datetime
from email.policy import default

from cloudinary.models import CloudinaryField
from django.contrib.auth.models import AbstractUser
from django.db import models
from django.db.models import ManyToManyField


class ApplicationStatus(models.TextChoices):
    PENDING = 'pending', 'Pending'
    REVIEWING = 'reviewing', 'Reviewing'
    ACCEPTED = 'accepted', 'Accepted'
    REJECTED = 'rejected', 'Rejected'
    WITHDRAWN = 'withdrawn', 'Withdrawn'



class EmploymentStatus(models.TextChoices):
    ACTIVE = 'active', 'Active'
    RESIGNED = 'resigned', 'Resigned'
    TERMINATED = 'terminated', 'Terminated'
    EXPIRED = 'expired', 'Expired'
    PENDING = 'pending', 'Pending'


class JobPaymentType(models.TextChoices):
    HOURLY = 'hourly', 'Hourly'
    WEEKLY = 'weekly', 'Weekly'
    MONTHLY = 'monthly', 'Monthly'


class RoleUser(models.TextChoices):
    CANDIDATE = 'candidate', 'Candidate'
    ADMIN = 'admin', 'Admin'
    EMPLOYER = 'employer', 'Employer'


class GenderUser(models.TextChoices):
    MALE = 'male', 'Male'
    FEMALE = 'female', 'Female'

class Duration(models.TextChoices):
    ONE_MONTH = '1_month', '1 tháng'
    THREE_MONTHS = '3_months', '3 tháng'
    SIX_MONTHS = '6_months', '6 tháng'
    ONE_YEAR = '1_year', '1 năm'
    TWO_YEARS = '2_years', '2 năm'


class User(AbstractUser):
    USERNAME_FIELD = 'username'
    REQUIRED_FIELDS = ['first_name', 'last_name', 'email','phone_number']

    email = models.EmailField(unique=True)
    gender = models.CharField(max_length=10, choices=GenderUser.choices)
    phone_number = models.CharField(max_length=20)
    date_of_birth = models.DateField(default=datetime.date.today)
    avatar = CloudinaryField(null=True, blank=True)
    role = models.CharField(max_length=20, choices=RoleUser.choices)
    cv=CloudinaryField(null=True, blank=True,resource_type='raw')

    created_date = models.DateTimeField(auto_now_add=True)
    updated_date = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.username


class BaseModel(models.Model):
    active = models.BooleanField(default=True)
    created_date = models.DateTimeField(auto_now_add=True)
    updated_date = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True


class Employer(BaseModel):
    tax_code = models.CharField(max_length=50)
    company_name = models.CharField(max_length=100)
    logo = CloudinaryField(null=True, blank=True)
    description = models.TextField()
    address = models.TextField()

    def __str__(self):
        return self.company_name


class UserEmployer(BaseModel):
    employer = models.ForeignKey(Employer, on_delete=models.CASCADE, related_name='managing_users')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='managed_employers')


class WorkingTime(BaseModel):
    name = models.CharField(max_length=255)
    start_time = models.TimeField()
    end_time = models.TimeField()
    employer = models.ForeignKey(Employer, on_delete=models.CASCADE, related_name='working_times_templates')

    def __str__(self):
        return self.name



class Job(BaseModel):
    name = models.CharField(max_length=255)
    description = models.TextField()
    skills = models.TextField()
    min_salary = models.DecimalField(decimal_places=2, max_digits=10)
    max_salary = models.DecimalField(decimal_places=2, max_digits=10)
    location = models.CharField(max_length=255)
    map_url = models.URLField()
    payment_type = models.CharField(max_length=120, choices=JobPaymentType.choices)
    deadline = models.DateField(null=True, blank=True)
    created_date = models.DateTimeField(auto_now_add=True)
    updated_date = models.DateTimeField(auto_now=True)
    employer = models.ForeignKey(Employer, on_delete=models.CASCADE, related_name='job_post')
    duration = models.CharField(max_length=30 ,choices=Duration.choices, default=Duration.THREE_MONTHS)
    shifts = ManyToManyField(WorkingTime, related_name='shifts')

    def __str__(self):
        return self.name


class Application(BaseModel):
    cv = CloudinaryField(null=True, blank=True,resource_type='raw')#để định dạng file
    status = models.CharField(max_length=120, choices=ApplicationStatus.choices,
                              default=ApplicationStatus.PENDING)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='applications_submitted')
    job = models.ForeignKey(Job, on_delete=models.CASCADE, related_name='applications_received')

    def __str__(self):
        user_email = self.user.email if self.user else None
        job_title = self.job.name if self.job else None
        return f'Application by {user_email} for - {job_title}'


class Appreciation(BaseModel):
    rating = models.IntegerField()
    content = models.TextField()
    job = models.ForeignKey(Job, on_delete=models.CASCADE, related_name='job_appreciations')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='user_appreciations')

    class Meta:
        unique_together = ('user', 'job')

    def __str__(self):
        return self.content


class Employment(BaseModel):
    start_date = models.DateField(null=False, blank=False)
    end_date = models.DateField(null=True, blank=True)
    status = models.CharField(max_length=120, choices=EmploymentStatus.choices)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='employments_history')
    job = models.ForeignKey(Job, on_delete=models.PROTECT, related_name='job_employments_records')

    class Meta:
        unique_together = ('user', 'job')



class Category(BaseModel):
    name = models.CharField(max_length=255)

    def __str__(self):
        return self.name


class JobCategory(BaseModel):
    job = models.ForeignKey(Job, on_delete=models.CASCADE, related_name='job_categories_links')
    category = models.ForeignKey(Category, on_delete=models.CASCADE, related_name='links_job_from_categories')

    class Meta:
        unique_together = ('job', 'category')


class Image(BaseModel):
    images = CloudinaryField(null=True, blank=True)
    employer = models.ForeignKey(Employer, on_delete=models.CASCADE, related_name='gallery_images')


class Follow(BaseModel):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='followed_employers')
    employer = models.ForeignKey(Employer, on_delete=models.CASCADE, related_name='followers')

    class Meta:
        unique_together = ('user', 'employer')
