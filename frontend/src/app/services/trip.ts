import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { min, Observable } from 'rxjs';
import { TripInfo, TripCreateData } from '../models/trip.model';
import { Auth } from './auth';
import { TripApplication } from '../models/trip-application.model';

@Injectable({
  providedIn: 'root',
})
export class TripService {
  private apiUrl = "http://localhost:8000/api/trips/";

  private appUrl = "http://localhost:8000/api/applications/";

  constructor(private http: HttpClient, private authService: Auth){}


  private getAuthHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({
      'Authorization': `Token ${token}`
    });
  }

  getTrips(from?: string, to?: string, date?:string, minCost?: number, maxCost?: number): Observable<TripInfo[]> {
    let params = new HttpParams();

    if (from) {
      params = params.set('from', from);
    }

    if (to) {
      params = params.set('to', to);
    }

    if (date) {
      params = params.set('date', date);
    }
    if (minCost) {
      params = params.set('min_price', minCost);
    }
    if (maxCost) {
      params = params.set('max_price', maxCost);
    }

    return this.http.get<TripInfo[]>(this.apiUrl, { params }); 
  }

  createTrip(tripData: TripCreateData): Observable<TripInfo> {
    const headers = this.getAuthHeaders();
    return this.http.post<TripInfo>(this.apiUrl, tripData, { headers });
  }

  applyForTrip(tripId: number, application_message: string): Observable<any> {
    const headers = this.getAuthHeaders();
    const body = { 
      trip: tripId, 
      application_message: application_message 
    };

    return this.http.post(this.appUrl, body, { headers });
  }

  getMyApplications(): Observable<any[]> {
    const headers = this.getAuthHeaders();
    return this.http.get<any[]>(this.appUrl, { headers }); 
  }

  
  acceptApplication(id: number): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.post(`${this.appUrl}${id}/accept/`, {}, { headers });
  }

  
  rejectApplication(id: number): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.post(`${this.appUrl}${id}/reject/`, {}, { headers });
  } 

  
  getPublisherOrders(): Observable<any[]> {
    const headers = this.getAuthHeaders();
    return this.http.get<any[]>(`${this.appUrl}driver_orders/`, { headers });
  }

  getMyTeam(): Observable<any[]> {
    const headers = this.getAuthHeaders()
    return this.http.get<any[]>(`${this.appUrl}my_team/`, {headers})
  }

  deleteTrip(tripId: number): Observable<void> {
    const headers = this.getAuthHeaders(); 
    return this.http.delete<void>(`${this.apiUrl}${tripId}/`, { headers });
  }

  kickTeammate(id: number): Observable<any> {
    const headers = this.getAuthHeaders()
    return this.http.post(`${this.appUrl}${id}/kick/`, {}, {headers})
  }

  selfLeaveTrip(applcationId: number, tripId: number): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.delete(`${this.appUrl}${applcationId}/`, {headers})
  }
}