import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { User, CleanerProfile, UserRole } from '@shared/types';
type AuthState = {
  isAuthenticated: boolean;
  user: User | CleanerProfile | null;
  role: UserRole | null;
};
type AuthActions = {
  login: (user: User | CleanerProfile, role: UserRole) => void;
  logout: () => void;
  updateUser: (updatedUser: Partial<User | CleanerProfile>) => void;
  setPremiumStatus: (isPremium: boolean) => void;
};
export const useAuthStore = create<AuthState & AuthActions>()(
  persist(
    immer((set) => ({
      isAuthenticated: false,
      user: null,
      role: null,
      login: (user, role) => {
        set((state) => {
          state.isAuthenticated = true;
          state.user = user;
          state.role = role;
        });
      },
      logout: () => {
        set((state) => {
          state.isAuthenticated = false;
          state.user = null;
          state.role = null;
        });
      },
      updateUser: (updatedUser) => {
        set((state) => {
          if (state.user) {
            state.user = { ...state.user, ...updatedUser };
          }
        });
      },
      setPremiumStatus: (isPremium: boolean) => {
        set((state) => {
          if (state.user && state.role === 'cleaner') {
            (state.user as CleanerProfile).isPremium = isPremium;
          }
        });
      },
    })),
    {
      name: 'cleenly-auth-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);