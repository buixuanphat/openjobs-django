from django.contrib import admin
from oauth2_provider.models import Application

from openjobs_app.models import User, Employer, Image, Job, JobCategory, WorkingTime, JobWorkingTime, Category


class UserAdmin(admin.ModelAdmin):
    list_display = ['id' ,'first_name', 'last_name', 'username' ,'gender', 'avatar' ,'email'
        , 'phone_number' ,'date_of_birth' ,'role', 'is_active', 'created_date']
    search_fields = ['email']

class MyAdminSite(admin.AdminSite):
    site_header = "OpenJobs Admin"

admin_site = MyAdminSite(name='openjobs')

admin_site.register(User ,UserAdmin)
admin_site.register(Employer)
admin_site.register(Image)
admin_site.register(Job)
admin_site.register(JobCategory)
admin_site.register(JobWorkingTime)
admin_site.register(WorkingTime)
admin_site.register(Category)


admin_site.register(Application)
