import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {Observable} from "rxjs";
import { Review, ReviewCreateData } from '../models/user.model';
import {Auth} from "./auth";



@Injectable({
  providedIn: 'root',
})
export class ReviewService {
  private apiUrl = 'http://localhost:8000/api/auth/reviews/';

  constructor(private http: HttpClient, private authService: Auth) {}

  getReviews(): Observable<Review[]> {
    return this.http.get<Review[]>(this.apiUrl);
  }
  
  createReview(reviewData: ReviewCreateData): Observable<Review> {
    const token = this.authService.getToken();    
    const headers = new HttpHeaders({
      'Authorization': `Token ${token}`
    });

    return this.http.post<Review>(this.apiUrl, reviewData, { headers });
  }
}
