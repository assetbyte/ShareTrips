from django.urls import path, include
from .views import RegistrationView, LoginView, ReviewView
from rest_framework.routers import DefaultRouter


router = DefaultRouter()

router.register(r'review', ReviewView, basename='review')

urlpatterns = [
    path('register/', RegistrationView.as_view(), name='register'),
    path('login/', LoginView.as_view(), name='login'),
    path('', include(router.urls))
]