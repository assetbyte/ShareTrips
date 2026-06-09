import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TripService } from '../../services/trip';
import { ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'app-future-trips',
  imports: [CommonModule],
  templateUrl: './future-trips.html',
  styleUrl: './future-trips.scss',
})
export class FutureTrips {  
  applications: any = [];
  isLoading: boolean = false;

  constructor(private tripService: TripService, private cdr: ChangeDetectorRef)
  {}

  ngOnInit() {
    this.isLoading = true;
    this.tripService.getMyApplications().subscribe({
      next: (data) => {
        this.applications = data;
        this.isLoading = false;
        this.cdr.detectChanges();
      },

      error: (err) => {
        console.log("Error occured. Try again!");
        this.isLoading = false;
      }
    })
  }

} 
