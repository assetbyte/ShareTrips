from django.shortcuts import render
from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticatedOrReadOnly
from .models import Trip, TripApplication
from .serializers import (TripApplicationCreateSeriazlier, TripApplicationSerializer, TripCreateSerializer, TripSerializer)


class TripViewSet(viewsets.ModelViewSet):
    queryset = Trip.objects.all().order_by('-departure_date')
    permission_classes = [IsAuthenticatedOrReadOnly]
    
    def get_serializer_class(self):
        if self.action == 'create':
            return TripCreateSerializer
        return TripSerializer
    
    def perform_create(self, serializer):
        serializer.save(creator=self.request.user)
        
class TripApplicationViewSet(viewsets.ModelViewSet):
    queryset = TripApplication.objects.all()
    permission_classes = [IsAuthenticatedOrReadOnly]

    def get_serializer_class(self):
        if self.action == 'create':
            return TripApplicationCreateSeriazlier  
        return TripApplicationSerializer           

    def perform_create(self, serializer):
        serializer.save(applier=self.request.user)