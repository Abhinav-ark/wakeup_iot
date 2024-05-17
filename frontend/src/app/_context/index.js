"use client";
import React, { createContext, useState, useCallback, useEffect } from "react";
import axios from "axios";

axios.defaults.withCredentials = true;

const serverUrl = process.env.NEXT_PUBLIC_SERVER_URL;

export const AuthContext = createContext();

export const AuthContextProvider = ({ children }) => {
  const [loggedIn, setLoggedIn] = useState(null);
  const [user, setUser] = useState(null);

  const checkLoginState = useCallback(async () => {
    try {
      const {
        data: { loggedIn: logged_in, user },
      } = await axios.get(`${serverUrl}/auth/logged_in`);
      setLoggedIn(logged_in);
      setUser(user);
    } catch (err) {
      console.error(err);
    }
  }, []);

  useEffect(() => {
    checkLoginState();
  }, [checkLoginState]);

  return (
    <AuthContext.Provider value={{ loggedIn, user, checkLoginState }}>
      {children}
    </AuthContext.Provider>
  );
};
