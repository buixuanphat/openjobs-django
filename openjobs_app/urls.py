
from django.urls import path, include
from rest_framework.routers import DefaultRouter

from openjobs_app import views

r = DefaultRouter()

r.register('users', views.UserView, basename='user')

urlpatterns = [
    path('', include(r.urls)),
]
