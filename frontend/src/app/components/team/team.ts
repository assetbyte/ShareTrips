import { Component, ChangeDetectorRef, OnInit } from '@angular/core';
import { TripService } from '../../services/trip';
import { CommonModule } from '@angular/common';
// структура сгруппированной поездки
export interface GroupedTrip {
  tripId: number;
  departure_from: string;
  departure_to: string;
  departure_date: string;
  applications: any[]; // accepteds
}

@Component({
  selector: 'app-team',
  imports: [CommonModule],
  standalone: true,
  templateUrl: './team.html',
  styleUrl: './team.scss',
})
export class Team implements OnInit {
  groupedTrips: GroupedTrip[] = [];

  constructor(private tripService: TripService, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.tripService.getMyTeam().subscribe({
      next: (data: any[]) => {
        this.groupApplications(data);
        this.cdr.detectChanges();
      },
      error: (err) => {
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
            applications: []
          };
        }
        
        groups[tripId].applications.push(app);
      }
    });

    this.groupedTrips = Object.values(groups);
  }
}