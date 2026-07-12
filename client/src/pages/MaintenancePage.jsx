import { useEffect, useState } from "react";
import axiosClient from "../api/axiosClient";
import { Wrench, Calendar, Plus, Search, DollarSign } from "lucide-react";

const MaintenancePage = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchMaintenanceLogs = async () => {
      try {
        const response = await axiosClient.get("/maintenance");
        setLogs(response.data?.data || response.data || []);
      } catch (err) {
        console.error("Using fallback metrics for maintenance manager view.");
        setLogs([
          { id: "M-301", vehicleModel: "Tata Prima 4028.S", serviceType: "Engine Diagnostics & Tune-up", date: "15-07-2026", cost: 18500, priority: "High", status: "Scheduled" },
          { id: "M-302", vehicleModel: "Mahindra Blazo X", serviceType: "Brake Pad Replacement & Bleeding", date: "13-07-2026", cost: 8400, priority: "Critical", status: "In Progress" },
          { id: "M-303", vehicleModel: "BharatBenz 2823C", serviceType: "Routine Oil Fluid & Filter Change", date: "10-07-2026", cost: 4200, priority: "Low", status: "Completed" }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchMaintenanceLogs();
  }, []);

  const filteredLogs = logs.filter(log =>
    log.vehicleModel?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.serviceType?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "50vh" }}>
        <h3>Loading maintenance planner logs...</h3>
      </div>
    );
  }

  return (
    <div style={{ padding: "0.5rem" }}>
      {/* Header section control bars */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <h1 style={{ fontSize: "1.5rem", fontWeight: "bold", margin: "0 0 0.25rem 0" }}>Maintenance Schedule Manager</h1>
          <p style={{ color: "#64748B", margin: 0 }}>Log preventative overhauls, mechanical logs, and diagnostic expense structures.</p>
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
          <span>Book Service Slot</span>
        </button>
      </div>

      {/* Filtering input bar */}
      <div style={{ position: "relative", maxWidth: "400px", marginBottom: "1.5rem" }}>
        <span style={{ position: "absolute", left: "0.75rem", top: "50%", transform: "translateY(-50%)", color: "#94A3B8", display: "flex" }}>
          <Search size={18} />
        </span>
        <input 
          type="text"
          placeholder="Search by asset model or service item..."
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

      {/* Maintenance Grid List Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "1.5rem" }}>
        {filteredLogs.map((log) => (
          <div key={log.id} style={{
            background: "#FFFFFF",
            borderRadius: "8px",
            border: "1px solid #E2E8F0",
            padding: "1.25rem",
            boxShadow: "0 1px 3px rgba(0,0,0,0.05)"
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                <div style={{ padding: "0.5rem", background: "#F1F5F9", color: "#475569", borderRadius: "6px" }}>
                  <Wrench size={20} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: "1.05rem", fontWeight: "600" }}>{log.vehicleModel}</h3>
                  <span style={{ fontSize: "0.8rem", color: log.priority === "Critical" ? "#EF4444" : log.priority === "High" ? "#F59E0B" : "#10B981", fontWeight: "600" }}>
                    {log.priority} Priority Asset
                  </span>
                </div>
              </div>
              <span style={{
                fontSize: "0.75rem",
                fontWeight: "600",
                padding: "0.25rem 0.5rem",
                borderRadius: "4px",
                background: log.status === "Completed" ? "#DCFCE7" : log.status === "In Progress" ? "#FEF9C3" : "#EFF6FF",
                color: log.status === "Completed" ? "#16A34A" : log.status === "In Progress" ? "#CA8A04" : "#2563EB"
              }}>
                {log.status}
              </span>
            </div>

            <div style={{ borderTop: "1px solid #F1F5F9", paddingTop: "0.75rem", display: "flex", flexDirection: "column", gap: "0.5rem", fontSize: "0.875rem" }}>
              <div style={{ display: "flex", alignItems: "flex-start", gap: "0.25rem", color: "#0F172A", fontWeight: "500", marginBottom: "0.25rem" }}>
                <span style={{ color: "#64748B" }}>Job:</span> {log.serviceType}
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "#64748B", display: "flex", alignItems: "center", gap: "0.25rem" }}><Calendar size={14} /> Scheduled Target:</span>
                <span style={{ fontWeight: "500" }}>{log.date}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "#64748B", display: "flex", alignItems: "center", gap: "0.25rem" }}><DollarSign size={14} /> Estimated Expense:</span>
                <span style={{ fontWeight: "600", color: "#0F172A" }}>₹{log.cost.toLocaleString("en-IN")}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MaintenancePage;