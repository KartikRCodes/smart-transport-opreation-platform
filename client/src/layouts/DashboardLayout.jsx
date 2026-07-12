import { useContext, useState } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { 
  LayoutDashboard, 
  Truck, 
  Users, 
  Milestone, 
  Wrench, 
  Fuel, 
  BarChart3, 
  LogOut, 
  Menu, 
  X, 
  Moon, 
  Sun 
} from "lucide-react";

// Frontend visibility mapping to filter sidebar paths
const menuRegistry = [
  { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard, module: "dashboard" },
  { name: "Vehicles", path: "/vehicles", icon: Truck, module: "vehicles" },
  { name: "Drivers", path: "/drivers", icon: Users, module: "drivers" },
  { name: "Trips", path: "/trips", icon: Milestone, module: "trips" },
  { name: "Maintenance", path: "/maintenance", icon: Wrench, module: "maintenance" },
  { name: "Fuel Tracker", path: "/fuel", icon: Fuel, module: "fuel" },
  { name: "Reports", path: "/reports", icon: BarChart3, module: "reports" },
];

const permissions = {
  "Fleet Manager": ["dashboard", "vehicles", "drivers", "trips", "maintenance", "fuel", "reports"],
  "Driver": ["dashboard", "trips"],
  "Safety Officer": ["dashboard", "drivers", "maintenance"],
  "Financial Analyst": ["dashboard", "fuel", "reports"],
};

const DashboardLayout = () => {
  const { user, logout } = useContext(AuthContext);
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isDark, setIsDark] = useState(localStorage.getItem("transitops_theme") === "dark");

  const toggleTheme = () => {
    const nextTheme = !isDark;
    setIsDark(nextTheme);
    document.documentElement.setAttribute("data-theme", nextTheme ? "dark" : "light");
    localStorage.setItem("transitops_theme", nextTheme ? "dark" : "light");
  };

  const handleLogoutClick = () => {
    logout();
    navigate("/login");
  };

  // Filter paths explicitly by active user role rules
  const userRole = user?.role || "Driver";
  const visibleMenuItems = menuRegistry.filter(item => 
    permissions[userRole]?.includes(item.module)
  );

  return (
    <div className="app-container" style={{ display: "flex", minHeight: "100vh", background: "var(--bg)", color: "var(--text-primary)" }}>
      
      {/* Sidebar Navigation */}
      <aside className={`sidebar ${isMobileOpen ? "mobile-open" : ""}`} style={{
        width: "260px",
        background: "#0F172A",
        color: "#F8FAFC",
        display: "flex",
        flexDirection: "column",
        justifyContent: "between",
        transition: "all 0.2s ease",
        zIndex: 50
      }}>
        <div>
          {/* Header Branding */}
          <div style={{ padding: "1.5rem", borderBottom: "1px solid #334155", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h1 style={{ fontSize: "1.25rem", fontWeight: "bold", margin: 0, tracking: "wider" }}>TransitOps</h1>
            <button className="mobile-close-btn" onClick={() => setIsMobileOpen(false)} style={{ display: "none", background: "none", border: "none", color: "#F8FAFC" }}>
              <X size={20} />
            </button>
          </div>

          {/* Nav Item List */}
          <nav style={{ padding: "1rem 0.5rem" }}>
            {visibleMenuItems.map((item) => {
              const IconComponent = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link 
                  key={item.path} 
                  to={item.path}
                  onClick={() => setIsMobileOpen(false)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.75rem",
                    padding: "0.75rem 1rem",
                    marginBottom: "0.25rem",
                    borderRadius: "6px",
                    color: isActive ? "#FFFFFF" : "#94A3B8",
                    background: isActive ? "#2563EB" : "transparent",
                    textDecoration: "none",
                    fontWeight: "500",
                    transition: "background 0.15s"
                  }}
                >
                  <IconComponent size={18} />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* User Footbar */}
        <div style={{ padding: "1rem", borderTop: "1px solid #334155", background: "#1E293B" }}>
          <div style={{ marginBottom: "0.75rem" }}>
            <div style={{ fontWeight: "6xl", fontSize: "0.9rem", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{user?.name || "Operator"}</div>
            <div style={{ fontSize: "0.75rem", color: "#94A3B8" }}>{userRole}</div>
          </div>
          <button 
            onClick={handleLogoutClick}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              width: "100%",
              padding: "0.5rem",
              borderRadius: "4px",
              background: "#DC2626",
              color: "#FFFFFF",
              border: "none",
              cursor: "pointer",
              fontWeight: "500"
            }}
          >
            <LogOut size={14} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main View Display Space */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        {/* Top Operational Bar */}
        <header style={{
          height: "60px",
          background: "var(--surface)",
          borderBottom: "1px solid var(--border)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 1.5rem"
        }}>
          <button 
            onClick={() => setIsMobileOpen(!isMobileOpen)}
            style={{ background: "none", border: "none", color: "currentColor", cursor: "pointer", padding: "0.25rem" }}
            className="mobile-menu-toggle"
          >
            <Menu size={24} />
          </button>

          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            <button 
              onClick={toggleTheme}
              style={{ background: "none", border: "none", color: "currentColor", cursor: "pointer", display: "flex", alignItems: "center" }}
              title="Toggle Display Theme"
            >
              {isDark ? <Sun size={20} /> : <Moon size={20} />}
            </button>
          </div>
        </header>

        {/* Page Inner Content Container */}
        <main style={{ flex: 1, padding: "1.5rem", overflowY: "auto" }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;