from django.contrib import admin
from django.db.models import Count
from django.db.models.functions import TruncMonth
from django.template.response import TemplateResponse
from django.utils.safestring import mark_safe
from oauth2_provider.models import Application
from django.urls import path

from openjobs_app.models import User, Employer, Image, Job, JobCategory, WorkingTime, Category


class UserAdmin(admin.ModelAdmin):
    list_display = ['id' ,'first_name', 'last_name', 'username' ,'gender', 'avatar' ,'email'
        , 'phone_number' ,'date_of_birth' ,'role', 'is_active', 'created_date']
    search_fields = ['email']

class EmployerAdmin(admin.ModelAdmin):
    readonly_fields = ['license_view']

    def license_view(self, instance):
        if instance.license:
            return mark_safe(f'''
                <iframe 
                    src="{instance.license.url}" 
                    width="700px"
                    height="500px" 
                    style="border: 1px solid #ccc;"
                ></iframe>
            ''')
        return "Chưa upload giấy phép"



class MyAdminSite(admin.AdminSite):
    site_header = "OpenJobs Admin"

    def get_urls(self):
        return [path("stats/", self.stats_view)] + super().get_urls()

    def stats_view(self, request):
        job_stats = (Job.objects.annotate(month=TruncMonth('created_date')).values('month').annotate(count=Count('id')))

        candidate_stats = (User.objects.filter(role='candidate').annotate(month=TruncMonth('created_date')).values('month').annotate(count=Count('id')))

        employer_stats = (Employer.objects.annotate(month=TruncMonth('created_date')).values('month').annotate(count=Count('id')))

        return TemplateResponse(request,'admin/stats.html',{'job_stats': job_stats, 'candidate_stats': candidate_stats, 'employer_stats': employer_stats})

admin_site = MyAdminSite(name='openjobs')

admin_site.register(User ,UserAdmin)
admin_site.register(Employer, EmployerAdmin)
admin_site.register(Image)
admin_site.register(Job)
admin_site.register(JobCategory)
admin_site.register(WorkingTime)
admin_site.register(Category)
admin_site.register(Application)
