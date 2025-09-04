export interface LoginPayLoad {
  email: string;
  password: string;
}

export interface UserProfile {
  email: string;
  token: string;
  password: string;
  first_name: string;
  last_name: string;
  username: string;
  emergency_contact: string;
  bio: string;
  profile_picture: string;
  home_address: string;
  interests: string[];
  phone_number: string;
  country: string;
  gender: "male" | "female" | string;
  date_of_birth: string;
}

export interface ResetPayload {
  token: string;
  password: string;
  otp: string;
}

export interface Interest {
  id: string;
  name: string;
  created_at: string; // ISO Date string
  updated_at: string;
}

export interface ProfilePicture {
  url: string;
  provider: string;
}

export interface UserProfileR {
  id: string;
  email: string;
  username: string;
  first_name: string;
  last_name: string;
  bio: string;
  gender: "male" | "female" | string;
  country: string;
  phone_number: string;
  emergency_contact: string;
  date_of_birth: string; // ISO string, or Date if preferred
  home_address: string;
  profile_picture: ProfilePicture;
  interests: Interest[];
  created_at: string;
  updated_at: string;
  _count: {
    friends: number;
    my_friends: number;
  };
  auth_provider: string;
  fileId: string;
}

export interface EditProfilePayload {
  first_name: string;
  last_name: string;
  username: string;
  country: string;
  profile_picture_id: string;
  phone_number: string;
  emergency_contact: string;
  date_of_birth: string; // ISO date string, e.g., "1990-05-15"
  home_address: string;
  gender: string;
  bio: string;
  added_interests: string[];
  removed_interests: string[];
}

export interface PanicButtonPayload {
  reason: string;
  latitude: number;
  longitude: number;
}

export interface AccountDeletion {
  token: string;
  password: string;
}
