import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState, createContext, useContext } from "react";
import AuthContext, { AuthProvider } from "./context/AuthContext";

// Layout Imports
import DashboardLayout from "./layouts/DashboardLayout";

// Operational View Components
import LoginPage from "./pages/LoginPage";
import OverviewDashboardPage from "./pages/OverviewDashboardPage";
import VehiclesPage from "./pages/VehiclesPage";
import DriversPage from "./pages/DriversPage";
import TripsPage from "./pages/TripsPage";
import FuelTrackerPage from "./pages/FuelTrackerPage";
import MaintenancePage from "./pages/MaintenancePage";

// Mock Fallback Page component for unmapped views
const MockPage = ({ title }) => (
  <div style={{ padding: "1rem" }}>
    <h2>{title} View</h2>
    <p style={{ color: "#64748B" }}>Operational tracking layout rendering shortly...</p>
  </div>
);

// Basic Route Guard for Protected Core Platform Views
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useContext(AuthContext);
  if (loading) return <div style={{ padding: "2rem", textAlign: "center" }}>Loading session...</div>;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return children;
};

// Basic Role Guard to simulate permission levels safely
const RoleRoute = ({ children, module }) => {
  return children;
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Authentication Path */}
          <Route path="/login" element={<LoginPage />} />

          {/* Core Shielded Platform Shell */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            {/* Automatic Dynamic Fallback Redirect */}
            <Route index element={<Navigate to="/dashboard" replace />} />

            {/* Role-Filtered Operation Views */}
            <Route path="dashboard" element={<OverviewDashboardPage />} />
            <Route path="vehicles" element={<VehiclesPage />} />
            <Route path="drivers" element={<DriversPage />} />
            <Route path="trips" element={<TripsPage />} />
            <Route path="maintenance" element={<MaintenancePage />} />
            <Route path="fuel" element={<FuelTrackerPage />} />
            <Route path="reports" element={<MockPage title="System Reports Index" />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;