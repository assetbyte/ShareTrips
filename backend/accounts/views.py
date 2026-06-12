from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, viewsets
from rest_framework.permissions import AllowAny
from .serializers import RegistrationSerializer
from django.contrib.auth import authenticate
from rest_framework.authtoken.models import Token
from .models import Review
from rest_framework.permissions import IsAuthenticatedOrReadOnly, IsAuthenticated
from .serializers import ReviewSerializer, ReviewCreateSerializer
from rest_framework.decorators import authentication_classes
from rest_framework.authentication import TokenAuthentication
from .models import Profile
from .serializers import ProfileSerializer
from trips.models import Trip, TripApplication
from trips.serializers import TripSerializer


class RegistrationView(APIView):
    permission_classes = [AllowAny]
    # доступ к регистрации доступен всем
    def post(self, request):
        serializer = RegistrationSerializer(data=request.data)
        # передаю данные из ангуляра в сериалзитор 
        if serializer.is_valid():
            serializer.save()  # вызов create
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    

class LoginView(APIView):
    permission_classes = [AllowAny]
    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password')
        
        user = authenticate(username=username, password=password)
        # проверяем что все совпадает
        
        if user is not None: 
            token, created = Token.objects.get_or_create(user=user)
            # если юзер существует то создаем или берем уже существующий токен 
            
            return Response({
                'token': token.key,
                'user_id': user.pk,
                'username': user.username
            }, status=status.HTTP_200_OK)
        
        return Response({
            'error': 'Invalid Credentials'
        }, status=status.HTTP_400_BAD_REQUEST)
        

# review view
class ReviewView(viewsets.ModelViewSet):
    queryset = Review.objects.all().order_by('-created_at')
    permission_classes = [IsAuthenticatedOrReadOnly]  # смотреть отзывы могут все
    authentication_classes = [TokenAuthentication]
    
    def get_serializer_class(self):
        if self.action == 'create':
            return ReviewCreateSerializer
        return ReviewSerializer
    
    def perform_create(self, serializer):
        serializer.save(user_sender=self.request.user)
        

class MyProfileView(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        profile, created = Profile.objects.get_or_create(user=request.user)
        profile_serializer = ProfileSerializer(profile)
        
        created_trips = Trip.objects.filter(creator=request.user).order_by('-departure_date')
        created_trips_serializer = TripSerializer(created_trips, many=True)
        
        joined_applications = TripApplication.objects.filter(
            applier=request.user, 
            status='accepted'
        ).select_related('trip')
        
        joined_trips = [app.trip for app in joined_applications]
        joined_trips_serializer = TripSerializer(joined_trips, many=True)
    
        return Response({
            "profile": profile_serializer.data,
            "my_created_trips": created_trips_serializer.data,
            "my_joined_trips": joined_trips_serializer.data
        })
        
    def patch(self, request):
        
        profile = Profile.objects.get(user=request.user)
        
        serializer = ProfileSerializer(profile, data=request.data, partial=True)
        
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
            
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)