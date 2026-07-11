from django.db import models
from datetime import date
from django.contrib.auth.models import User

class Trip(models.Model):
    creator = models.ForeignKey(User, on_delete=models.CASCADE, related_name='trips_created') # один пользователь может создать несколько поездок
    departure_from = models.CharField(max_length=100)
    departure_to = models.CharField(max_length=100)
    departure_date = models.DateField()
    return_date = models.DateField(null=True, blank=True)
    application_deadline = models.DateField()
    total_cost = models.DecimalField(max_digits=10, decimal_places=2)
    total_seats = models.PositiveIntegerField(default=4)
    
    @property
    def status(self):
        today = date.today() # curr date
        
        if today < self.departure_date:
            return "Trip is about to start"
        end = self.return_date if self.return_date else self.departure_date
        if self.departure_date <= today <= end:
            return "Trip is going on"
        
        else:
            return "Trip has ended"
    
class TripApplication(models.Model):
    
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('accepted', 'Accepted'),
        ('rejected', 'Rejected'),
        ('kicked', 'Kicked'), 
    ]
    
    trip = models.ForeignKey(Trip, on_delete=models.CASCADE, related_name='applications') # одна поездка может иметь несколько заявок
    applier = models.ForeignKey(User, on_delete=models.CASCADE, related_name='trip_applications') # один пользователь может подать несколько заявок
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending') # pending, accepted, rejected
    applied_at = models.DateTimeField(auto_now_add=True)
    application_message = models.TextField()
    
    #поля оплаты 
    is_paid = models.BooleanField(default=False)
    stripe_session_id = models.CharField(max_length=255, blank=True, null=True, unique=True)
    
    
    payment_deadline = models.DateTimeField(null=True, blank=True)
    
    def __str__(self):
        return f"Application by {self.applier.username} for trip from {self.trip.departure_from} to {self.trip.departure_to} is {self.is_paid and 'paid' or 'not paid'}" 