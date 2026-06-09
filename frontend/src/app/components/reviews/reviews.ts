import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReviewService } from '../../services/review';
import { Auth } from '../../services/auth';
import { Review, ReviewCreateData } from '../../models/user.model';

@Component({
  selector: 'app-reviews',
  imports: [FormsModule, CommonModule],
  templateUrl: './reviews.html',
  styleUrl: './reviews.scss',
})
export class Reviews implements OnInit {
  reviews: Review[] = [];
  
  newReview: ReviewCreateData = {
    user_receiver: 1,
    rating: 5,
    comment: ''
  };

  constructor(
    private reviewService: ReviewService,
    public authService: Auth,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadReviews();
  }

  loadReviews(): void {
    this.reviewService.getReviews().subscribe({
      next: (data) => {
        this.reviews = [...data];
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Error', err)
    });
  }

  sendReview(): void {
    if (!this.newReview.comment.trim()) return;

    this.reviewService.createReview(this.newReview).subscribe({
      next: (savedReview) => {
        console.log('Review added', savedReview);
        this.newReview.comment = '';
        this.loadReviews();
      },
      error: (err) => {
        console.error('Error', err);
        alert('Error occured while sending your review');
      }
    });
  }
}