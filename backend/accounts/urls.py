from django.urls import path, include
from .views import RegistrationView, LoginView, ReviewView, MyProfileView
from rest_framework.routers import DefaultRouter


router = DefaultRouter()

router.register(r'reviews', ReviewView, basename='review')

urlpatterns = [
    path('register/', RegistrationView.as_view(), name='register'),
    path('login/', LoginView.as_view(), name='login'),
    path('', include(router.urls)),
    path('profile/<int:pk>/', MyProfileView.as_view(), name='my-profile')
]