import { useEffect, useMemo, useState } from "react";
import axiosClient from "../api/axiosClient";
import {
  BarChart2,
  TrendingUp,
  Truck,
  Fuel,
  IndianRupee,
  Route,
  Wrench,
  Search,
  Download,
  AlertCircle,
} from "lucide-react";

const ReportsPage = () => {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  // ============================================
  // FETCH VEHICLE PERFORMANCE REPORT
  // ============================================

  useEffect(() => {
    const fetchReports = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await axiosClient.get(
          "/reports/vehicle-performance"
        );

        const vehicleData = response.data?.data?.vehicles;

        if (!Array.isArray(vehicleData)) {
          throw new Error("Invalid report response from server");
        }

        setVehicles(vehicleData);
      } catch (err) {
        console.error("Error fetching performance reports:", err);

        setError(
          err.response?.data?.message ||
            err.message ||
            "Failed to load vehicle performance reports."
        );

        setVehicles([]);
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, []);

  // ============================================
  // HELPERS
  // ============================================

  const toNumber = (value) => {
    const number = Number(value);
    return Number.isFinite(number) ? number : 0;
  };

  const formatCurrency = (value) => {
    return `₹${toNumber(value).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const formatNumber = (value, decimals = 2) => {
    return toNumber(value).toLocaleString("en-IN", {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });
  };

  // ============================================
  // SUMMARY METRICS
  // ============================================

  const summary = useMemo(() => {
    return vehicles.reduce(
      (totals, vehicle) => {
        totals.totalRevenue += toNumber(vehicle.total_revenue);

        totals.totalOperationalCost += toNumber(
          vehicle.total_operational_cost
        );

        totals.totalFuelCost += toNumber(vehicle.total_fuel_cost);

        totals.totalMaintenanceCost += toNumber(
          vehicle.total_maintenance_cost
        );

        totals.completedTrips += toNumber(vehicle.completed_trips);

        totals.totalDistance += toNumber(vehicle.total_distance);

        return totals;
      },
      {
        totalRevenue: 0,
        totalOperationalCost: 0,
        totalFuelCost: 0,
        totalMaintenanceCost: 0,
        completedTrips: 0,
        totalDistance: 0,
      }
    );
  }, [vehicles]);

  const netOperationalProfit =
    summary.totalRevenue - summary.totalOperationalCost;

  const profitableVehicles = vehicles.filter(
    (vehicle) => toNumber(vehicle.roi_percentage) > 0
  ).length;

  const averageROI =
    vehicles.length > 0
      ? vehicles.reduce(
          (total, vehicle) =>
            total + toNumber(vehicle.roi_percentage),
          0
        ) / vehicles.length
      : 0;

  // ============================================
  // SEARCH
  // ============================================

  const filteredVehicles = vehicles.filter((vehicle) => {
    const search = searchTerm.trim().toLowerCase();

    if (!search) {
      return true;
    }

    return (
      vehicle.vehicle_name?.toLowerCase().includes(search) ||
      vehicle.registration_number?.toLowerCase().includes(search) ||
      vehicle.type?.toLowerCase().includes(search) ||
      vehicle.region?.toLowerCase().includes(search) ||
      vehicle.status?.toLowerCase().includes(search)
    );
  });

  // ============================================
  // CSV EXPORT
  // ============================================

  const downloadCSV = () => {
    if (vehicles.length === 0) {
      return;
    }

    const headers = [
      "Vehicle ID",
      "Registration Number",
      "Vehicle Name",
      "Type",
      "Region",
      "Status",
      "Acquisition Cost",
      "Completed Trips",
      "Total Distance (km)",
      "Total Revenue",
      "Fuel Consumed (L)",
      "Fuel Cost",
      "Maintenance Cost",
      "Operational Cost",
      "Fuel Efficiency (km/L)",
      "ROI Percentage",
    ];

    const rows = vehicles.map((vehicle) => [
      vehicle.vehicle_id,
      vehicle.registration_number,
      vehicle.vehicle_name,
      vehicle.type,
      vehicle.region || "",
      vehicle.status,
      vehicle.acquisition_cost,
      vehicle.completed_trips,
      vehicle.total_distance,
      vehicle.total_revenue,
      vehicle.total_fuel_consumed,
      vehicle.total_fuel_cost,
      vehicle.total_maintenance_cost,
      vehicle.total_operational_cost,
      vehicle.fuel_efficiency,
      vehicle.roi_percentage,
    ]);

    const escapeCSVValue = (value) => {
      const stringValue = String(value ?? "");
      return `"${stringValue.replace(/"/g, '""')}"`;
    };

    const csvContent = [
      headers.map(escapeCSVValue).join(","),
      ...rows.map((row) =>
        row.map(escapeCSVValue).join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = `vehicle-performance-report-${
      new Date().toISOString().split("T")[0]
    }.csv`;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  };

  // ============================================
  // STATUS STYLE
  // ============================================

  const getStatusStyle = (status) => {
    switch (status) {
      case "Available":
        return {
          background: "#DCFCE7",
          color: "#16A34A",
        };

      case "On Trip":
        return {
          background: "#DBEAFE",
          color: "#2563EB",
        };

      case "In Shop":
        return {
          background: "#FEF3C7",
          color: "#D97706",
        };

      case "Retired":
        return {
          background: "#F1F5F9",
          color: "#64748B",
        };

      default:
        return {
          background: "#F1F5F9",
          color: "#475569",
        };
    }
  };

  // ============================================
  // LOADING
  // ============================================

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "50vh",
        }}
      >
        <h3>Compiling vehicle performance analytics...</h3>
      </div>
    );
  }

  return (
    <div style={{ padding: "0.5rem" }}>
      {/* HEADER */}

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "2rem",
          flexWrap: "wrap",
          gap: "1rem",
        }}
      >
        <div>
          <h1
            style={{
              fontSize: "1.5rem",
              fontWeight: "bold",
              margin: "0 0 0.25rem 0",
            }}
          >
            Performance & ROI Intelligence
          </h1>

          <p style={{ color: "#64748B", margin: 0 }}>
            Real vehicle performance, operational costs, fuel
            efficiency, revenue, and ROI analytics.
          </p>
        </div>

        <button
          type="button"
          onClick={downloadCSV}
          disabled={vehicles.length === 0}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            padding: "0.625rem 1rem",
            background:
              vehicles.length === 0 ? "#94A3B8" : "#2563EB",
            color: "#FFFFFF",
            border: "none",
            borderRadius: "6px",
            fontWeight: "600",
            cursor:
              vehicles.length === 0 ? "not-allowed" : "pointer",
          }}
        >
          <Download size={16} />
          Export CSV
        </button>
      </div>

      {/* ERROR */}

      {error && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            background: "#FEE2E2",
            border: "1px solid #FCA5A5",
            color: "#DC2626",
            padding: "0.875rem 1rem",
            borderRadius: "6px",
            marginBottom: "1.5rem",
          }}
        >
          <AlertCircle size={18} />
          {error}
        </div>
      )}

      {/* KPI SUMMARY */}

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "1.25rem",
          marginBottom: "2rem",
        }}
      >
        <SummaryCard
          title="Total Revenue"
          value={formatCurrency(summary.totalRevenue)}
          subtitle={`${summary.completedTrips} completed trips`}
          icon={<IndianRupee size={22} />}
          iconColor="#16A34A"
          iconBackground="#DCFCE7"
        />

        <SummaryCard
          title="Operational Cost"
          value={formatCurrency(summary.totalOperationalCost)}
          subtitle="Fuel + maintenance expenses"
          icon={<BarChart2 size={22} />}
          iconColor="#DC2626"
          iconBackground="#FEE2E2"
        />

        <SummaryCard
          title="Net Operational Profit"
          value={formatCurrency(netOperationalProfit)}
          subtitle="Revenue minus operational cost"
          icon={<TrendingUp size={22} />}
          iconColor={
            netOperationalProfit >= 0 ? "#16A34A" : "#DC2626"
          }
          iconBackground={
            netOperationalProfit >= 0 ? "#DCFCE7" : "#FEE2E2"
          }
        />

        <SummaryCard
          title="Average Vehicle ROI"
          value={`${formatNumber(averageROI)}%`}
          subtitle={`${profitableVehicles} profitable vehicle${
            profitableVehicles === 1 ? "" : "s"
          }`}
          icon={<Truck size={22} />}
          iconColor="#2563EB"
          iconBackground="#DBEAFE"
        />
      </div>

      {/* COST BREAKDOWN */}

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit, minmax(280px, 1fr))",
          gap: "1.5rem",
          marginBottom: "2rem",
        }}
      >
        <InsightCard
          title="Fuel Expenditure"
          value={formatCurrency(summary.totalFuelCost)}
          subtitle="Total fuel cost recorded across the fleet."
          icon={<Fuel size={20} />}
          color="#D97706"
        />

        <InsightCard
          title="Maintenance Expenditure"
          value={formatCurrency(summary.totalMaintenanceCost)}
          subtitle="Total maintenance cost recorded across the fleet."
          icon={<Wrench size={20} />}
          color="#8B5CF6"
        />

        <InsightCard
          title="Completed Distance"
          value={`${formatNumber(summary.totalDistance)} km`}
          subtitle={`${summary.completedTrips} completed fleet trips.`}
          icon={<Route size={20} />}
          color="#2563EB"
        />
      </div>

      {/* SEARCH */}

      <div
        style={{
          position: "relative",
          maxWidth: "440px",
          marginBottom: "1.5rem",
        }}
      >
        <span
          style={{
            position: "absolute",
            left: "0.75rem",
            top: "50%",
            transform: "translateY(-50%)",
            color: "#94A3B8",
            display: "flex",
          }}
        >
          <Search size={18} />
        </span>

        <input
          type="text"
          placeholder="Search by vehicle, registration, type, region, or status..."
          value={searchTerm}
          onChange={(event) =>
            setSearchTerm(event.target.value)
          }
          style={{
            width: "100%",
            padding: "0.625rem 0.75rem 0.625rem 2.5rem",
            borderRadius: "6px",
            border: "1px solid #CBD5E1",
            outline: "none",
            boxSizing: "border-box",
          }}
        />
      </div>

      {/* PERFORMANCE TABLE */}

      <h3
        style={{
          fontSize: "1.1rem",
          fontWeight: "600",
          marginBottom: "1rem",
        }}
      >
        Vehicle Performance Ledger
      </h3>

      <div
        style={{
          background: "#FFFFFF",
          border: "1px solid #E2E8F0",
          borderRadius: "8px",
          overflowX: "auto",
          boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
        }}
      >
        {filteredVehicles.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              padding: "3rem",
              color: "#64748B",
            }}
          >
            <Truck
              size={42}
              style={{ marginBottom: "0.75rem" }}
            />

            <p style={{ margin: 0 }}>
              No vehicle performance records found.
            </p>
          </div>
        ) : (
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              textAlign: "left",
              fontSize: "0.875rem",
              minWidth: "1400px",
            }}
          >
            <thead>
              <tr
                style={{
                  background: "#F8FAFC",
                  borderBottom: "1px solid #E2E8F0",
                  color: "#475569",
                }}
              >
                <th style={tableHeaderStyle}>Vehicle</th>
                <th style={tableHeaderStyle}>Status</th>
                <th style={tableHeaderStyle}>Trips</th>
                <th style={tableHeaderStyle}>Distance</th>
                <th style={tableHeaderStyle}>Revenue</th>
                <th style={tableHeaderStyle}>Fuel</th>
                <th style={tableHeaderStyle}>Fuel Cost</th>
                <th style={tableHeaderStyle}>Maintenance</th>
                <th style={tableHeaderStyle}>Operational Cost</th>
                <th style={tableHeaderStyle}>Efficiency</th>
                <th style={tableHeaderStyle}>ROI</th>
              </tr>
            </thead>

            <tbody>
              {filteredVehicles.map((vehicle) => {
                const statusStyle = getStatusStyle(
                  vehicle.status
                );

                const roi = toNumber(vehicle.roi_percentage);

                return (
                  <tr
                    key={vehicle.vehicle_id}
                    style={{
                      borderBottom: "1px solid #F1F5F9",
                      color: "#0F172A",
                    }}
                  >
                    <td style={tableCellStyle}>
                      <div style={{ fontWeight: "600" }}>
                        {vehicle.vehicle_name}
                      </div>

                      <div
                        style={{
                          fontSize: "0.75rem",
                          color: "#64748B",
                          marginTop: "0.2rem",
                        }}
                      >
                        {vehicle.registration_number}
                      </div>

                      <div
                        style={{
                          fontSize: "0.7rem",
                          color: "#94A3B8",
                          marginTop: "0.15rem",
                        }}
                      >
                        {vehicle.type}
                        {vehicle.region
                          ? ` • ${vehicle.region}`
                          : ""}
                      </div>
                    </td>

                    <td style={tableCellStyle}>
                      <span
                        style={{
                          ...statusStyle,
                          display: "inline-block",
                          padding: "0.25rem 0.5rem",
                          borderRadius: "4px",
                          fontSize: "0.75rem",
                          fontWeight: "600",
                        }}
                      >
                        {vehicle.status}
                      </span>
                    </td>

                    <td style={tableCellStyle}>
                      {vehicle.completed_trips}
                    </td>

                    <td style={tableCellStyle}>
                      {formatNumber(vehicle.total_distance)} km
                    </td>

                    <td
                      style={{
                        ...tableCellStyle,
                        fontWeight: "600",
                        color: "#16A34A",
                      }}
                    >
                      {formatCurrency(vehicle.total_revenue)}
                    </td>

                    <td style={tableCellStyle}>
                      {formatNumber(
                        vehicle.total_fuel_consumed
                      )}{" "}
                      L
                    </td>

                    <td style={tableCellStyle}>
                      {formatCurrency(vehicle.total_fuel_cost)}
                    </td>

                    <td style={tableCellStyle}>
                      {formatCurrency(
                        vehicle.total_maintenance_cost
                      )}
                    </td>

                    <td
                      style={{
                        ...tableCellStyle,
                        fontWeight: "600",
                      }}
                    >
                      {formatCurrency(
                        vehicle.total_operational_cost
                      )}
                    </td>

                    <td style={tableCellStyle}>
                      <span
                        style={{
                          display: "inline-block",
                          background: "#EFF6FF",
                          color: "#2563EB",
                          padding: "0.25rem 0.5rem",
                          borderRadius: "4px",
                          fontWeight: "600",
                        }}
                      >
                        {formatNumber(
                          vehicle.fuel_efficiency
                        )}{" "}
                        km/L
                      </span>
                    </td>

                    <td style={tableCellStyle}>
                      <span
                        style={{
                          display: "inline-block",
                          background:
                            roi > 0
                              ? "#DCFCE7"
                              : roi < 0
                                ? "#FEE2E2"
                                : "#F1F5F9",
                          color:
                            roi > 0
                              ? "#16A34A"
                              : roi < 0
                                ? "#DC2626"
                                : "#64748B",
                          padding: "0.25rem 0.5rem",
                          borderRadius: "4px",
                          fontWeight: "700",
                        }}
                      >
                        {formatNumber(roi)}%
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

// ============================================
// SUMMARY CARD
// ============================================

const SummaryCard = ({
  title,
  value,
  subtitle,
  icon,
  iconColor,
  iconBackground,
}) => {
  return (
    <div
      style={{
        background: "#FFFFFF",
        border: "1px solid #E2E8F0",
        borderRadius: "8px",
        padding: "1.25rem",
        display: "flex",
        justifyContent: "space-between",
        gap: "1rem",
        boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
      }}
    >
      <div>
        <span
          style={{
            fontSize: "0.8rem",
            color: "#64748B",
            fontWeight: "500",
          }}
        >
          {title}
        </span>

        <h2
          style={{
            fontSize: "1.5rem",
            margin: "0.35rem 0",
            color: "#0F172A",
          }}
        >
          {value}
        </h2>

        <span
          style={{
            fontSize: "0.75rem",
            color: "#64748B",
          }}
        >
          {subtitle}
        </span>
      </div>

      <div
        style={{
          width: "42px",
          height: "42px",
          flexShrink: 0,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          borderRadius: "8px",
          color: iconColor,
          background: iconBackground,
        }}
      >
        {icon}
      </div>
    </div>
  );
};

// ============================================
// INSIGHT CARD
// ============================================

const InsightCard = ({
  title,
  value,
  subtitle,
  icon,
  color,
}) => {
  return (
    <div
      style={{
        background: "#FFFFFF",
        border: "1px solid #E2E8F0",
        borderRadius: "8px",
        padding: "1.25rem",
      }}
    >
      <h3
        style={{
          fontSize: "0.95rem",
          fontWeight: "600",
          margin: "0 0 0.75rem",
          display: "flex",
          alignItems: "center",
          gap: "0.5rem",
          color: "#334155",
        }}
      >
        <span style={{ color, display: "flex" }}>
          {icon}
        </span>

        {title}
      </h3>

      <h2
        style={{
          fontSize: "1.5rem",
          margin: "0 0 0.35rem",
          color: "#0F172A",
        }}
      >
        {value}
      </h2>

      <p
        style={{
          fontSize: "0.8rem",
          color: "#64748B",
          margin: 0,
        }}
      >
        {subtitle}
      </p>
    </div>
  );
};

const tableHeaderStyle = {
  padding: "1rem",
  whiteSpace: "nowrap",
  fontWeight: "600",
};

const tableCellStyle = {
  padding: "1rem",
  whiteSpace: "nowrap",
};

export default ReportsPage;