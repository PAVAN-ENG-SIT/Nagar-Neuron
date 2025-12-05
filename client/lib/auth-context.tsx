import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { login as apiLogin, getUserProfile, User } from "./api";
import { setAuthToken, setOnUnauthorized } from "./query-client";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isLoggedIn: boolean;
  login: (phone: string, name?: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const handleLogout = useCallback(async () => {
    setUser(null);
    setAuthToken(null);
    await AsyncStorage.removeItem("userId");
    await AsyncStorage.removeItem("token");
  }, []);

  useEffect(() => {
    setOnUnauthorized(() => {
      handleLogout();
    });
    loadStoredUser();
  }, [handleLogout]);

  async function loadStoredUser() {
    try {
      const storedToken = await AsyncStorage.getItem("token");
      const storedUserId = await AsyncStorage.getItem("userId");
      
      if (storedToken) {
        setAuthToken(storedToken);
      }
      
      if (storedUserId) {
        const userData = await getUserProfile(parseInt(storedUserId));
        setUser(userData);
      }
    } catch (error) {
      console.log("No stored user found or session expired");
      await handleLogout();
    } finally {
      setIsLoading(false);
    }
  }

  async function login(phone: string, name?: string) {
    const result = await apiLogin(phone, name);
    if (result.success && result.user) {
      setUser(result.user);
      setAuthToken(result.token);
      await AsyncStorage.setItem("userId", result.user.id.toString());
      await AsyncStorage.setItem("token", result.token);
    }
  }

  async function logout() {
    await handleLogout();
  }

  async function refreshUser() {
    if (user) {
      const userData = await getUserProfile(user.id);
      setUser(userData);
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isLoggedIn: !!user,
        login,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
