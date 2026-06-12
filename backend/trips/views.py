from django.shortcuts import render
from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticatedOrReadOnly, IsAuthenticated
from rest_framework.decorators import action
from django.db.models import Q  #сложные фильтры 
import time

from .models import Trip, TripApplication
from .serializers import (
    TripApplicationCreateSeriazlier, 
    TripApplicationSerializer, 
    TripCreateSerializer, 
    TripSerializer
)

class TripViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        queryset = Trip.objects.all().order_by('-departure_date')
        
        departure_from = self.request.query_params.get("from")
        departure_to = self.request.query_params.get("to")
        
        if departure_from:
            queryset = queryset.filter(departure_from__icontains=departure_from)
        if departure_to:
            queryset = queryset.filter(departure_to__icontains=departure_to)
           
        return queryset 

    def get_serializer_class(self):
        if self.action == 'create':
            return TripCreateSerializer  
        return TripSerializer            

    def perform_create(self, serializer):
        serializer.save(creator=self.request.user)


class TripApplicationViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]

    def get_serializer_class(self):
        if self.action == 'create':
            return TripApplicationCreateSeriazlier  
        return TripApplicationSerializer           

    def perform_create(self, serializer):
        serializer.save(applier=self.request.user)
        
    def get_queryset(self):
        user = self.request.user
        return TripApplication.objects.filter(
            Q(applier=user) | Q(trip__creator=user)).distinct().order_by('-applied_at')
    # заявки, где я пассажир (чекнуть свои заявки)
    # ИЛИ
    # заявки, присланные на мои поездки (одобрить или отклонить)
    @action(detail=True, methods=['post'], url_path='accept')
    def accept_application(self, request, pk=None):
        application = self.get_object()
        
        if application.trip.creator != request.user:
            return Response(
                {"detail": "You are not the creator of this trip!"}, 
                status=status.HTTP_403_FORBIDDEN
            )
        #сколько пассажиров уже одобрено
        accepted_cnt = TripApplication.objects.filter(trip=application.trip, 
                                                      status="accepted").count()
        
        if accepted_cnt > application.trip.total_seats:
            return Response(
                {"detail": "No available seats left in this car!"}, 
                status=status.HTTP_400_BAD_REQUEST
            )
            
        application.status = 'accepted'
        application.save()
        
        #если место последнее то меняем статус
        if accepted_cnt + 1 == application.trip.total_seats:
            application.trip.status = 'closed'
            application.trip.save()
        return Response({"status": "application accepted"}, status=status.HTTP_200_OK)
    
    @action(detail=True, methods=['post'], url_path='reject')
    def reject_application(self, request, pk=None):
        application = self.get_object() 
        
        if application.trip.creator != request.user:
            return Response(
                {"detail": "You are not the creator of this trip!"}, 
                status=status.HTTP_403_FORBIDDEN
            )
            
        application.status = 'rejected'
        application.save()
        return Response({"status": "application rejected"}, status=status.HTTP_200_OK)
    
    @action(detail=False, methods=['get'], url_path='driver_orders')
    def driver_applications(self, request):
        orders = TripApplication.objects.filter(trip__creator=request.user).exclude(applier=request.user).order_by('-applied_at')  
        serializer = TripApplicationSerializer(orders, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    
    @action(detail=False, methods=['get'], url_path='my_team')
    def my_team(self, request):
        user = request.user
        
        driver_trips = Trip.objects.filter(creator=user)
        
        passenger_trips = Trip.objects.filter(applications__applier=user, applications__status="accepted")
    
        accessible_trips = (driver_trips | passenger_trips).distinct()
    
        team = TripApplication.objects.filter(
            trip__in=accessible_trips,
            status="accepted"
        ).order_by("-applied_at")
        
        serializer = TripApplicationSerializer(team, many=True, context={'request': request})
        return Response(serializer.data, status=status.HTTP_200_OK)