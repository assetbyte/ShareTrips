import { Component, ChangeDetectorRef, OnInit } from '@angular/core';
import { TripService } from '../../services/trip';
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-team',
  imports: [CommonModule],
  standalone: true,
  templateUrl: './team.html',
  styleUrl: './team.scss',
})
export class Team implements OnInit {

  teamMembers: any[] = []
  constructor(private tripService: TripService, private cdr: ChangeDetectorRef ){}

  ngOnInit() : void{
    this.tripService.getMyTeam().subscribe({
      next: (data) => {
        this.teamMembers = [...data]
        this.cdr.detectChanges();

      },
      error: (err) => {
        console.error(err)
      }

    })
  }

}


