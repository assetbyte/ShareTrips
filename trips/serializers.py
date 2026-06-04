from rest_framework import serializers
from .models import Trip, TripApplication
from accounts.serializers import UserSerializer
#get посмотреть поездки
class TripSerializer(serializers.ModelSerializer):
    creator = UserSerializer(read_only=True)    
    class Meta:
        model = Trip
        fields = [
            'id', 'creator', 'departure_from', 'departure_to', 
            'departure_date', 'application_deadline', 'total_cost', 'status'
        ]
        
#post создать поездку      
class TripCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Trip
        fields = [
                'id', 'departure_from', 'departure_to', 
                'departure_date', 'application_deadline', 'total_cost', 'status'
            ]
#get посмотреть кто подал заявки    
class TripApplicationSerializer(serializers.ModelSerializer):
    applier = UserSerializer(read_only = True)
    trip = TripSerializer(read_only = True)
    class Meta:
        model = TripApplication
        fields = ['id', 'trip', 'applier', 'status', 'applied_at']
        
#post подать заявки на поездку
class TripApplicationCreateSeriazlier(serializers.ModelSerializer):
    class Meta:
        model = TripApplication
        fields = ['id', 'trip']