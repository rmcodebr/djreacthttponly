import { create } from "zustand";

import {
  loginUser,
  logoutUser,
  getUserInfo,
  refreshToken,
} from "../services/auth";

export const useAuthStore = create((set) => ({
  user: null,
  isAuthenticated: false,
  loading: true, // importante para o bootstrap

  // Carrega o usuário a partir do cookie HttpOnly
  fetchUser: async () => {
    try {
      const user = await getUserInfo();
      if (user) {
        set({
          user,
          isAuthenticated: true,
          loading: false,
        });
      } else {
        set({
          user: null,
          isAuthenticated: false,
          loading: false,
        });
      }
    } catch {
      set({
        user: null,
        isAuthenticated: false,
        loading: false,
      });
    }
  },

  login: async (email, password) => {
    await loginUser(email, password);

    // depois do login, busca o user
    const user = await getUserInfo();

    set({
      user,
      isAuthenticated: true,
    });
  },

  logout: async () => {
    await logoutUser();
    set({
      user: null,
      isAuthenticated: false,
    });
  },

  refresh: async () => {
    await refreshToken();
  },
}));
