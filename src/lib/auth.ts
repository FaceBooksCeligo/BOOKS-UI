"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import apiClient from "@/lib/api";
import { redirect } from "next/navigation";

type AuthState = {
  token: string | null;
  orgId: string | null;
  entityId?: string | null;
  user: {
    _id: string;
    email: string;
    firstName?: string;
    lastName?: string;
    role?: string;
  } | null;
  isAuthenticated: boolean;
  setAuth: (data: { token: string; user: any; orgId?: string; entityId?: string }) => void;
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
      setAuth: ({ token, user, orgId, entityId }) => {
        console.log("Setting auth state:", { token: !!token, user: !!user, orgId });
        apiClient.setToken(token);
        if (orgId) {
          console.log("Setting orgId in API client:", orgId);
          apiClient.setOrgId(orgId);
        }
        if (entityId) {
          apiClient.setEntityId(entityId);
        }
        // Install unauthorized handler
        apiClient.setUnauthorizedHandler(() => {
          console.warn("Unauthorized detected. Clearing auth and redirecting to login.");
          // Clear local store immediately
          set({ token: null, user: null, orgId: null, entityId: null, isAuthenticated: false });
          apiClient.setToken(null);
          apiClient.setOrgId(null);
          apiClient.setEntityId(null);
          try {
            window?.localStorage?.removeItem("books-ui-auth");
          } catch (_) {}
          // Redirect to login
          if (typeof window !== 'undefined') {
            window.location.href = "/auth/login";
          }
        });
        set({ token, user, orgId: orgId || null, entityId: entityId || null, isAuthenticated: true });
      },
      clearAuth: () => {
        apiClient.setToken(null);
        apiClient.setOrgId(null);
        apiClient.setEntityId(null);
        apiClient.setUnauthorizedHandler(null);
        set({ token: null, user: null, orgId: null, entityId: null, isAuthenticated: false });
      },
      setOrgId: (orgId: string) => {
        apiClient.setOrgId(orgId);
        set({ orgId });
      },
    }),
    {
      name: "books-ui-auth",
      partialize: (state) => ({ token: state.token, orgId: state.orgId, entityId: state.entityId, user: state.user, isAuthenticated: state.isAuthenticated }),
      onRehydrateStorage: () => (state) => {
        console.log("Rehydrating auth state:", state);
        if (state?.token) {
          console.log("Setting token in API client");
          apiClient.setToken(state.token);
        }
        if (state?.orgId) {
          console.log("Setting orgId in API client:", state.orgId);
          apiClient.setOrgId(state.orgId);
        }
        if (state?.entityId) {
          apiClient.setEntityId(state.entityId);
        }
        // Re-install unauthorized handler after hydration
        apiClient.setUnauthorizedHandler(() => {
          console.warn("Unauthorized detected. Clearing auth and redirecting to login.");
          try {
            window?.localStorage?.removeItem("books-ui-auth");
          } catch (_) {}
          apiClient.setToken(null);
          apiClient.setOrgId(null);
          apiClient.setEntityId(null);
          if (typeof window !== 'undefined') {
            window.location.href = "/auth/login";
          }
        });
      },
    }
  )
);


