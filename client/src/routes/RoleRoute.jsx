import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

const permissions = {
  "Fleet Manager": ["dashboard", "vehicles", "drivers", "trips", "maintenance", "fuel", "reports"],
  "Driver": ["dashboard", "trips"],
  "Safety Officer": ["dashboard", "drivers", "maintenance"],
  "Financial Analyst": ["dashboard", "fuel", "reports"],
};

const RoleRoute = ({ children, module }) => {
  const { user, isLoading } = useContext(AuthContext);

  if (isLoading) return null;

  const userRole = user?.role;
  const hasPermission = userRole && permissions[userRole]?.includes(module);

  if (!hasPermission) {
    return (
      <div style={{ padding: "2rem", textAlign: "center" }}>
        <h2 style={{ color: "#DC2626" }}>403 - Access Denied</h2>
        <p>Your role ({userRole || "Unknown"}) does not have permission to view this section.</p>
      </div>
    );
  }

  return children;
};

export default RoleRoute;