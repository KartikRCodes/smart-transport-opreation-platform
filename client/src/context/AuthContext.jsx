import { createContext, useState, useEffect } from "react";
import { loginUser, getCurrentUser } from "../api/authApi";

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("transitops_token"));
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      if (token) {
        try {
          const res = await getCurrentUser();
          if (res.success && res.data?.user) {
            setUser(res.data.user);
            setIsAuthenticated(true);
          } else {
            logout();
          }
        } catch (err) {
          logout();
        }
      }
      setIsLoading(false);
    };
    checkSession();
  }, [token]);

  const login = async (credentials) => {
    setIsLoading(true);
    try {
      const res = await loginUser(credentials);
      if (res.success && res.data) {
        localStorage.setItem("transitops_token", res.data.token);
        localStorage.setItem("transitops_user", JSON.stringify(res.data.user));
        setToken(res.data.token);
        setUser(res.data.user);
        setIsAuthenticated(true);
        return { success: true };
      }
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || "Invalid email or password.",
      };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("transitops_token");
    localStorage.removeItem("transitops_user");
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ user, token, isAuthenticated, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};