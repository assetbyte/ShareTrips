import { Component, ChangeDetectorRef, OnInit } from '@angular/core';
import { TripService } from '../../services/trip';
import { Auth } from '../../services/auth'; 
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ReviewService } from '../../services/review';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ReviewDialog } from '../review-dialog/review-dialog';
import { HttpClient } from '@angular/common/http';

export interface GroupedTrip {
  tripId: number;
  departure_from: string;
  departure_to: string;
  departure_date: string;
  status: string;        
  total_cost: number;        
  accepted_cnt: number;      
  cost_per_person: number; 
  applications: any[]; 
}

@Component({
  selector: 'app-team',
  imports: [CommonModule, RouterLink, MatDialogModule, ReviewDialog],
  standalone: true,
  templateUrl: './team.html',
  styleUrl: './team.scss',
})
export class Team implements OnInit {
  groupedTrips: GroupedTrip[] = [];
  currentUserId: number | null = null; 

  constructor(
    private tripService: TripService, 
    private authService: Auth, 
    private reviewService: ReviewService,
    private dialog: MatDialog,
    private cdr: ChangeDetectorRef,
    private http: HttpClient,
  ) {}

  ngOnInit(): void {
    this.currentUserId = this.authService.getCurrentUserId();

    this.tripService.getMyTeam().subscribe({
      next: (data: any[]) => {
        this.groupApplications(data);
        this.cdr.detectChanges();
      },
      error: (err: any) => { 
        console.error('Error fetching team data:', err);
      }
    });
  }

  groupApplications(applications: any[]): void {
    const groups: { [key: number]: GroupedTrip } = {};

    applications.forEach(app => {
      if (app.status === 'accepted') {
        const tripId = app.trip.id;
        if (!groups[tripId]) {
          groups[tripId] = {
            tripId: tripId,
            departure_from: app.trip.departure_from,
            departure_to: app.trip.departure_to,
            departure_date: app.trip.departure_date,
            status: app.trip.status,
            total_cost: Number(app.trip.total_cost),
            accepted_cnt: app.trip.accepted_cnt,
            cost_per_person: app.trip.cost_per_person,
            applications: []
          };
        }
        groups[tripId].applications.push(app);
      }
    });

    this.groupedTrips = Object.values(groups);
  }

   onSimulatedPay(group: GroupedTrip): void {
    const myApplication = group.applications.find(
      app => app.applier.id === this.currentUserId
    );

    if (!myApplication) {
      alert('Drivers are not paying! Only passengers need to pay. You are the driver of this trip.');
      return;
    }

  const token = this.authService.getToken(); 

  const headers = {
    'Authorization': `Token ${token}` 
  };

  this.http.post<{ stripe_url: string }>(
    `http://localhost:8000/api/applications/${myApplication.id}/payment/`, 
    {},
    { headers } 
  ).subscribe({
    next: (response) => {
      if (response && response.stripe_url) {
        window.location.href = response.stripe_url;
      }
    },
    error: (err: any) => {
      console.error(err);
      alert(err.error?.detail || 'Unauthorized or error occurred.');
    }
  });
}

  openReviewDialog(tripId: number, receiver: any): void {
    const dialogRef = this.dialog.open(ReviewDialog, {
      width: '500px',
      data: { 
        tripId: tripId, 
        receiver: receiver 
      }
    });

    dialogRef.afterClosed().subscribe((result: { rating: number; comment: string } | null) => {
      if (result) {
        const reviewData = {
          trip: tripId,
          user_receiver: receiver.id, 
          rating: result.rating,
          comment: result.comment
        };

        this.reviewService.createReview(reviewData).subscribe({
          next: () => {
            alert(`Review for @${receiver.username} submitted successfully!`);
          },
          error: (err: any) => { 
            console.error(err);
            alert('Failed to submit review. Maybe you already reviewed them?');
          }
        });
      }
    });
  }

  kickTeammate(tripId: number, teammateId: number): void {
    if (confirm('Are you sure you want to kick this teammate?')) { 
      this.tripService.kickTeammate(teammateId).subscribe({
        next: (data) => {
          console.log("Teammate kicked successfully", data);
          alert("Teammate kicked successfully!");
          
          const tripGroup = this.groupedTrips.find(g => g.tripId === tripId);
          if (tripGroup) {
            tripGroup.applications = tripGroup.applications.filter(app => app.id !== teammateId);
            tripGroup.accepted_cnt--; 
          }
          this.cdr.detectChanges();
        },
        error: (err: any) => {
          console.error(err);
          alert("Something went wrong while kicking teammate");
        }
      });
    }
  }

  selfLeaveTrip(applcationId: number, tripId: number): void {
    if (confirm("Are you sure you want to leave this team?")){
      this.tripService.selfLeaveTrip(applcationId, tripId).subscribe({
        next: (data) => {
          console.log("You left team successfully");
          alert("You left the team!");
          
          const tripGroup = this.groupedTrips.find(g => g.tripId === tripId);
          if (tripGroup){
            tripGroup.applications = tripGroup.applications.filter(app => app.id !== applcationId);
            tripGroup.accepted_cnt--;
          }

          this.groupedTrips = this.groupedTrips.filter(g => g.applications.length > 0);
          this.cdr.detectChanges();
        },
        error: (err: any) => {
          alert("Something went wrong!");
        }
      });
    }
  }
}