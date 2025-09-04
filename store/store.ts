import { create } from "zustand";

// --- Interfaces ---
export interface ProfilePicture {
  id: string;
  url: string;
  provider: string;
  created_at: string;
  updated_at: string;
  type: string;
  ref?: string | null;
  postId?: string | null;
}

export interface Interest {
  id: string;
  name: string;
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
  date_of_birth: string; // ISO string
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

// --- Zustand Store ---
interface UserStore {
  user: UserProfileR | null;
  setUser: (user: UserProfileR) => void;
  updateUser: (updates: Partial<UserProfileR>) => void;
  clearUser: () => void;
}

export const useUserStore = create<UserStore>((set) => ({
  user: null,

  setUser: (user) => set({ user }),

  updateUser: (updates) =>
    set((state) => ({
      user: state.user ? { ...state.user, ...updates } : null,
    })),

  clearUser: () => set({ user: null }),
}));
