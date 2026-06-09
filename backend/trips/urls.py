from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import TripApplicationViewSet, TripViewSet

router = DefaultRouter()

router.register(r'trips', TripViewSet, basename='trip')
router.register(r'applications', TripApplicationViewSet, basename='application')


urlpatterns = [
    path('', include(router.urls)),
]