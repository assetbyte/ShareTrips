import re
from rest_framework.exceptions import ValidationError
from rest_framework import serializers
from .models import Profile, Review
from django.contrib.auth.models import User
from django.db.models import Avg


#гланый сериализатор чтоб вытаскивать инфу о пользователе и его профиле и отзывах 
class UserSerializer(serializers.ModelSerializer):
    average_rating = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ['id', 'username', 'first_name', 'last_name', 'average_rating']

    def get_average_rating(self, object):
        rating_data = object.reviews_received.aggregate(Avg('rating'))
        avg = rating_data['rating__avg']
        return round(avg, 1) if avg is not None else 0.0
#get
class ProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    average_rating = serializers.SerializerMethodField()
    
    
    class Meta:
        model = Profile
        fields = ['id', 'name', 'last_name', 'phone', 'avatar', 'bio', 'user', 'average_rating']
        
    def get_average_rating(self, object):
        current_user = object.user
        rating_data = current_user.reviews_received.aggregate(Avg('rating'))
        avg = rating_data['rating__avg']
        return round(avg, 1) if avg is not None else 0.0
#get 
class ReviewSerializer(serializers.ModelSerializer):
    user_sender = UserSerializer(read_only=True)
    user_receiver = UserSerializer(read_only=True)
    #нужен для того чтобы при создании отзыва указать кто его отправляет и кому он предназначен, вместо айди юзера будет возвращаться вся информация о юзере
    class Meta:
        model = Review
        fields = ['id', 'user_sender', 'user_receiver', 'rating', 'comment', 'created_at']
        

#post        
class RegistrationSerializer(serializers.ModelSerializer):
    username = serializers.CharField(write_only=True, required=True)
    email = serializers.EmailField(
        write_only=True, 
        required=True,
        error_messages={"invalid": "Enter a valid email address."}
    )
    password = serializers.CharField(
        write_only=True, 
        required=True, 
        style={'input_type': 'password'}
    )
    
    name = serializers.CharField(required=True, allow_blank=False, error_messages={
        "required": "First name is required.",
        "blank": "First name cannot be empty."
    })
    last_name = serializers.CharField(required=True, allow_blank=False, error_messages={
        "required": "Last name is required.",
        "blank": "Last name cannot be empty."
    })
    
    phone = serializers.CharField(required=True, allow_blank=False)
    
    class Meta:
        model = Profile
        fields = ['id', 'name', 'last_name', 'phone', 'avatar', 'bio', 'username', 'email', 'password']
        
    def validate_phone(self, value):
        phone_regex = r'^\+77\d{9}$'
        
        if not re.match(phone_regex, value):
            raise ValidationError("Phone number must be in format: +7 7XX-XXX-XX-XX")
        return value

    def validate_password(self, value):
        if len(value) <= 8:
            raise ValidationError("Password must be more than 8 characters long.")
            
        if not re.search(r'[a-zA-Zа-яА-Я]', value):
            raise ValidationError("Password must contain at least one letter.")
            

        if not re.search(r'\d', value):
            raise ValidationError("Password must contain at least one digit.")
            
        return value
    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise ValidationError("A user with this email already exists.")
        return value

    def validate_username(self, value):
        if User.objects.filter(username=value).exists():
            raise ValidationError("This username is already taken.")
        return value
    def create(self, validated_data):
        username = validated_data.pop('username')
        email = validated_data.pop('email')
        password = validated_data.pop('password')
        user = User.objects.create_user(username=username, password=password, email=email)
        profile = Profile.objects.create(user=user, **validated_data)
        return profile
    username = serializers.CharField(write_only=True, required=True)
    email = serializers.EmailField(write_only=True, required=True)
    password = serializers.CharField(write_only=True, required=True)
    
    class Meta:
        model = Profile
        fields = ['id', 'name', 'last_name', 'phone', 'avatar', 'bio', 'username', 'email', 'password']
        
    def create(self, validated_data):
        username = validated_data.pop('username')
        email = validated_data.pop('email')
        password = validated_data.pop('password')
        #запрос от фронта на создание юзера и профиля, сначала создаем юзера, потом профиль
        user = User.objects.create_user(username=username, password=password, email=email)
        profile = Profile.objects.create(user=user, **validated_data)
        return profile
#post
class ReviewCreateSerializer(serializers.ModelSerializer):
    class Meta:
        
        model = Review
        fields = ['id', 'trip', 'user_receiver', 'rating', 'comment'] #created_at
        #user sender через user_sender = self.request.user получу
        
    def validate(self, attrs):
        user_sender = self.context['request'].user
        user_receiver = attrs.get('user_receiver')
        trip = attrs.get('trip')
        
        
        if trip.status != "Trip has ended":
            raise ValidationError("You can leave review for your teammates only when you current trip will end")
        
        accepted_passengers = list(trip.applications.filter(status="accepted").values_list('applier', flat=True))
        all_participants = accepted_passengers + [trip.creator.id]
        
        if user_sender.id not in all_participants:
            raise ValidationError("You did not participate in this trip.")
        if user_receiver.id not in all_participants:
            raise ValidationError("The recipient did not participate in this trip.")
        
        if user_sender == user_receiver:
            raise ValidationError("You cannot review yourself.")
        
        if Review.objects.filter(trip=trip, user_sender=user_sender, user_receiver=user_receiver).exists():
            raise ValidationError("You have already reviewed this teammate for this trip.")
        
        return attrs
        
        
        
        