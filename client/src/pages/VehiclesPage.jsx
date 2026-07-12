import { useEffect, useState } from "react";
import axiosClient from "../api/axiosClient";
import { Truck, AlertCircle, ShieldCheck, Plus, Search } from "lucide-react";

const VehiclesPage = () => {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        const response = await axiosClient.get("/vehicles");
        // Adjust based on your backend structure (e.g., response.data.data or response.data)
        setVehicles(response.data?.data || response.data || []);
      } catch (err) {
        console.error("Error fetching vehicles:", err);
        setError("Failed to load vehicle data from backend server.");
      } finally {
        setLoading(false);
      }
    };

    fetchVehicles();
  }, []);

  const filteredVehicles = vehicles.filter(vehicle => 
    vehicle.plateNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vehicle.model?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vehicle.type?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "50vh" }}>
        <h3>Loading transport registry...</h3>
      </div>
    );
  }

  return (
    <div style={{ padding: "0.5rem" }}>
      {/* Header Controls */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <h1 style={{ fontSize: "1.5rem", fontWeight: "bold", margin: "0 0 0.25rem 0" }}>Vehicle Registry</h1>
          <p style={{ color: "#64748B", margin: 0 }}>Monitor fleet inventory status, location tracking, and health status logs.</p>
        </div>
        <button style={{
          display: "flex",
          alignItems: "center",
          gap: "0.5rem",
          padding: "0.625rem 1rem",
          background: "#2563EB",
          color: "#FFFFFF",
          border: "none",
          borderRadius: "6px",
          fontWeight: "600",
          cursor: "pointer"
        }}>
          <Plus size={16} />
          <span>Add Vehicle</span>
        </button>
      </div>

      {/* Search Input Filter */}
      <div style={{ position: "relative", maxWidth: "400px", marginBottom: "1.5rem" }}>
        <span style={{ position: "absolute", left: "0.75rem", top: "50%", transform: "translateY(-50%)", color: "#94A3B8", display: "flex" }}>
          <Search size={18} />
        </span>
        <input 
          type="text"
          placeholder="Search by model, type, or plate number..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            width: "100%",
            padding: "0.5rem 0.75rem 0.5rem 2.5rem",
            borderRadius: "6px",
            border: "1px solid #CBD5E1",
            outline: "none",
            boxSizing: "border-box"
          }}
        />
      </div>

      {error && (
        <div style={{ background: "#FEE2E2", color: "#DC2626", padding: "1rem", borderRadius: "6px", marginBottom: "1.5rem" }}>
          {error}
        </div>
      )}

      {/* Data Grid Cards */}
      {filteredVehicles.length === 0 ? (
        <div style={{ textAlign: "center", padding: "3rem", background: "#FFFFFF", borderRadius: "8px", border: "1px solid #E2E8F0" }}>
          <Truck size={48} style={{ color: "#94A3B8", marginBottom: "1rem" }} />
          <p style={{ color: "#64748B", margin: 0 }}>No vehicles found in registry storage.</p>
        </div>
      ) : (
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
          gap: "1.5rem"
        }}>
          {filteredVehicles.map((vehicle) => (
            <div key={vehicle._id || vehicle.id} style={{
              background: "#FFFFFF",
              borderRadius: "8px",
              border: "1px solid #E2E8F0",
              padding: "1.25rem",
              boxShadow: "0 1px 3px rgba(0,0,0,0.05)"
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                  <div style={{ padding: "0.5rem", background: "#EFF6FF", color: "#2563EB", borderRadius: "6px" }}>
                    <Truck size={20} />
                  </div>
                  <div>
                    <h3 style={{ margin: 0, fontSize: "1.05rem", fontWeight: "600" }}>{vehicle.model || "Unknown Model"}</h3>
                    <span style={{ fontSize: "0.8rem", color: "#64748B" }}>{vehicle.type || "Fleet Asset"}</span>
                  </div>
                </div>
                <span style={{
                  fontSize: "0.75rem",
                  fontWeight: "600",
                  padding: "0.25rem 0.5rem",
                  borderRadius: "4px",
                  background: vehicle.status === "Active" ? "#DCFCE7" : "#FEF9C3",
                  color: vehicle.status === "Active" ? "#16A34A" : "#CA8A04"
                }}>
                  {vehicle.status || "In Maintenance"}
                </span>
              </div>

              <div style={{ borderTop: "1px solid #F1F5F9", paddingTop: "0.75rem", display: "flex", flexDirection: "column", gap: "0.5rem", fontSize: "0.875rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "#64748B" }}>Plate Number:</span>
                  <span style={{ fontWeight: "500", fontFamily: "monospace" }}>{vehicle.plateNumber || "N/A"}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "#64748B" }}>Capacity / Load:</span>
                  <span style={{ fontWeight: "500" }}>{vehicle.capacity || "N/A"} tons</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "#64748B" }}>Fuel Efficiency:</span>
                  <span style={{ fontWeight: "500" }}>{vehicle.fuelEfficiency || "N/A"} km/L</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default VehiclesPage;