
from django.urls import path, include
from rest_framework.routers import DefaultRouter

from openjobs_app import views

r = DefaultRouter()

r.register('profile', views.UserProfileViewSet, basename='profile')
r.register('jobs', views.JobViewSet, basename='jobs')
r.register('applications',views.ApplicationViewSet, basename='applications')
r.register('categories',views.CategoryView, basename='categories')

urlpatterns = [
    path('', include(r.urls)),
    path('oauth2-info/',views.AuthInfo.as_view()),
    path('register/candidate/', views.CandidateRegistrationView.as_view(), name='register-candidate'),
    path('register/employer/', views.EmployerRegistrationView.as_view(), name='register-employer'),



]
