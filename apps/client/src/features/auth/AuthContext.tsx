"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useAuthStore } from "./store/authStore";
import { authService } from "./services/authService";
import type { User, LoginFormValues, RegisterFormValues, UpdateProfileFormValues } from "./types/authSchema";
import toast from "react-hot-toast";
import { useCartStore } from "../cart/store/cartStore";
import { useWishlistStore } from "../wishlist/store/wishlistStore";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (values: LoginFormValues) => Promise<void>;
  register: (values: RegisterFormValues) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (values: UpdateProfileFormValues) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { user, accessToken, refreshToken, setAuth, updateUser, clearAuth } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    const unsubFinishHydration = useAuthStore.persist.onFinishHydration(() => setIsHydrated(true));
    setIsHydrated(useAuthStore.persist.hasHydrated());
    return () => {
      unsubFinishHydration();
    };
  }, []);

  useEffect(() => {
    if (!isHydrated) return;

    const initAuth = async () => {
      if (accessToken) {
        try {
          const res = await authService.getMe();
          updateUser(res.data.user);
        } catch (error) {
          console.error("Failed to load user profile on mount (server might be restarting):", error);
          // We intentionally DO NOT call clearAuth() here.
          // apiClient.ts already handles clearing auth if the token is genuinely invalid (401).
          // If we clear it here, the user gets logged out every time the server restarts or goes offline!
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, [accessToken, isHydrated, updateUser, clearAuth]);

  const login = async (values: LoginFormValues) => {
    setIsLoading(true);
    try {
      const res = await authService.login(values);
      setAuth(res.data.user, res.data.accessToken, res.data.refreshToken);
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (values: RegisterFormValues) => {
    setIsLoading(true);
    try {
      const res = await authService.register(values);
      setAuth(res.data.user, res.data.accessToken, res.data.refreshToken);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      if (refreshToken) {
        await authService.logout(refreshToken);
      }
      toast.success("Logged out successfully");
    } catch (error: any) {
      console.error("Logout API error:", error);
      toast.error("Failed to log out: " + (error.message || "Unknown error"));
    } finally {
      clearAuth();
      useCartStore.getState().resetCart();
      useWishlistStore.getState().resetWishlist();
      setIsLoading(false);
    }
  };

  const updateProfile = async (values: UpdateProfileFormValues) => {
    const res = await authService.updateProfile(values);
    updateUser(res.data.user);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
