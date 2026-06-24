from django.db import models
from django.contrib.auth.models import User
from trips.models import Trip
class Profile(models.Model):
    name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    phone = models.CharField(max_length=20)
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    avatar = models.ImageField(upload_to='avatars/', null=True, blank=True)
    bio = models.TextField(blank=True)
    
class Review(models.Model):
    trip = models.ForeignKey(Trip, on_delete=models.CASCADE, related_name='reviews') #отзывы оставленные конкретной поездке
    user_sender = models.ForeignKey(User, on_delete=models.CASCADE, related_name='reviews_written') # один автор может оставить несколько отзывов 
    user_receiver = models.ForeignKey(User, on_delete=models.CASCADE, related_name='reviews_received') # один пользователь может получить несколько отзывов
    rating = models.IntegerField()
    comment = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)