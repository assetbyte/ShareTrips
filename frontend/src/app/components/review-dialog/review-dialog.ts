import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { FormsModule } from '@angular/forms';


export interface ReviewReceiver {
  id: number;
  username: string;
}

export interface ReviewResult {
  rating: number;
  comment: string;
}

@Component({
  selector: 'app-review-dialog',
  imports: [],
  templateUrl: './review-dialog.html',
  styleUrl: './review-dialog.scss',
})




export class ReviewDialog {

}
