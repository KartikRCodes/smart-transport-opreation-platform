import { useEffect, useState } from "react";
import axiosClient from "../api/axiosClient";
import { Route, MapPin, Calendar, Clock, Plus, Search } from "lucide-react";

const TripsPage = () => {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchTrips = async () => {
      try {
        const response = await axiosClient.get("/trips");
        setTrips(response.data?.data || response.data || []);
      } catch (err) {
        console.error("Using fallback mock data for trips registry view.");
        // Mock data to match schema structures for live demo purposes
        setTrips([
          { id: "T-101", routeName: "Ahmedabad Hub ➔ Mumbai Port", driverName: "Rajesh Kumar", vehicleModel: "Tata Prima 4028.S", status: "In Transit", departure: "12-07-2026 06:00 AM" },
          { id: "T-102", routeName: "Surat Logistics Center ➔ Delhi NCR", driverName: "Amit Patel", vehicleModel: "Mahindra Blazo X", status: "Delayed", departure: "11-07-2026 10:30 PM" },
          { id: "T-103", routeName: "Pune Industrial Zone ➔ Goa Hub", driverName: "Vikram Singh", vehicleModel: "BharatBenz 2823C", status: "Completed", departure: "12-07-2026 01:15 AM" }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchTrips();
  }, []);

  const filteredTrips = trips.filter(trip =>
    trip.routeName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    trip.driverName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    trip.id?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "50vh" }}>
        <h3>Loading dispatcher registry...</h3>
      </div>
    );
  }

  return (
    <div style={{ padding: "0.5rem" }}>
      {/* Header section */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <h1 style={{ fontSize: "1.5rem", fontWeight: "bold", margin: "0 0 0.25rem 0" }}>Trips & Dispatches</h1>
          <p style={{ color: "#64748B", margin: 0 }}>Create, monitor, and manage cargo routing paths and delivery manifests.</p>
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
          <span>Dispatch New Trip</span>
        </button>
      </div>

      {/* Filter search item */}
      <div style={{ position: "relative", maxWidth: "400px", marginBottom: "1.5rem" }}>
        <span style={{ position: "absolute", left: "0.75rem", top: "50%", transform: "translateY(-50%)", color: "#94A3B8", display: "flex" }}>
          <Search size={18} />
        </span>
        <input 
          type="text"
          placeholder="Search by route info, driver, or Trip ID..."
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

      {/* Structured data table sheet */}
      <div style={{ background: "#FFFFFF", border: "1px solid #E2E8F0", borderRadius: "8px", overflowX: "auto", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "0.875rem" }}>
          <thead>
            <tr style={{ background: "#F8FAFC", borderBottom: "1px solid #E2E8F0", color: "#475569" }}>
              <th style={{ padding: "1rem" }}>Trip ID</th>
              <th style={{ padding: "1rem" }}>Route Manifest</th>
              <th style={{ padding: "1rem" }}>Assigned Assets</th>
              <th style={{ padding: "1rem" }}>Departure Schedule</th>
              <th style={{ padding: "1rem" }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredTrips.map((trip) => (
              <tr key={trip.id} style={{ borderBottom: "1px solid #F1F5F9", color: "#0F172A" }}>
                <td style={{ padding: "1rem", fontWeight: "600", fontFamily: "monospace", color: "#2563EB" }}>{trip.id}</td>
                <td style={{ padding: "1rem" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontWeight: "500" }}>
                    <MapPin size={16} style={{ color: "#64748B" }} />
                    {trip.routeName}
                  </div>
                </td>
                <td style={{ padding: "1rem" }}>
                  <div style={{ fontWeight: "500" }}>{trip.driverName}</div>
                  <div style={{ fontSize: "0.75rem", color: "#64748B" }}>{trip.vehicleModel}</div>
                </td>
                <td style={{ padding: "1rem", color: "#475569" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
                    <Clock size={14} /> {trip.departure}
                  </div>
                </td>
                <td style={{ padding: "1rem" }}>
                  <span style={{
                    fontSize: "0.75rem",
                    fontWeight: "600",
                    padding: "0.25rem 0.5rem",
                    borderRadius: "4px",
                    background: trip.status === "Completed" ? "#DCFCE7" : trip.status === "In Transit" ? "#EFF6FF" : "#FEE2E2",
                    color: trip.status === "Completed" ? "#16A34A" : trip.status === "In Transit" ? "#2563EB" : "#DC2626"
                  }}>
                    {trip.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TripsPage;