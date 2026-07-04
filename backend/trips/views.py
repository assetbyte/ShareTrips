from datetime import date
import stripe
from django.conf import settings
from django.http import JsonResponse
from django.shortcuts import render
from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticatedOrReadOnly, IsAuthenticated
from rest_framework.decorators import action
from django.db.models import Q  #сложные фильтры 
import time
from django.core.exceptions import PermissionDenied, ValidationError
stripe.api_key = settings.STRIPE_SECRET_KEY
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
        today = date.today()
        
        #показываем еще те поездки которые еще не начались
        queryset = Trip.objects.filter(departure_date__gt=today).order_by('-departure_date')
        
        departure_from = self.request.query_params.get("from")
        departure_to = self.request.query_params.get("to")
        departure_date = self.request.query_params.get("date")
        min_price = self.request.query_params.get("min_price")
        max_price = self.request.query_params.get("max_price")
        
        if min_price:
            queryset = queryset.filter(total_cost__gte=min_price)
        if max_price:
            queryset = queryset.filter(total_cost__lte=max_price)
        
        if departure_from:
            queryset = queryset.filter(departure_from__icontains=departure_from)
        if departure_to:
            queryset = queryset.filter(departure_to__icontains=departure_to)
        if departure_date:
            queryset = queryset.filter(departure_date=departure_date)
            
               
        return queryset 

    def get_serializer_class(self):
        if self.action == 'create':
            return TripCreateSerializer  
        return TripSerializer            

    def perform_create(self, serializer):
        serializer.save(creator=self.request.user)
        
    def perform_destroy(self, instance):
        if instance.creator != self.request.user:
            raise PermissionDenied("Trip could be deleted only by the creator! Not allowed!")
        if instance.applications.filter(status="accepted").exists():
            raise ValidationError("You cannot delete a trip if it has a travelers!")
        
        else:
            instance.delete()


class TripApplicationViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]

    def get_serializer_class(self):
        if self.action == 'create':
            return TripApplicationCreateSeriazlier  
        return TripApplicationSerializer           

    def perform_create(self, serializer):
        serializer.save(applier=self.request.user)
        
    
    def perform_destroy(self, instance):
        if instance.applier != self.request.user:
            raise PermissionDenied("You can only delete your own travel requests!")
        instance.delete()
            
    def get_queryset(self):
        user = self.request.user
        return TripApplication.objects.filter(
            Q(applier=user) | Q(trip__creator=user)).distinct().order_by('applied_at')
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
        
        if accepted_cnt >= application.trip.total_seats:
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
    
    @action(detail=True, methods=['post'], url_path='payment')
    def pay_application(self, request, pk=None):
        application = self.get_object()
        
        if application.applier != request.user:
            return Response(
                {"detail": "You are not the applier of this trip!"}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        if application.status != 'accepted':
            return Response(
                {"detail": "You can only pay for accepted applications!"}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            seats = application.trip.total_seats if application.trip.total_seats > 0 else 1
            stripe_amount = int((application.trip.total_cost * 100) / seats)
            
            checkout_session = stripe.checkout.Session.create(
                payment_method_types=['card'],
                line_items=[{
                    'price_data': {
                        'currency': "kzt",
                        'product_data': {
                            'name': f'Trip from {application.trip.departure_from} to {application.trip.departure_to}',
                            'description': f'Departure date: {application.trip.departure_date}',
                        },
                        'unit_amount': stripe_amount
                    },
                    'quantity': 1,
                }],
                mode='payment',
                success_url=f'http://localhost:4200/payment/success?session_id={{CHECKOUT_SESSION_ID}}&app_id={application.id}',
                cancel_url='http://localhost:4200/payment/cancel',
                metadata={
                    'application_id': application.id,
                    'trip_id': application.trip.id,
                    'applier_id': application.applier.id
                }
            )
            return Response({"stripe_url": checkout_session.url}, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response({"detail": f"Stripe error: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
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
    
    @action(detail=True, methods=['post'], url_path='kick')
    def kick_teammate(self, request, pk=None): 
        application = self.get_object()
        
        if application.trip.creator != request.user:
            return Response({"detail": "You are not allowed to kick anyone from this trip!"}, 
                status=status.HTTP_403_FORBIDDEN
            )
            
        
        application.status = "kicked"
        application.save()
            
        return Response({"status": "teammate kicked successfully"}, status=status.HTTP_200_OK)
                    
            
        
    