import { useEffect, useState } from "react";
import axiosClient from "../api/axiosClient";
import { Fuel, DollarSign, Droplet, Plus, Search, Calendar } from "lucide-react";

const FuelTrackerPage = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchFuelLogs = async () => {
      try {
        const response = await axiosClient.get("/fuel");
        setLogs(response.data?.data || response.data || []);
      } catch (err) {
        console.error("Using fallback mock data for fuel logs.");
        setLogs([
          { id: "F-901", vehicleModel: "Tata Prima 4028.S", date: "12-07-2026", liters: 120, cost: 11400, location: "Ahmedabad Highway Pump" },
          { id: "F-902", vehicleModel: "Mahindra Blazo X", date: "11-07-2026", liters: 95, cost: 9025, location: "Surat Logistics Station" },
          { id: "F-903", vehicleModel: "BharatBenz 2823C", date: "10-07-2026", liters: 140, cost: 13300, location: "Mumbai Depot Fueler" }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchFuelLogs();
  }, []);

  const filteredLogs = logs.filter(log =>
    log.vehicleModel?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.location?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "50vh" }}>
        <h3>Loading fuel metrics logs...</h3>
      </div>
    );
  }

  return (
    <div style={{ padding: "0.5rem" }}>
      {/* Header section */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <h1 style={{ fontSize: "1.5rem", fontWeight: "bold", margin: "0 0 0.25rem 0" }}>Fuel Consumption Tracker</h1>
          <p style={{ color: "#64748B", margin: 0 }}>Log refueling entries, track transaction costs, and evaluate fleet efficiency.</p>
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
          <span>Log Refueling</span>
        </button>
      </div>

      {/* Filter search */}
      <div style={{ position: "relative", maxWidth: "400px", marginBottom: "1.5rem" }}>
        <span style={{ position: "absolute", left: "0.75rem", top: "50%", transform: "translateY(-50%)", color: "#94A3B8", display: "flex" }}>
          <Search size={18} />
        </span>
        <input 
          type="text"
          placeholder="Search logs by vehicle model or location..."
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

      {/* Log Data Grid Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "1.5rem" }}>
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
                <div style={{ padding: "0.5rem", background: "#FEF3C7", color: "#D97706", borderRadius: "6px" }}>
                  <Fuel size={20} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: "1.05rem", fontWeight: "600" }}>{log.vehicleModel}</h3>
                  <span style={{ fontSize: "0.8rem", color: "#64748B", display: "flex", alignItems: "center", gap: "0.25rem", marginTop: "0.15rem" }}>
                    <Calendar size={12} /> {log.date}
                  </span>
                </div>
              </div>
              <span style={{ fontSize: "0.75rem", fontWeight: "600", fontFamily: "monospace", color: "#64748B" }}>{log.id}</span>
            </div>

            <div style={{ borderTop: "1px solid #F1F5F9", paddingTop: "0.75rem", display: "flex", flexDirection: "column", gap: "0.5rem", fontSize: "0.875rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "#64748B", display: "flex", alignItems: "center", gap: "0.25rem" }}><Droplet size={14} /> Refueled Volume:</span>
                <span style={{ fontWeight: "600", color: "#0F172A" }}>{log.liters} Liters</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "#64748B", display: "flex", alignItems: "center", gap: "0.25rem" }}><DollarSign size={14} /> Total Cost Charged:</span>
                <span style={{ fontWeight: "600", color: "#16A34A" }}>₹{log.cost.toLocaleString("en-IN")}</span>
              </div>
              <div style={{ borderTop: "1px solid #F8FAFC", marginTop: "0.25rem", paddingTop: "0.5rem", fontSize: "0.8rem", color: "#64748B", italic: "true" }}>
                Location: {log.location}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FuelTrackerPage;