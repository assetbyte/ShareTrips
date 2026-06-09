from rest_framework import serializers
from .models import Profile, Review
from django.contrib.auth.models import User
#гланый сериализатор чтоб вытаскивать инфу о пользователе и его профиле и отзывах 
class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email']
#get
class ProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    
    class Meta:
        model = Profile
        fields = ['id', 'name', 'last_name', 'phone', 'avatar', 'bio', 'user']
        
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
        fields = ['id', 'user_receiver', 'rating', 'comment'] #created_at
        #user sender через user_sender = self.request.user получу
        
        
        