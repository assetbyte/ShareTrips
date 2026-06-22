from rest_framework import serializers
from rest_framework.exceptions import ValidationError
from .models import Trip, TripApplication
from django.utils import timezone
from datetime import timedelta
from accounts.serializers import UserSerializer

#get посмотреть поездки
class TripSerializer(serializers.ModelSerializer):
    remaining_seats = serializers.SerializerMethodField()
    creator = UserSerializer(read_only=True)   
    total_seats = serializers.IntegerField(required=False)
    
    accepted_cnt = serializers.SerializerMethodField()
    cost_per_person = serializers.SerializerMethodField()
    
    class Meta:
        model = Trip
        fields = [
            'id', 'creator', 'departure_from', 'departure_to', 
            'departure_date', 'return_date', 'total_cost', 
            'total_seats', 'remaining_seats', 'application_deadline',
            'status',
            'accepted_cnt', 'cost_per_person'  
        ]

    def get_accepted_cnt(self, obj):
        return obj.applications.filter(status='accepted').count()

    def get_remaining_seats(self, obj):
        accepted_passengers = self.get_accepted_cnt(obj)
        return obj.total_seats - accepted_passengers

    def get_cost_per_person(self, obj):
        accepted_passengers = self.get_accepted_cnt(obj)
        
        
        total_people = 1 + accepted_passengers
    
        return round(obj.total_cost / total_people, 0) 
#post создать поездку      
class TripCreateSerializer(serializers.ModelSerializer):
    return_date = serializers.DateField(required=False, allow_null=True)
    class Meta:
        model = Trip
        fields = [
                'id', 'departure_from', 'departure_to', 
                'departure_date', 'return_date', 'application_deadline', 'total_cost', 'total_seats'
            ]
        
    def validate(self , attrs):
        #дата отправки < дата возвращения 
        #заявки принимаются МАКСИМУМ за два дня до отправления. 
        departure_date = attrs.get('departure_date')
        return_date = attrs.get('return_date')
        application_deadline = attrs.get('application_deadline')
        
        #поездка может быть в один конец
        if return_date and departure_date > return_date:
            raise ValidationError({
                "return_date": "Departure date cannot be later than the return date."
            })
        
        if departure_date - timedelta(days=2)  < application_deadline:
            raise ValidationError({
                "application_deadline": "Application deadline must be at least 2 days before the departure date."
            })
            
        return attrs
        
            
#get посмотреть кто подал заявки    
class TripApplicationSerializer(serializers.ModelSerializer):
    applier = UserSerializer(read_only = True)
    trip = TripSerializer(read_only = True)
    class Meta:
        model = TripApplication
        fields = ['id', 'trip', 'applier', 'status', 'applied_at', 'application_message']
        
#post подать заявки на поездку
class TripApplicationCreateSeriazlier(serializers.ModelSerializer):
    class Meta:
        model = TripApplication
        fields = ['id', 'trip', 'application_message']
        
    def validate(self, attrs):
        request = self.context.get("request")
        user = request.user if request else None
        
        current_trip = attrs.get('trip')
        
        
        if not user:
            return attrs
        
        if TripApplication.objects.filter(applier=user, trip=current_trip, status__in=['pending', 'accepted']).exists():
            raise ValidationError("You have already applied for this trip!")
        
        if TripApplication.objects.filter(applier=user, trip=current_trip, status='kicked').exists():
            raise ValidationError("The driver has removed you from this trip. You cannot apply again.")
                
                    
        #validation from mass requests
        
        last_application = TripApplication.objects.filter(applier=user).exclude(
            status='rejected').select_related('trip').order_by('-trip__departure_date').first()
        #user will be able to apply to trip if status before was: rejected
        
        if last_application:
            last_trip = last_application.trip
            trip_end_date = last_trip.return_date if last_trip.return_date else last_trip.departure_date
    
    
            application_blocked_until = trip_end_date + timedelta(days=3)
    
            if current_trip.departure_date < application_blocked_until:
                raise ValidationError(
                    f"You have a scheduled trip from {last_trip.departure_from} to {last_trip.departure_to} "
                    f"that ends around {trip_end_date.strftime('%d.%m.%Y')}. You can book next trips after this date."
                )
            
        return attrs