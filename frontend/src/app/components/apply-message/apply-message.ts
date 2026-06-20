import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { 
  MatDialogRef, 
  MAT_DIALOG_DATA, 
  MatDialogContent, 
  MatDialogActions, 
  MatDialogTitle 
} from '@angular/material/dialog'; 

@Component({
  selector: 'app-apply-message',
  standalone: true,
  
  imports: [
    CommonModule, 
    FormsModule,         
    MatDialogContent,   
    MatDialogActions,  
    MatDialogTitle      
  ],
  templateUrl: './apply-message.html',
  styleUrl: './apply-message.scss',
})
export class ApplyMessage {
  message: string = '';

  constructor(
    public dialogRef: MatDialogRef<ApplyMessage>, // ссылка на окно 
    @Inject(MAT_DIALOG_DATA) public data: { tripId: number } //home.ts -> tripId
  ) {}

  onCancel(): void {
    this.dialogRef.close();
  }

  onSend(): void {
    if (this.message.trim()) {
      this.dialogRef.close(this.message);
    }
  }
}