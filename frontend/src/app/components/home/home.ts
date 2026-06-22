import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { Auth } from '../../services/auth';
import { TripService } from '../../services/trip';
import { TripInfo, TripCreateData } from '../../models/trip.model';
import { min } from 'rxjs';
import { MatSliderModule } from '@angular/material/slider';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ApplyMessage } from '../apply-message/apply-message';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, MatSliderModule, MatDialogModule],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home implements OnInit {
  trips: TripInfo[] = [];
  isLoading: boolean = false;

  currentUserId: number | null = null;

  errorMessage: { [key: number]: string } = {};

  createTripErrors: { [key: string]: string } = {};

  searchFrom: string = '';
  searchTo: string = '';
  departureDate: string = '';
  minCost: number = 0;
  maxCost: number = 0;


  newTrip: TripCreateData = {
    departure_from: '',
    departure_to: '',
    departure_date: '',
    return_date: '',
    application_deadline: '',
    total_cost: 0,

    total_seats: 4
  };

  constructor (
    private tripService: TripService, 
    public authService: Auth,
    private cdr: ChangeDetectorRef,
    private router: Router,
    private dialog: MatDialog,
    private route: ActivatedRoute
  ) {};

  ngOnInit(): void {
    this.getCurrentUser();
    const snapshotParams = this.route.snapshot.queryParams;
    if (snapshotParams['from'] || snapshotParams['to'] || snapshotParams["date"] || snapshotParams["minCost"] || snapshotParams["maxCost"]) {
      this.searchFrom = '';
      this.searchTo = '';
      this.departureDate = '';
      this.minCost = 0;
      this.maxCost = 0;
    
      this.router.navigate([], {
        relativeTo: this.route,
        queryParams: { from: null, to: null, date: null, minCost: null, maxCost: null },
        queryParamsHandling: 'merge'
      });
    }

    this.route.queryParams.subscribe(params => {
    this.searchFrom = params['from'] || '';
    this.searchTo = params['to'] || '';
    this.departureDate = params['date'] || '';

    this.minCost = params['minCost'] ? +params['minCost'] : 0;
    this.maxCost = params['maxCost'] ? +params['maxCost'] : 0;
    
    this.executeSearch(this.searchFrom, this.searchTo, this.departureDate, this.minCost, this.maxCost);
  });
  }

  executeSearch(from?: string, to?: string, date?: string, minCost?: number, maxCost?: number) {
  this.isLoading = true; 
  this.tripService.getTrips(from, to, date, minCost, maxCost).subscribe({
    next: (data) => {
      this.trips = [...data];
      this.isLoading = false;

  
      if (this.trips.length > 0) {
  
        const prices = this.trips.map(trip => trip.total_cost);
        
        const computedMin = Math.min(...prices);
        const computedMax = Math.max(...prices);

  
        if (!minCost && !maxCost) {
          this.minCost = computedMin;
          this.maxCost = computedMax;
        }
      }

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
        to: this.searchTo || null,
        date: this.departureDate || null,
        minCost: this.minCost || null,
        maxCost: this.maxCost || null
      },
      queryParamsHandling: 'merge'
    });
  }

  getCurrentUser(): void {
    const savedId = localStorage.getItem('user_id');
    if (savedId) {
      this.currentUserId = Number(savedId);
    }
  }

  onCreateTrip() {
    if (!this.newTrip.departure_from || !this.newTrip.departure_to || !this.newTrip.departure_date) {
      alert('Please enter required info!');
      return;
    }

    const tripDataToSubmit = { ...this.newTrip };

    if (tripDataToSubmit.return_date === '') {
      tripDataToSubmit.return_date = null as any; 
    }

    this.tripService.createTrip(tripDataToSubmit).subscribe({
      next: (data) => {
        alert('Trip created successfully');
        this.createTripErrors = {};
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
        this.createTripErrors = {}; 
        if (err.error && typeof err.error === 'object' && !Array.isArray(err.error)) {
          Object.keys(err.error).forEach(key => {
            const errorValue = err.error[key];
            this.createTripErrors[key] = Array.isArray(errorValue) ? errorValue[0] : errorValue;
          });
        } else {
          alert('Something went wrong, check if you filled all required fields!');
        }
        
        this.cdr.detectChanges(); 
      }
    });
  }

  trackByTripId(index: number, trip: TripInfo): number {
    return trip.id;
  }

  onApply(tripId: number) {
    this.errorMessage[tripId] = '';

    const dialogRef = this.dialog.open(ApplyMessage, {
      width: '1000px',
      data: { tripId: tripId }
    });

    dialogRef.afterClosed().subscribe((resultMessage: string) => {
      if (!resultMessage) {
        return; 
      }

      this.tripService.applyForTrip(tripId, resultMessage).subscribe({
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
    });
  }

  onDeleteTrip(tripId: number): void {
  if (confirm('Are you sure you want to delete this trip?')) {
    this.tripService.deleteTrip(tripId).subscribe({
      next: () => {
        this.trips = this.trips.filter(t => t.id !== tripId);
        alert('Trip deleted successfully!');
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error(err);
        if (err.error && err.error.detail) {
          alert(err.error.detail);
        } else if (err.error && typeof err.error === 'string') {
          alert(err.error);
        } else {
          alert('Failed to delete the trip. Something went wrong.');
        }
      }
    });
  }
}
}