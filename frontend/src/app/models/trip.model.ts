import { UserShortInfo } from "./user.model";

export interface TripInfo {
  id: number;
  creator: UserShortInfo;      
  departure_from: string;
  departure_to: string;
  departure_date: string;     
  return_date?: string;   
  application_deadline: string; 
  total_cost: number;           
  status: 'open' | 'closed' | 'completed';
}


export interface TripCreateData {
  departure_from: string;
  departure_to: string;
  departure_date: string;
  return_date: string; 
  application_deadline: string;
  total_cost: number;
}