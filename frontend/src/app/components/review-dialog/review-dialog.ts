import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { FormsModule } from '@angular/forms';

//receiver
export interface ReviewReceiver {
  id: number;
  username: string;
}
//review
export interface ReviewResult {
  rating: number;
  comment: string;
}

@Component({
  selector: 'app-review-dialog',
  imports: [CommonModule, FormsModule, MatDialogModule],
  templateUrl: './review-dialog.html',
  styleUrl: './review-dialog.scss',
})


export class ReviewDialog {
  rating: number = 5 //default;
  comment: string = '';
  constructor(public dialogRef: MatDialogRef<ReviewDialog, ReviewResult | null>,
    @Inject(MAT_DIALOG_DATA) public data: {tripId: number; receiver: ReviewReceiver}
  ){}

  onCancel(): void {
    this.dialogRef.close(null); 
  }

  onSubmit(): void {
    if (!this.comment.trim()) {
      alert('Please enter a comment');
      return;
    }
    this.dialogRef.close({
      rating: this.rating,
      comment: this.comment
    });
  }
}
