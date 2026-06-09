import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { Auth } from '../../services/auth';
import { TripService } from '../../services/trip';
import { TripInfo, TripCreateData } from '../../models/trip.model';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home implements OnInit {
  trips: TripInfo[] = [];
  isLoading: boolean = false;

  errorMessage: { [key: number]: string } = {};

  searchFrom: string = '';
  searchTo: string = '';

  newTrip: TripCreateData = {
    departure_from: '',
    departure_to: '',
    departure_date: '',
    return_date: '',
    application_deadline: '',
    total_cost: 0,

    total_seats: 0
  };

  constructor (
    private tripService: TripService, 
    public authService: Auth,
    private cdr: ChangeDetectorRef,
    private router: Router,
    private route: ActivatedRoute
  ) {};

  ngOnInit(): void {
    const snapshotParams = this.route.snapshot.queryParams;
    if (snapshotParams['from'] || snapshotParams['to']) {
      this.searchFrom = '';
      this.searchTo = '';
    
      this.router.navigate([], {
        relativeTo: this.route,
        queryParams: { from: null, to: null },
        queryParamsHandling: 'merge'
      });
    }

    this.route.queryParams.subscribe(params => {
      this.searchFrom = params['from'] || '';
      this.searchTo = params['to'] || '';
      this.executeSearch(this.searchFrom, this.searchTo);
    });
  }

  executeSearch(from?: string, to?: string) {
    this.isLoading = true; 
    this.tripService.getTrips(from, to).subscribe({
      next: (data) => {
        this.trips = [...data];
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Trips are not available:', err);
        this.isLoading = false;
      }
    });
  }

  onSearch(): void {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        from: this.searchFrom || null,
        to: this.searchTo || null
      },
      queryParamsHandling: 'merge'
    });
  }

  onCreateTrip() {
    if (!this.newTrip.departure_from || !this.newTrip.departure_to || !this.newTrip.departure_date) {
      alert('Please enter required info!');
      return;
    }

    this.tripService.createTrip(this.newTrip).subscribe({
      next: (data) => {
        console.log('Trip created successfully:', data);
        this.newTrip = {
          departure_from: '',
          departure_to: '',
          departure_date: '',
          return_date: '',
          application_deadline: '',
          total_cost: 0,
          total_seats: 4
        };
        this.executeSearch(this.searchFrom, this.searchTo);
      },
      error: (err) => {
        console.error('Error while trying create a trip:', err);
        alert('Something went wrong, check the authorization');
        console.log('Django validation errors:', err.error);
      }
    });
  }

  trackByTripId(index: number, trip: TripInfo): number {
    return trip.id;
  }

  onApply(tripId: number) {
    this.errorMessage[tripId] = '';

    this.tripService.applyForTrip(tripId).subscribe({
      next: (response) => {
        alert('Success! Your request was sent to the publisher');
        this.cdr.detectChanges(); 
      },
      error: (err) => {
        console.error('Catch application error:', err);

        if (!err.error) {
          this.errorMessage[tripId] = 'Something went wrong. Please try again later.';
          this.cdr.detectChanges(); 
          return;
        }

        if (typeof err.error === 'string') {
          this.errorMessage[tripId] = err.error;
        } 
        else if (Array.isArray(err.error)) {
          this.errorMessage[tripId] = err.error[0];
        } 
        else if (typeof err.error === 'object') {
          const firstKey = Object.keys(err.error)[0];
          const errorValue = err.error[firstKey];

          if (Array.isArray(errorValue)) {
            this.errorMessage[tripId] = errorValue[0];
          } else if (typeof errorValue === 'string') {
            this.errorMessage[tripId] = errorValue;
          } else {
            this.errorMessage[tripId] = JSON.stringify(errorValue);
          }
        }
        
        this.cdr.detectChanges(); 
      }
    });
  }
}