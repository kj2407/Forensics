import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { authAPI } from "../api/api";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user,    setUser]    = useState(() => { try { return JSON.parse(localStorage.getItem("forensics_user")); } catch { return null; } });
  const [token,   setToken]   = useState(() => localStorage.getItem("forensics_token") || null);
  const [loading, setLoading] = useState(true);

  const saveSession = useCallback((token, user) => {
    localStorage.setItem("forensics_token", token);
    localStorage.setItem("forensics_user",  JSON.stringify(user));
    setToken(token);
    setUser(user);
  }, []);

  const clearSession = useCallback(() => {
    localStorage.removeItem("forensics_token");
    localStorage.removeItem("forensics_user");
    setToken(null);
    setUser(null);
  }, []);

  useEffect(() => {
    const verify = async () => {
      if (!token) { setLoading(false); return; }
      try {
        const { data } = await authAPI.me();
        setUser(data);
        localStorage.setItem("forensics_user", JSON.stringify(data));
      } catch {
        clearSession();
      } finally {
        setLoading(false);
      }
    };
    verify();
  }, []); // eslint-disable-line

  const login = async (email, password) => {
    const { data } = await authAPI.login({ email, password });
    saveSession(data.token, data.user);
    return data.user;
  };

  const register = async (payload) => {
    const { data } = await authAPI.register(payload);
    saveSession(data.token, data.user);
    return data.user;
  };

  const logout = () => clearSession();

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, isAdmin: user?.role === "admin" }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);