import { createContext, useEffect, useState } from "react";
import { loginUser } from "../api/authApi";

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Restore existing session from localStorage
  useEffect(() => {
    const token = localStorage.getItem("transitops_token");
    const storedUser = localStorage.getItem("transitops_user");

    if (token && storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);

        setUser(parsedUser);
        setIsAuthenticated(true);
      } catch (error) {
        console.error("Invalid stored user session:", error);

        localStorage.removeItem("transitops_token");
        localStorage.removeItem("transitops_user");

        setUser(null);
        setIsAuthenticated(false);
      }
    }

    setLoading(false);
  }, []);

  // Real backend login
  const login = async (credentials) => {
    const response = await loginUser(credentials);

    if (!response.success) {
      return {
        success: false,
        message: response.message || "Login failed",
      };
    }

    const { token, user: loggedInUser } = response.data;

    localStorage.setItem("transitops_token", token);
    localStorage.setItem(
      "transitops_user",
      JSON.stringify(loggedInUser)
    );

    setUser(loggedInUser);
    setIsAuthenticated(true);

    return {
      success: true,
      user: loggedInUser,
    };
  };

  const logout = () => {
    localStorage.removeItem("transitops_token");
    localStorage.removeItem("transitops_user");

    setUser(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        user,
        loading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;