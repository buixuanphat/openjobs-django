
from django.urls import path, include
from rest_framework.routers import DefaultRouter

from openjobs_app import views

r = DefaultRouter()

r.register('profile', views.UserProfileViewSet, basename='profile')

urlpatterns = [
    path('register/candidate/', views.CandidateRegistrationView.as_view(), name='register-candidate'),
    path('register/employer/', views.EmployerRegistrationView.as_view(), name='register-employer'),
    path('', include(r.urls)),
]
