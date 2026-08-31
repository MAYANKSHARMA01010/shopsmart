"use client";

import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from "react";

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
  verifyEmail: () => Promise<void>;
  verifyPhone: () => Promise<void>;
  sendEmailOtp: () => Promise<{ message: string; expiresInSeconds: number }>;
  verifyEmailOtp: (otp: string) => Promise<void>;
  sendPhoneOtp: () => Promise<{ message: string; expiresInSeconds: number }>;
  verifyPhoneOtp: (otp: string) => Promise<void>;
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
        } catch (error: unknown) {
          const msg = error instanceof Error ? error.message : "";
          // If the user no longer exists in the database (e.g. after a DB reset),
          // we must clear all persisted auth state so the user is logged out.
          // We distinguish this from a transient server restart by checking the message.
          const isUserGone =
            msg.toLowerCase().includes("user not found") ||
            msg.toLowerCase().includes("not found");

          if (isUserGone) {
            console.warn("[AuthContext] User no longer exists in DB. Clearing auth state.");
            clearAuth();
            useCartStore.getState().resetCart();
            useWishlistStore.getState().resetWishlist();
          } else {
            // Transient error (server restarting, network blip) — keep logged in silently
            console.error("Failed to load user profile on mount (server might be restarting):", error);
          }
        }
      }
      setIsLoading(false);
    };

    initAuth();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accessToken, isHydrated]);

  const login = useCallback(async (values: LoginFormValues) => {
    setIsLoading(true);
    try {
      const res = await authService.login(values);
      setAuth(res.data.user, res.data.accessToken, res.data.refreshToken);
      try {
        await useCartStore.getState().mergeGuestCart();
        await useCartStore.getState().fetchCart();
      } catch (e) {
        console.error("Cart sync error on login:", e);
      }
    } finally {
      setIsLoading(false);
    }
  }, [setAuth]);

  const register = useCallback(async (values: RegisterFormValues) => {
    setIsLoading(true);
    try {
      const res = await authService.register(values);
      setAuth(res.data.user, res.data.accessToken, res.data.refreshToken);
      try {
        await useCartStore.getState().mergeGuestCart();
        await useCartStore.getState().fetchCart();
      } catch (e) {
        console.error("Cart sync error on register:", e);
      }
    } finally {
      setIsLoading(false);
    }
  }, [setAuth]);

  const logout = useCallback(async () => {
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
  }, [refreshToken, clearAuth]);

  const updateProfile = useCallback(async (values: UpdateProfileFormValues) => {
    const res = await authService.updateProfile(values);
    updateUser(res.data.user);
  }, [updateUser]);

  const verifyEmail = useCallback(async () => {
    const res = await authService.verifyEmail();
    updateUser(res.data.user);
  }, [updateUser]);

  const verifyPhone = useCallback(async () => {
    const res = await authService.verifyPhone();
    updateUser(res.data.user);
  }, [updateUser]);

  const sendEmailOtp = useCallback(async () => {
    const res = await authService.sendEmailOtp();
    return res.data;
  }, []);

  const verifyEmailOtp = useCallback(async (otp: string) => {
    const res = await authService.verifyEmailOtp(otp);
    updateUser(res.data.user);
  }, [updateUser]);

  const sendPhoneOtp = useCallback(async () => {
    const res = await authService.sendPhoneOtp();
    return res.data;
  }, []);

  const verifyPhoneOtp = useCallback(async (otp: string) => {
    const res = await authService.verifyPhoneOtp(otp);
    updateUser(res.data.user);
  }, [updateUser]);

  const value = React.useMemo<AuthContextType>(
    () => ({
      user,
      isLoading,
      isAuthenticated: !!user,
      login,
      register,
      logout,
      updateProfile,
      verifyEmail,
      verifyPhone,
      sendEmailOtp,
      verifyEmailOtp,
      sendPhoneOtp,
      verifyPhoneOtp,
    }),
    [
      user,
      isLoading,
      login,
      register,
      logout,
      updateProfile,
      verifyEmail,
      verifyPhone,
      sendEmailOtp,
      verifyEmailOtp,
      sendPhoneOtp,
      verifyPhoneOtp,
    ]
  );



  return (
    <AuthContext.Provider value={value}>
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
