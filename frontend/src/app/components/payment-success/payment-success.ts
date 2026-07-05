import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-payment-success',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './payment-success.html',
  styleUrl: './payment-success.scss',
})
export class PaymentSuccess {
  applicationId: string | null = null;
  sessionId: string | null = null;

  constructor(private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.applicationId = params['app_id'];
      this.sessionId = params['session_id'];
      
      console.log('Payment success for app:', this.applicationId);
      console.log('Stripe session ID:', this.sessionId);
    });
  }
}
