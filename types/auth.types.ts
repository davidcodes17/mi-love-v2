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
