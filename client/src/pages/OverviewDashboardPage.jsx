import { useEffect, useState } from "react";
import axiosClient from "../api/axiosClient";
import {
  Truck,
  Users,
  Route,
  Wrench,
  TrendingUp,
  AlertTriangle,
} from "lucide-react";

const OverviewDashboardPage = () => {
  const [stats, setStats] = useState({
    totalVehicles: 0,
    availableVehicles: 0,
    activeVehicles: 0,
    inShopVehicles: 0,
    retiredVehicles: 0,

    totalDrivers: 0,
    availableDrivers: 0,
    suspendedDrivers: 0,

    draftTrips: 0,
    activeTrips: 0,
    completedTrips: 0,
    cancelledTrips: 0,

    activeMaintenance: 0,
    fleetUtilization: 0,
  });

  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState("");

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        setApiError("");

        const response = await axiosClient.get("/dashboard/kpis");

        const kpis = response.data?.data?.kpis;

        if (!kpis) {
          throw new Error("Invalid dashboard response from server");
        }

        setStats(kpis);
      } catch (err) {
        console.error("Dashboard API error:", err);

        const message =
          err.response?.data?.message ||
          err.message ||
          "Unable to load dashboard metrics";

        setApiError(message);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardStats();
  }, []);

  const cardData = [
    {
      title: "Active Fleet",
      value: stats.activeVehicles,
      subtitle: `${stats.availableVehicles} available vehicles`,
      icon: <Truck size={24} />,
      color: "#3B82F6",
      bg: "#EFF6FF",
    },
    {
      title: "Available Drivers",
      value: stats.availableDrivers,
      subtitle: `${stats.totalDrivers} total drivers`,
      icon: <Users size={24} />,
      color: "#10B981",
      bg: "#ECFDF5",
    },
    {
      title: "Live Transits",
      value: stats.activeTrips,
      subtitle: `${stats.completedTrips} completed trips`,
      icon: <Route size={24} />,
      color: "#8B5CF6",
      bg: "#F5F3FF",
    },
    {
      title: "Active Maintenance",
      value: stats.activeMaintenance,
      subtitle: `${stats.inShopVehicles} vehicles in shop`,
      icon: <Wrench size={24} />,
      color: "#F59E0B",
      bg: "#FEF3C7",
    },
  ];

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
        <h3>Loading system metrics...</h3>
      </div>
    );
  }

  return (
    <div style={{ padding: "0.5rem" }}>
      {/* Title */}
      <div style={{ marginBottom: "2rem" }}>
        <h1
          style={{
            fontSize: "1.5rem",
            fontWeight: "bold",
            margin: "0 0 0.25rem 0",
          }}
        >
          Operations Overview
        </h1>

        <p style={{ color: "var(--text-secondary)", margin: 0 }}>
          Real-time fleet, driver, trip, and maintenance metrics.
        </p>
      </div>

      {/* API Error */}
      {apiError && (
        <div
          style={{
            background: "#FEE2E2",
            border: "1px solid #FCA5A5",
            color: "#DC2626",
            padding: "0.75rem 1rem",
            borderRadius: "6px",
            marginBottom: "1.5rem",
            fontSize: "0.9rem",
            fontWeight: "500",
          }}
        >
          Failed to load dashboard: {apiError}
        </div>
      )}

      {/* Main KPI Cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
          gap: "1.5rem",
          marginBottom: "2.5rem",
        }}
      >
        {cardData.map((card) => (
          <div
            key={card.title}
            style={{
              background: "var(--surface)",
              border: "1px solid var(--border)",
              borderRadius: "8px",
              padding: "1.5rem",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
            }}
          >
            <div>
              <span
                style={{
                  fontSize: "0.875rem",
                  color: "var(--text-secondary)",
                  fontWeight: "500",
                }}
              >
                {card.title}
              </span>

              <h2
                style={{
                  fontSize: "2rem",
                  fontWeight: "bold",
                  margin: "0.25rem 0",
                  color: "var(--text-primary)",
                }}
              >
                {card.value}
              </h2>

              <span
                style={{
                  fontSize: "0.75rem",
                  color: "var(--text-secondary)",
                }}
              >
                {card.subtitle}
              </span>
            </div>

            <div
              style={{
                padding: "0.75rem",
                borderRadius: "8px",
                background: card.bg,
                color: card.color,
                display: "flex",
              }}
            >
              {card.icon}
            </div>
          </div>
        ))}
      </div>

      {/* Secondary Information */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))",
          gap: "1.5rem",
        }}
      >
        {/* Operational Alerts */}
        <div
          style={{
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: "8px",
            padding: "1.5rem",
          }}
        >
          <h3
            style={{
              fontSize: "1.1rem",
              fontWeight: "600",
              margin: "0 0 1rem 0",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
            }}
          >
            <AlertTriangle
              size={18}
              style={{ color: "#EF4444" }}
            />
            Operational Alerts
          </h3>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "1rem",
            }}
          >
            {stats.suspendedDrivers > 0 && (
              <div
                style={{
                  padding: "0.75rem",
                  background: "#FFF5F5",
                  borderLeft: "4px solid #EF4444",
                  borderRadius: "4px",
                }}
              >
                <span
                  style={{
                    fontSize: "0.8rem",
                    color: "#DC2626",
                    fontWeight: "600",
                  }}
                >
                  {stats.suspendedDrivers} suspended driver
                  {stats.suspendedDrivers !== 1 ? "s" : ""}
                </span>

                <p
                  style={{
                    fontSize: "0.85rem",
                    margin: "0.25rem 0 0 0",
                    color: "#4A5568",
                  }}
                >
                  Suspended drivers are unavailable for trip dispatch.
                </p>
              </div>
            )}

            {stats.inShopVehicles > 0 && (
              <div
                style={{
                  padding: "0.75rem",
                  background: "#FFFBEB",
                  borderLeft: "4px solid #F59E0B",
                  borderRadius: "4px",
                }}
              >
                <span
                  style={{
                    fontSize: "0.8rem",
                    color: "#D97706",
                    fontWeight: "600",
                  }}
                >
                  {stats.inShopVehicles} vehicle
                  {stats.inShopVehicles !== 1 ? "s" : ""} in shop
                </span>

                <p
                  style={{
                    fontSize: "0.85rem",
                    margin: "0.25rem 0 0 0",
                    color: "#4A5568",
                  }}
                >
                  These vehicles are unavailable for active dispatch.
                </p>
              </div>
            )}

            {stats.activeMaintenance > 0 && (
              <div
                style={{
                  padding: "0.75rem",
                  background: "#FFFBEB",
                  borderLeft: "4px solid #F59E0B",
                  borderRadius: "4px",
                }}
              >
                <span
                  style={{
                    fontSize: "0.8rem",
                    color: "#D97706",
                    fontWeight: "600",
                  }}
                >
                  {stats.activeMaintenance} active maintenance job
                  {stats.activeMaintenance !== 1 ? "s" : ""}
                </span>

                <p
                  style={{
                    fontSize: "0.85rem",
                    margin: "0.25rem 0 0 0",
                    color: "#4A5568",
                  }}
                >
                  Maintenance work is currently in progress.
                </p>
              </div>
            )}

            {stats.suspendedDrivers === 0 &&
              stats.inShopVehicles === 0 &&
              stats.activeMaintenance === 0 && (
                <div
                  style={{
                    padding: "0.75rem",
                    background: "#ECFDF5",
                    borderLeft: "4px solid #10B981",
                    borderRadius: "4px",
                  }}
                >
                  <span
                    style={{
                      fontSize: "0.8rem",
                      color: "#047857",
                      fontWeight: "600",
                    }}
                  >
                    No critical operational alerts
                  </span>

                  <p
                    style={{
                      fontSize: "0.85rem",
                      margin: "0.25rem 0 0 0",
                      color: "#4A5568",
                    }}
                  >
                    Fleet operations are currently stable.
                  </p>
                </div>
              )}
          </div>
        </div>

        {/* Fleet Utilization */}
        <div
          style={{
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: "8px",
            padding: "1.5rem",
          }}
        >
          <h3
            style={{
              fontSize: "1.1rem",
              fontWeight: "600",
              margin: "0 0 1rem 0",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
            }}
          >
            <TrendingUp
              size={18}
              style={{ color: "#10B981" }}
            />
            Fleet Utilization
          </h3>

          <div
            style={{
              fontSize: "0.9rem",
              color: "var(--text-secondary)",
              lineHeight: "1.6",
            }}
          >
            <p style={{ margin: "0 0 1rem 0" }}>
              Current fleet utilization is{" "}
              <strong>{stats.fleetUtilization}%</strong>.
            </p>

            <div
              style={{
                background: "var(--surface-muted)",
                borderRadius: "6px",
                height: "8px",
                width: "100%",
                overflow: "hidden",
                marginBottom: "0.5rem",
              }}
            >
              <div
                style={{
                  height: "100%",
                  width: `${Math.min(
                    Math.max(stats.fleetUtilization, 0),
                    100
                  )}%`,
                  background: "#10B981",
                  borderRadius: "6px",
                  transition: "width 0.3s ease",
                }}
              />
            </div>

            <span
              style={{
                fontSize: "0.75rem",
                color: "var(--text-secondary)",
              }}
            >
              {stats.activeVehicles} of{" "}
              {stats.totalVehicles - stats.retiredVehicles} active,
              non-retired vehicles currently deployed.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OverviewDashboardPage;