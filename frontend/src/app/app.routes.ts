import { Routes } from '@angular/router';
import { Home } from './components/home/home';
import { Login } from './components/login/login';
import { Reviews } from './components/reviews/reviews';
import { FutureTrips } from './components/future-trips/future-trips';
import { Applications } from './components/applications/applications';
import { Team } from './components/team/team';
import { Register } from './components/register/register';
import { MyProfile } from './components/my-profile/my-profile';
import { ChatComponent } from './components/chat/chat';
import { PaymentSuccess } from './components/payment-success/payment-success';
import { PaymentCancel } from './components/payment-cancel/payment-cancel';
export const routes: Routes = [
    {path: '', component: Home},
    {path: 'login', component: Login},
    {path: 'reviews', component: Reviews},
    {path: 'future-trips', component: FutureTrips},
    { path: 'applications', component: Applications },
    { path: 'my-team', component: Team },
    {path: 'register', component: Register},
    {path: 'my-profile/:id', component: MyProfile},
    { path: 'chat/:id', component: ChatComponent},
     {path: 'payment/success', component: PaymentSuccess},
    {path: 'payment-cancel', component: PaymentCancel},
    {path: '**', redirectTo: '', pathMatch:"full"},                 
   
];
