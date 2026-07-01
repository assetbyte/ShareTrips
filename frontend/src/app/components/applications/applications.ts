import { Component, Input, OnInit } from '@angular/core';
import { TripService } from '../../services/trip';
import { ChangeDetectorRef } from '@angular/core';
import { DatePipe, CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
@Component({
  selector: 'app-applications',
  standalone: true,
  imports: [CommonModule, DatePipe, RouterLink], 
  templateUrl: './applications.html',
  styleUrl: './applications.scss',
})
export class Applications implements OnInit {

  incomingApplications: any[] = []; 
  constructor(
    private tripService: TripService, 
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadIncomingRequests();
  }

  
  loadIncomingRequests(): void {
    this.tripService.getPublisherOrders().subscribe({
      next: (orders) => {
        this.incomingApplications = [...orders];
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error loading passenger applications:', err);
      }
    });
  }

  onAccept(appId: number) {
    this.tripService.acceptApplication(appId).subscribe({
      next: () => {
        alert('Passenger added to the team succefully');
        const app = this.incomingApplications.find(a => a.id === appId);
        if (app) app.status = 'accepted';
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Error accepting application:', err)
    });
  }

  onReject(appId: number) : void {
    this.tripService.rejectApplication(appId).subscribe({
      next: () => {
        alert('Rejected');
        const app = this.incomingApplications.find(a => a.id === appId);
        if (app) app.status = 'rejected';
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Error rejecting application:', err)
    });
  }
}