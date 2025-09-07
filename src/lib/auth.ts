"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import apiClient from "@/lib/api";

type AuthState = {
  token: string | null;
  orgId: string | null;
  user: {
    _id: string;
    email: string;
    firstName?: string;
    lastName?: string;
    role?: string;
  } | null;
  isAuthenticated: boolean;
  setAuth: (data: { token: string; user: any; orgId?: string }) => void;
  clearAuth: () => void;
  setOrgId: (orgId: string) => void;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      orgId: null,
      user: null,
      isAuthenticated: false,
      setAuth: ({ token, user, orgId }) => {
        apiClient.setToken(token);
        if (orgId) apiClient.setOrgId(orgId);
        set({ token, user, orgId: orgId || null, isAuthenticated: true });
      },
      clearAuth: () => {
        apiClient.setToken(null);
        apiClient.setOrgId(null);
        set({ token: null, user: null, orgId: null, isAuthenticated: false });
      },
      setOrgId: (orgId: string) => {
        apiClient.setOrgId(orgId);
        set({ orgId });
      },
    }),
    {
      name: "books-ui-auth",
      partialize: (state) => ({ token: state.token, orgId: state.orgId, user: state.user, isAuthenticated: state.isAuthenticated }),
      onRehydrateStorage: () => (state) => {
        if (state?.token) apiClient.setToken(state.token);
        if (state?.orgId) apiClient.setOrgId(state.orgId);
      },
    }
  )
);


