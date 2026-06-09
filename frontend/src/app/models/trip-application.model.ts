import { UserShortInfo } from './user.model';
import { TripInfo } from './trip.model';

export interface TripApplication {
  id: number;
  trip: TripInfo | number;          
  applier: UserShortInfo;       
  status: 'pending' | 'accepted' | 'rejected'; 
  applied_at: string;           
}