from django.contrib import admin
from openjobs_app.models import *

class UserAdmin(admin.ModelAdmin):
    list_display = ['id' ,'first_name', 'last_name', 'username' ,'gender', 'avatar' ,'email', 'phone_number' ,'date_of_birth' ,'role', 'active', 'created_date']
    search_fields = ['email']

class MyAdminSite(admin.AdminSite):
    site_header = "OpenJobs Admin"

admin_site = MyAdminSite(name='openjobs')

admin_site.register(User ,UserAdmin)