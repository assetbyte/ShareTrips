export interface UserShortInfo {
    id: number;
    username: string;
    email: string;
}

export interface UserProfile {
    id: number;
    name: string;
    last_name: string;
    phone: string;
    bio: string;
    avatar: string | null; 

    user_id: number;     
    username?: string;   
    email?: string;
}

export interface Review {
  id: number;
  user_sender: UserShortInfo;   
  user_receiver: UserShortInfo; 
  rating: number;
  comment: string;
  created_at: string;
}

export interface ReviewCreateData {
    user_receiver: number;   
    rating: number;
    comment: string;
}


export interface AuthResponse {
    token: string;
    user_id: number;
    username: string;
}