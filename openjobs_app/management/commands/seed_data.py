import random

from django.core.management import BaseCommand

from openjobs_app.models import Employer, User, RoleUser, UserEmployer, JobPaymentType, Job


class Command(BaseCommand):
    help = 'Tạo dữ liệu cho cho nhiều nhà tuyển dụng khác nhau!'
    def handle(self, *args, **options):
       employers_list=User.objects.filter(role=RoleUser.EMPLOYER,is_active=True)

       if employers_list:
           self.stdout.write(self.style.SUCCESS(f"Tìm thấy {employers_list.count()} nhà tuyển dụng."
                                                f" Bắt đầu tạo dữ liệu..."))
           for user in employers_list:
               emp_link=UserEmployer.objects.filter(user=user).first()
               if not emp_link:
                   new_emp=Employer.objects.create(
                       company_name=f"Công ty {user.username.upper()}",
                       tax_code=f"MST-{random.randint(100000, 999999)}",
                       address=f"{random.randint(1, 100)} Đường số {random.randint(1, 50)}, TP.HCM",
                       description=f"Công ty chuyên về công nghệ thuộc sở hữu của {user.username}"
                   )
                   emp_link=UserEmployer.objects.create(user=user, employer=new_emp)
               current_emp=emp_link.employer

               job_titles=["Dev", "Designer", "Tester", "Manager", "HR"]
               for i in range(5):
                   Job.objects.create(
                       name=f"{random.choice(job_titles)} tại {current_emp.company_name} (#{i + 1})",
                       description=f"Mô tả công việc hấp dẫn cho {user.username}",
                       skills="Yêu cầu kỹ năng chuyên môn phù hợp",
                       min_salary=random.randint(800, 1200),
                       max_salary=random.randint(1300, 3000),
                       location=current_emp.address,
                       map_url="https://goo.gl/maps/example",
                       payment_type=JobPaymentType.MONTHLY,
                       duration=12,
                       employer=current_emp
                   )
               self.stdout.write(f"--- Đã nạp xong 5 Job cho: {user.username} ---")
           self.stdout.write(self.style.SUCCESS('Hoàn thành nạp dữ liệu!'))





