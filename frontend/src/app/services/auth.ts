import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Observable, tap} from "rxjs";
import { AuthResponse } from '../models/user.model';

@Injectable({
  providedIn: 'root',
})
export class Auth { 
  private apiUrl = 'http://localhost:8000/api/auth/login/';
  private registerUrl = 'http://localhost:8000/api/auth/register/';

  constructor(private http: HttpClient) {}
  
  login(credentials: any): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(this.apiUrl, credentials).pipe(
      tap(response => {
        localStorage.setItem('token', response.token);
        localStorage.setItem('user_id', response.user_id.toString());
        localStorage.setItem('username', response.username);
      })
    )
  }

  register(userData: any): Observable<any> {
    return this.http.post<any>(this.registerUrl, userData);
  }
  
  logout(): void {
    localStorage.clear();
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('token');
  }
  
  getToken(): string | null {
    return localStorage.getItem('token');
  }
}
