import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import type { GitHubAuth, GitHubUser } from '@/types';

interface AuthStore {
  github: GitHubAuth | null;
  isAuthenticated: boolean;

  // Actions
  setGitHubAuth: (auth: GitHubAuth) => void;
  clearGitHubAuth: () => void;
  updateGitHubUser: (user: GitHubUser) => void;
  isTokenValid: () => boolean;
}

export const useAuthStore = create<AuthStore>()(
  devtools(
    persist(
      (set, get) => ({
        github: null,
        isAuthenticated: false,

        setGitHubAuth: (auth) => {
          set({
            github: auth,
            isAuthenticated: true
          });
        },

        clearGitHubAuth: () => {
          set({
            github: null,
            isAuthenticated: false
          });
        },

        updateGitHubUser: (user) => {
          set((state) => ({
            github: state.github
              ? {
                  ...state.github,
                  user
                }
              : null
          }));
        },

        isTokenValid: () => {
          const { github } = get();
          if (!github) return false;
          if (!github.expiresAt) return true;
          return Date.now() < github.expiresAt;
        }
      }),
      {
        name: 'fomo-auth-store'
      }
    )
  )
);
