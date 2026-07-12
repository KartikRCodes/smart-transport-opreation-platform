import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./routes/ProtectedRoute";
import RoleRoute from "./routes/RoleRoute";
import DashboardLayout from "./layouts/DashboardLayout";
import LoginPage from "./pages/LoginPage";
import VehiclesPage from "./pages/VehiclesPage";
import DriversPage from "./pages/DriversPage";

// Temporary UI view placeholders for the hackathon workflow pages
const MockPage = ({ title }) => (
  <div style={{ background: "var(--surface)", padding: "1.5rem", borderRadius: "8px", border: "1px solid var(--border)" }}>
    <h2 style={{ margin: 0 }}>{title} View</h2>
    <p style={{ color: "var(--text-secondary)" }}>Live dynamic database components integrating shortly...</p>
  </div>
);

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
            <Route path="dashboard" element={<MockPage title="Operational Analytics Dashboard" />} />
            
            <Route path="vehicles" element={
              <RoleRoute module="vehicles">
              <VehiclesPage />
              </RoleRoute>
            } />
            
            <Route path="drivers" element={
              <RoleRoute module="drivers">
                <DriversPage />
              </RoleRoute>
            } />
            
            <Route path="trips" element={
              <RoleRoute module="trips">
                <MockPage title="Trip Dispatch Hub" />
              </RoleRoute>
            } />
            
            <Route path="maintenance" element={
              <RoleRoute module="maintenance">
                <MockPage title="Maintenance Logs" />
              </RoleRoute>
            } />
            
            <Route path="fuel" element={
              <RoleRoute module="fuel">
                <MockPage title="Fuel Consumption Tracker" />
              </RoleRoute>
            } />
            
            <Route path="reports" element={
              <RoleRoute module="reports">
                <MockPage title="Platform ROI Reports" />
              </RoleRoute>
            } />
          </Route>

          {/* Missing Paths Catch-all */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;