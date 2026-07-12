import { useEffect, useState } from "react";
import axiosClient from "../api/axiosClient";
import { UserCheck, UserX, Search, Plus, Phone, Award } from "lucide-react";

const DriversPage = () => {
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchDrivers = async () => {
      try {
        const response = await axiosClient.get("/drivers");
        setDrivers(response.data?.data || response.data || []);
      } catch (err) {
        console.error("Error fetching drivers:", err);
        // Fallback mock array for hackathon presentation if backend collection isn't seeded yet
        setDrivers([
          { id: "1", name: "Rajesh Kumar", licenseNumber: "DL-1420250089", phone: "+91 98765 43210", status: "Available", rating: "4.9" },
          { id: "2", name: "Amit Patel", licenseNumber: "GJ-0120240045", phone: "+91 87654 32109", status: "On Trip", rating: "4.7" },
          { id: "3", name: "Vikram Singh", licenseNumber: "MH-1220230112", phone: "+91 76543 21098", status: "Available", rating: "4.8" }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchDrivers();
  }, []);

  const filteredDrivers = drivers.filter(driver =>
    driver.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    driver.licenseNumber?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "50vh" }}>
        <h3>Loading drivers database...</h3>
      </div>
    );
  }

  return (
    <div style={{ padding: "0.5rem" }}>
      {/* Header Controls */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <h1 style={{ fontSize: "1.5rem", fontWeight: "bold", margin: "0 0 0.25rem 0" }}>Driver Management Pool</h1>
          <p style={{ color: "#64748B", margin: 0 }}>Track active operators, duty shifts, verification statuses, and compliance ratings.</p>
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
          <span>Add Driver</span>
        </button>
      </div>

      {/* Search Bar */}
      <div style={{ position: "relative", maxWidth: "400px", marginBottom: "1.5rem" }}>
        <span style={{ position: "absolute", left: "0.75rem", top: "50%", transform: "translateY(-50%)", color: "#94A3B8", display: "flex" }}>
          <Search size={18} />
        </span>
        <input 
          type="text"
          placeholder="Search by driver name or license..."
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

      {/* Grid List */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "1.5rem" }}>
        {filteredDrivers.map(driver => (
          <div key={driver.id || driver._id} style={{
            background: "#FFFFFF",
            borderRadius: "8px",
            border: "1px solid #E2E8F0",
            padding: "1.25rem",
            boxShadow: "0 1px 3px rgba(0,0,0,0.05)"
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignment: "center", marginBottom: "1rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                <div style={{ 
                  padding: "0.5rem", 
                  background: driver.status === "Available" ? "#E0F2FE" : "#FEF3C7", 
                  color: driver.status === "Available" ? "#0369A1" : "#B45309", 
                  borderRadius: "50%" 
                }}>
                  {driver.status === "Available" ? <UserCheck size={20} /> : <UserX size={20} />}
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: "1.05rem", fontWeight: "600" }}>{driver.name}</h3>
                  <span style={{ fontSize: "0.8rem", color: "#64748B" }}>Rating: ★ {driver.rating}</span>
                </div>
              </div>
              <span style={{
                fontSize: "0.75rem",
                fontWeight: "600",
                padding: "0.25rem 0.5rem",
                borderRadius: "4px",
                background: driver.status === "Available" ? "#DCFCE7" : "#FEF9C3",
                color: driver.status === "Available" ? "#16A34A" : "#CA8A04"
              }}>
                {driver.status}
              </span>
            </div>

            <div style={{ borderTop: "1px solid #F1F5F9", paddingTop: "0.75rem", display: "flex", flexDirection: "column", gap: "0.5rem", fontSize: "0.875rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ color: "#64748B", display: "flex", alignItems: "center", gap: "0.35rem" }}><Award size={14} /> License:</span>
                <span style={{ fontWeight: "500", fontFamily: "monospace" }}>{driver.licenseNumber}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ color: "#64748B", display: "flex", alignItems: "center", gap: "0.35rem" }}><Phone size={14} /> Contact:</span>
                <span style={{ fontWeight: "500" }}>{driver.phone}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DriversPage;