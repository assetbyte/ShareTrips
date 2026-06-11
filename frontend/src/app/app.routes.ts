import { Routes } from '@angular/router';
import { Home } from './components/home/home';
import { Login } from './components/login/login';
import { Reviews } from './components/reviews/reviews';
import { FutureTrips } from './components/future-trips/future-trips';
import { Applications } from './components/applications/applications';
import { Team } from './components/team/team';
import { Register } from './components/register/register';
export const routes: Routes = [
    {path: '', component: Home},
    {path: 'login', component: Login},
    {path: 'reviews', component: Reviews},
    {path: 'future-trips', component: FutureTrips},
    { path: 'applications', component: Applications },
    { path: 'my-team', component: Team },
    {path: 'register', component: Register},
    {path: '**', redirectTo: '', pathMatch:"full"}
];
