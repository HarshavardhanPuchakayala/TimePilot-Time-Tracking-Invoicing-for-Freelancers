import { createContext, useContext, useEffect, useState } from "react";
import { login as loginApi, signup as signupApi, getMe } from "../api/auth";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const response = await getMe();
        setUser(response.data.user);
      } catch (error) {
        localStorage.removeItem("token");
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (credentials) => {
    const response = await loginApi(credentials);

    const { token, user } = response.data;

    localStorage.setItem("token", token);
    setUser(user);

    return response;
  };

  const signup = async (data) => {
    const response = await signupApi(data);

    const { token, user } = response.data;

    localStorage.setItem("token", token);
    setUser(user);

    return response;
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, login, signup, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);