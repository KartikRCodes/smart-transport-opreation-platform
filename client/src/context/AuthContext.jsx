import { createContext, useState, useEffect } from "react";

// Create the authentication context channel
export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  // 🔥 DEVELOPMENT BYPASS: Hardcoded initial states to bypass loading blockers
  const [isAuthenticated, setIsAuthenticated] = useState(true);
  const [user, setUser] = useState({ name: "Daksh Sudo", role: "Fleet Manager" });
  const [loading, setLoading] = useState(false);

  // Keep a placeholder effect block to satisfy other component lifecycles safely
  useEffect(() => {
    // Session checks bypassed for local interface development
    setLoading(false);
  }, []);

  // Mock implementation of the login sequence
  const login = async (credentials) => {
    setIsAuthenticated(true);
    setUser({ name: "Daksh Sudo", role: "Fleet Manager" });
    setLoading(false);
    return { success: true };
  };

  // Mock implementation of the logout sequence
  const logout = async () => {
    localStorage.removeItem("transitops_token");
    localStorage.removeItem("transitops_user");
    setIsAuthenticated(false);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        user,
        loading,
        login,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;