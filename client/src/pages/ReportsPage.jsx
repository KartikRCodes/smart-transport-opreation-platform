import { useEffect, useState } from "react";
import axiosClient from "../api/axiosClient";
import { FileText, Download, BarChart2, PieChart, TrendingUp, CheckCircle } from "lucide-react";

const ReportsPage = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const response = await axiosClient.get("/reports");
        setReports(response.data?.data || response.data || []);
      } catch (err) {
        console.error("Using fallback metrics for financial reporting dashboard.");
        setReports([
          { id: "REP-2026-01", name: "Q2 Fleet Fuel Efficiency Audits", type: "Analytical", status: "Generated", date: "12-07-2026", size: "2.4 MB" },
          { id: "REP-2026-02", name: "Driver Safety Metric Compliance Logs", type: "Operational", status: "Generated", date: "10-07-2026", size: "1.8 MB" },
          { id: "REP-2026-03", name: "Asset Maintenance Cost Projection Plan", type: "Financial", status: "Generated", date: "08-07-2026", size: "4.1 MB" }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, []);

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "50vh" }}>
        <h3>Compiling analytical charts...</h3>
      </div>
    );
  }

  return (
    <div style={{ padding: "0.5rem" }}>
      {/* Header section control bars */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <h1 style={{ fontSize: "1.5rem", fontWeight: "bold", margin: "0 0 0.25rem 0" }}>Performance & ROI Intelligence</h1>
          <p style={{ color: "#64748B", margin: 0 }}>Download operational datasets, financial overhead breakdowns, and efficiency statements.</p>
        </div>
      </div>

      {/* Visual Summary Insights Panel */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "1.5rem", marginBottom: "2.5rem" }}>
        <div style={{ background: "#FFFFFF", border: "1px solid #E2E8F0", borderRadius: "8px", padding: "1.5rem" }}>
          <h3 style={{ fontSize: "1rem", fontWeight: "600", margin: "0 0 1rem 0", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <TrendingUp size={18} style={{ color: "#2563EB" }} /> Estimated Operational Cost Savings
          </h3>
          <div style={{ display: "flex", alignItems: "baseline", gap: "0.5rem" }}>
            <h2 style={{ fontSize: "2rem", fontWeight: "bold", margin: 0, color: "#16A34A" }}>₹42,500</h2>
            <span style={{ fontSize: "0.85rem", color: "#16A34A", fontWeight: "500" }}>+12.4% vs last month</span>
          </div>
          <p style={{ fontSize: "0.85rem", color: "#64748B", marginTop: "0.5rem", marginBottom: 0 }}>Reduced fuel idle waste and smart path matching saved substantial fleet expenses.</p>
        </div>

        <div style={{ background: "#FFFFFF", border: "1px solid #E2E8F0", borderRadius: "8px", padding: "1.5rem" }}>
          <h3 style={{ fontSize: "1rem", fontWeight: "600", margin: "0 0 1rem 0", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <BarChart2 size={18} style={{ color: "#8B5CF6" }} /> Performance Milestones
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", fontSize: "0.875rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "#64748B" }}>On-Time Cargo Delivery Rate:</span>
              <span style={{ fontWeight: "600", color: "#0F172A" }}>98.2%</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "#64748B" }}>Asset Safety Compliance Rating:</span>
              <span style={{ fontWeight: "600", color: "#0F172A" }}>4.85 / 5.0</span>
            </div>
          </div>
        </div>
      </div>

      {/* Ledger Table Section */}
      <h3 style={{ fontSize: "1.1rem", fontWeight: "600", marginBottom: "1rem" }}>Generated System Statements</h3>
      <div style={{ background: "#FFFFFF", border: "1px solid #E2E8F0", borderRadius: "8px", overflowX: "auto", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "0.875rem" }}>
          <thead>
            <tr style={{ background: "#F8FAFC", borderBottom: "1px solid #E2E8F0", color: "#475569" }}>
              <th style={{ padding: "1rem" }}>Report Token</th>
              <th style={{ padding: "1rem" }}>Document Label</th>
              <th style={{ padding: "1rem" }}>Classification</th>
              <th style={{ padding: "1rem" }}>Compiled Date</th>
              <th style={{ padding: "1rem", textAlign: "right" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {reports.map((report) => (
              <tr key={report.id} style={{ borderBottom: "1px solid #F1F5F9", color: "#0F172A" }}>
                <td style={{ padding: "1rem", fontWeight: "600", fontFamily: "monospace", color: "#64748B" }}>{report.id}</td>
                <td style={{ padding: "1rem" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontWeight: "500" }}>
                    <FileText size={16} style={{ color: "#2563EB" }} />
                    {report.name}
                  </div>
                </td>
                <td style={{ padding: "1rem" }}>
                  <span style={{
                    fontSize: "0.75rem",
                    fontWeight: "500",
                    padding: "0.2rem 0.4rem",
                    borderRadius: "4px",
                    background: report.type === "Financial" ? "#E0F2FE" : report.type === "Analytical" ? "#F5F3FF" : "#F1F5F9",
                    color: report.type === "Financial" ? "#0369A1" : report.type === "Analytical" ? "#5B21B6" : "#475569"
                  }}>
                    {report.type}
                  </span>
                </td>
                <td style={{ padding: "1rem", color: "#475569" }}>{report.date} <span style={{ fontSize: "0.75rem", color: "#94A3B8" }}>({report.size})</span></td>
                <td style={{ padding: "1rem", textAlign: "right" }}>
                  <button style={{
                    background: "none",
                    border: "none",
                    color: "#2563EB",
                    cursor: "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.25rem",
                    fontWeight: "600",
                    fontSize: "0.85rem"
                  }}>
                    <Download size={14} /> Download
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ReportsPage;