from django.db import models
from django.contrib.auth.models import User

class Trip(models.Model):
    creator = models.ForeignKey(User, on_delete=models.CASCADE, related_name='trips_created') # один пользователь может создать несколько поездок
    departure_from = models.CharField(max_length=100)
    departure_to = models.CharField(max_length=100)
    departure_date = models.DateField()
    return_date = models.DateField(blank=True, null=True)
    application_deadline = models.DateField()
    total_cost = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(max_length=20, default='open') # open, closed, completed
    
    total_seats = models.PositiveIntegerField(default=4)
    
class TripApplication(models.Model):
    trip = models.ForeignKey(Trip, on_delete=models.CASCADE, related_name='applications') # одна поездка может иметь несколько заявок
    applier = models.ForeignKey(User, on_delete=models.CASCADE, related_name='trip_applications') # один пользователь может подать несколько заявок
    status = models.CharField(max_length=20, default='pending') # pending, accepted, rejected
    applied_at = models.DateTimeField(auto_now_add=True)