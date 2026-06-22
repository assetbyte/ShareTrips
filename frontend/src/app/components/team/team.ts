import { Component, ChangeDetectorRef, OnInit } from '@angular/core';
import { TripService } from '../../services/trip';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

export interface GroupedTrip {
  tripId: number;
  departure_from: string;
  departure_to: string;
  departure_date: string;
  total_cost: number;        
  accepted_cnt: number;      
  cost_per_person: number; 
  applications: any[]; // accepteds
}

@Component({
  selector: 'app-team',
  imports: [CommonModule, RouterLink],
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
    
    alert(`Freedom Pay test! \Route: ${group.departure_from} ➔ ${group.departure_to}\ To pay: ${group.cost_per_person} ₸`);
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
        error: (err) => {
          console.error(err);
          alert("Something went wrong while kicking teammate");
        }
      });
    }
  }
}