import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";
import { API_BASE_URL, API_ENDPOINTS } from "../config/api.js";

const UserContext = createContext();

export function useUser() {
  return useContext(UserContext);
}

export function UserProvider({ children }) {
  const [user, setUser] = useState(null);

  // Fetch user info on mount
  useEffect(() => {
    axios
      .get(`${API_BASE_URL}${API_ENDPOINTS.ME}`, { withCredentials: true })
      .then((response) => {
        const data = response.data.user;
        setUser(data === "null" ? null : data);
      })
      .catch(() => setUser(null));
  }, []);

  // Login function
  const login = async (formData) => {
    const response = await axios.post(`${API_BASE_URL}${API_ENDPOINTS.LOGIN}`, formData, {
      withCredentials: true,
    });
    if (response.data !== "null") {
      // Fetch user info after login
      const userRes = await axios.get(`${API_BASE_URL}${API_ENDPOINTS.ME}`, {
        withCredentials: true,
      });
      const data = userRes.data.user;
      setUser(data === "null" ? null : data);
      return true;
    }
    return false;
  };

  // Logout function
  const logout = async () => {
    await axios.post(`${API_BASE_URL}${API_ENDPOINTS.LOGOUT}`, {}, { withCredentials: true });
    setUser(null);
  };

  return (
    <UserContext.Provider value={{ user, setUser, login, logout }}>
      {children}
    </UserContext.Provider>
  );
} 