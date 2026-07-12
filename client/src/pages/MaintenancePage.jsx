import { useEffect, useState } from "react";
import axiosClient from "../api/axiosClient";
import {
  Wrench,
  Calendar,
  Plus,
  Search,
  IndianRupee,
  X,
  CheckCircle,
} from "lucide-react";

const MaintenancePage = () => {
  const [logs, setLogs] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [completingId, setCompletingId] = useState(null);

  const [formData, setFormData] = useState({
    vehicleId: "",
    maintenanceType: "",
    description: "",
    cost: "",
    startDate: "",
  });

  // ============================================
  // FETCH MAINTENANCE LOGS
  // ============================================

  const fetchMaintenanceLogs = async () => {
    try {
      setError("");

      const response = await axiosClient.get("/maintenance");

      setLogs(response.data?.data?.maintenance || []);
    } catch (err) {
      console.error("Error fetching maintenance logs:", err);

      setError(
        err.response?.data?.message ||
          "Failed to load maintenance records."
      );

      setLogs([]);
    } finally {
      setLoading(false);
    }
  };

  // ============================================
  // FETCH AVAILABLE VEHICLES
  // ============================================

  const fetchVehicles = async () => {
    try {
      const response = await axiosClient.get("/vehicles");

      const allVehicles =
        response.data?.data?.vehicles || [];

      const availableVehicles = allVehicles.filter(
        (vehicle) => vehicle.status === "Available"
      );

      setVehicles(availableVehicles);
    } catch (err) {
      console.error("Error fetching vehicles:", err);
      setVehicles([]);
    }
  };

  useEffect(() => {
    const loadPageData = async () => {
      await Promise.all([
        fetchMaintenanceLogs(),
        fetchVehicles(),
      ]);
    };

    loadPageData();
  }, []);

  // ============================================
  // FORM HANDLER
  // ============================================

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // ============================================
  // CREATE MAINTENANCE
  // ============================================

  const handleCreateMaintenance = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!formData.vehicleId || !formData.maintenanceType.trim()) {
      setError("Vehicle and maintenance type are required.");
      return;
    }

    try {
      setSubmitting(true);

      await axiosClient.post("/maintenance", {
        vehicleId: Number(formData.vehicleId),
        maintenanceType: formData.maintenanceType.trim(),
        description: formData.description.trim() || null,
        cost:
          formData.cost === ""
            ? 0
            : Number(formData.cost),
        startDate: formData.startDate || null,
      });

      setSuccess("Maintenance started successfully.");

      setFormData({
        vehicleId: "",
        maintenanceType: "",
        description: "",
        cost: "",
        startDate: "",
      });

      setShowModal(false);

      await Promise.all([
        fetchMaintenanceLogs(),
        fetchVehicles(),
      ]);
    } catch (err) {
      console.error("Create maintenance error:", err);

      setError(
        err.response?.data?.message ||
          "Failed to create maintenance record."
      );
    } finally {
      setSubmitting(false);
    }
  };

  // ============================================
  // COMPLETE MAINTENANCE
  // ============================================

  const handleCompleteMaintenance = async (id) => {
    const confirmed = window.confirm(
      "Mark this maintenance record as completed?"
    );

    if (!confirmed) {
      return;
    }

    setError("");
    setSuccess("");

    try {
      setCompletingId(id);

      await axiosClient.patch(
        `/maintenance/${id}/complete`,
        {}
      );

      setSuccess("Maintenance completed successfully.");

      await Promise.all([
        fetchMaintenanceLogs(),
        fetchVehicles(),
      ]);
    } catch (err) {
      console.error("Complete maintenance error:", err);

      setError(
        err.response?.data?.message ||
          "Failed to complete maintenance."
      );
    } finally {
      setCompletingId(null);
    }
  };

  // ============================================
  // FILTERING
  // ============================================

  const filteredLogs = logs.filter((log) => {
    const search = searchTerm.toLowerCase();

    return (
      log.vehicle_name?.toLowerCase().includes(search) ||
      log.registration_number?.toLowerCase().includes(search) ||
      log.maintenance_type?.toLowerCase().includes(search) ||
      log.description?.toLowerCase().includes(search) ||
      log.status?.toLowerCase().includes(search)
    );
  });

  // ============================================
  // DATE FORMATTER
  // ============================================

  const formatDate = (date) => {
    if (!date) return "N/A";

    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
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
        <h3>Loading maintenance records...</h3>
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
            Maintenance Schedule Manager
          </h1>

          <p style={{ color: "var(--text-secondary)", margin: 0 }}>
            Manage vehicle maintenance records and service
            lifecycle.
          </p>
        </div>

        <button
          onClick={() => {
            setError("");
            setSuccess("");
            setShowModal(true);
          }}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            padding: "0.625rem 1rem",
            background: "#2563EB",
            color: "#FFFFFF",
            border: "none",
            borderRadius: "6px",
            fontWeight: "600",
            cursor: "pointer",
          }}
        >
          <Plus size={16} />
          Book Service Slot
        </button>
      </div>

      {/* MESSAGES */}

      {error && (
        <div
          style={{
            background: "#FEE2E2",
            color: "#DC2626",
            padding: "0.875rem 1rem",
            borderRadius: "6px",
            marginBottom: "1rem",
          }}
        >
          {error}
        </div>
      )}

      {success && (
        <div
          style={{
            background: "#DCFCE7",
            color: "#15803D",
            padding: "0.875rem 1rem",
            borderRadius: "6px",
            marginBottom: "1rem",
          }}
        >
          {success}
        </div>
      )}

      {/* SEARCH */}

      <div
        style={{
          position: "relative",
          maxWidth: "400px",
          marginBottom: "1.5rem",
        }}
      >
        <span
          style={{
            position: "absolute",
            left: "0.75rem",
            top: "50%",
            transform: "translateY(-50%)",
            color: "var(--text-muted)",
            display: "flex",
          }}
        >
          <Search size={18} />
        </span>

        <input
          type="text"
          placeholder="Search vehicle, registration, or service..."
          value={searchTerm}
          onChange={(event) =>
            setSearchTerm(event.target.value)
          }
          style={{
            width: "100%",
            padding: "0.5rem 0.75rem 0.5rem 2.5rem",
            borderRadius: "6px",
            border: "1px solid var(--border)",
            outline: "none",
            boxSizing: "border-box",
          }}
        />
      </div>

      {/* EMPTY STATE */}

      {filteredLogs.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: "3rem",
            background: "var(--surface)",
            borderRadius: "8px",
            border: "1px solid var(--border)",
          }}
        >
          <Wrench
            size={48}
            style={{
              color: "var(--text-muted)",
              marginBottom: "1rem",
            }}
          />

          <p style={{ color: "var(--text-secondary)", margin: 0 }}>
            No maintenance records found.
          </p>
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fill, minmax(320px, 1fr))",
            gap: "1.5rem",
          }}
        >
          {filteredLogs.map((log) => (
            <div
              key={log.id}
              style={{
                background: "var(--surface)",
                borderRadius: "8px",
                border: "1px solid var(--border)",
                padding: "1.25rem",
                boxShadow:
                  "0 1px 3px rgba(0,0,0,0.05)",
              }}
            >
              {/* CARD HEADER */}

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  marginBottom: "1rem",
                  gap: "1rem",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.75rem",
                  }}
                >
                  <div
                    style={{
                      padding: "0.5rem",
                      background: "var(--surface-muted)",
                      color: "var(--text-secondary)",
                      borderRadius: "6px",
                      display: "flex",
                    }}
                  >
                    <Wrench size={20} />
                  </div>

                  <div>
                    <h3
                      style={{
                        margin: 0,
                        fontSize: "1.05rem",
                        fontWeight: "600",
                      }}
                    >
                      {log.vehicle_name}
                    </h3>

                    <span
                      style={{
                        fontSize: "0.8rem",
                        color: "var(--text-secondary)",
                      }}
                    >
                      {log.registration_number}
                    </span>
                  </div>
                </div>

                <span
                  style={{
                    fontSize: "0.75rem",
                    fontWeight: "600",
                    padding: "0.25rem 0.5rem",
                    borderRadius: "4px",
                    background:
                      log.status === "Completed"
                        ? "#DCFCE7"
                        : "#FEF3C7",
                    color:
                      log.status === "Completed"
                        ? "#16A34A"
                        : "#D97706",
                  }}
                >
                  {log.status}
                </span>
              </div>

              {/* CARD BODY */}

              <div
                style={{
                  borderTop: "1px solid #F1F5F9",
                  paddingTop: "0.75rem",
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.65rem",
                  fontSize: "0.875rem",
                }}
              >
                <div>
                  <span style={{ color: "var(--text-secondary)" }}>
                    Service:
                  </span>{" "}
                  <strong>{log.maintenance_type}</strong>
                </div>

                {log.description && (
                  <div>
                    <span style={{ color: "var(--text-secondary)" }}>
                      Description:
                    </span>{" "}
                    {log.description}
                  </div>
                )}

                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: "1rem",
                  }}
                >
                  <span
                    style={{
                      color: "var(--text-secondary)",
                      display: "flex",
                      alignItems: "center",
                      gap: "0.25rem",
                    }}
                  >
                    <Calendar size={14} />
                    Start Date:
                  </span>

                  <span style={{ fontWeight: "500" }}>
                    {formatDate(log.start_date)}
                  </span>
                </div>

                {log.end_date && (
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                    }}
                  >
                    <span style={{ color: "var(--text-secondary)" }}>
                      Completed:
                    </span>

                    <span style={{ fontWeight: "500" }}>
                      {formatDate(log.end_date)}
                    </span>
                  </div>
                )}

                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                  }}
                >
                  <span
                    style={{
                      color: "var(--text-secondary)",
                      display: "flex",
                      alignItems: "center",
                      gap: "0.25rem",
                    }}
                  >
                    <IndianRupee size={14} />
                    Cost:
                  </span>

                  <span
                    style={{
                      fontWeight: "600",
                      color: "var(--text-primary)",
                    }}
                  >
                    â‚¹
                    {Number(log.cost || 0).toLocaleString(
                      "en-IN"
                    )}
                  </span>
                </div>
              </div>

              {/* COMPLETE BUTTON */}

              {log.status === "Active" && (
                <button
                  onClick={() =>
                    handleCompleteMaintenance(log.id)
                  }
                  disabled={completingId === log.id}
                  style={{
                    width: "100%",
                    marginTop: "1rem",
                    padding: "0.625rem",
                    border: "none",
                    borderRadius: "6px",
                    background:
                      completingId === log.id
                        ? "#94A3B8"
                        : "#16A34A",
                    color: "#FFFFFF",
                    fontWeight: "600",
                    cursor:
                      completingId === log.id
                        ? "not-allowed"
                        : "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "0.4rem",
                  }}
                >
                  <CheckCircle size={16} />

                  {completingId === log.id
                    ? "Completing..."
                    : "Complete Maintenance"}
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* CREATE MAINTENANCE MODAL */}

      {showModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(15, 23, 42, 0.55)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            padding: "1rem",
            zIndex: 1000,
          }}
        >
          <div
            style={{
              width: "100%",
              maxWidth: "520px",
              background: "var(--surface)",
              borderRadius: "10px",
              padding: "1.5rem",
              maxHeight: "90vh",
              overflowY: "auto",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "1.5rem",
              }}
            >
              <h2
                style={{
                  margin: 0,
                  fontSize: "1.25rem",
                }}
              >
                Start Vehicle Maintenance
              </h2>

              <button
                type="button"
                onClick={() => setShowModal(false)}
                style={{
                  border: "none",
                  background: "transparent",
                  cursor: "pointer",
                  color: "var(--text-secondary)",
                  display: "flex",
                }}
              >
                <X size={22} />
              </button>
            </div>

            <form onSubmit={handleCreateMaintenance}>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "1rem",
                }}
              >
                {/* VEHICLE */}

                <div>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "0.4rem",
                      fontWeight: "500",
                      fontSize: "0.875rem",
                    }}
                  >
                    Vehicle *
                  </label>

                  <select
                    name="vehicleId"
                    value={formData.vehicleId}
                    onChange={handleChange}
                    required
                    style={inputStyle}
                  >
                    <option value="">
                      Select available vehicle
                    </option>

                    {vehicles.map((vehicle) => (
                      <option
                        key={vehicle.id}
                        value={vehicle.id}
                      >
                        {vehicle.vehicle_name} â€”{" "}
                        {vehicle.registration_number}
                      </option>
                    ))}
                  </select>

                  {vehicles.length === 0 && (
                    <p
                      style={{
                        color: "#DC2626",
                        fontSize: "0.8rem",
                        marginBottom: 0,
                      }}
                    >
                      No available vehicles found.
                    </p>
                  )}
                </div>

                {/* TYPE */}

                <div>
                  <label style={labelStyle}>
                    Maintenance Type *
                  </label>

                  <input
                    type="text"
                    name="maintenanceType"
                    value={formData.maintenanceType}
                    onChange={handleChange}
                    placeholder="Example: Oil Change"
                    required
                    style={inputStyle}
                  />
                </div>

                {/* DESCRIPTION */}

                <div>
                  <label style={labelStyle}>
                    Description
                  </label>

                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Describe the maintenance work..."
                    rows="3"
                    style={{
                      ...inputStyle,
                      resize: "vertical",
                    }}
                  />
                </div>

                {/* COST */}

                <div>
                  <label style={labelStyle}>
                    Maintenance Cost
                  </label>

                  <input
                    type="number"
                    name="cost"
                    value={formData.cost}
                    onChange={handleChange}
                    placeholder="0"
                    min="0"
                    step="0.01"
                    style={inputStyle}
                  />
                </div>

                {/* DATE */}

                <div>
                  <label style={labelStyle}>
                    Start Date
                  </label>

                  <input
                    type="date"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleChange}
                    style={inputStyle}
                  />
                </div>

                {/* ACTIONS */}

                <div
                  style={{
                    display: "flex",
                    justifyContent: "flex-end",
                    gap: "0.75rem",
                    marginTop: "0.5rem",
                  }}
                >
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    style={{
                      padding: "0.625rem 1rem",
                      border: "1px solid var(--border)",
                      background: "var(--surface)",
                      borderRadius: "6px",
                      cursor: "pointer",
                      fontWeight: "600",
                    }}
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={
                      submitting || vehicles.length === 0
                    }
                    style={{
                      padding: "0.625rem 1rem",
                      border: "none",
                      background:
                        submitting || vehicles.length === 0
                          ? "#94A3B8"
                          : "#2563EB",
                      color: "#FFFFFF",
                      borderRadius: "6px",
                      cursor:
                        submitting || vehicles.length === 0
                          ? "not-allowed"
                          : "pointer",
                      fontWeight: "600",
                    }}
                  >
                    {submitting
                      ? "Starting..."
                      : "Start Maintenance"}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const inputStyle = {
  width: "100%",
  padding: "0.625rem 0.75rem",
  border: "1px solid var(--border)",
  borderRadius: "6px",
  outline: "none",
  boxSizing: "border-box",
  fontFamily: "inherit",
};

const labelStyle = {
  display: "block",
  marginBottom: "0.4rem",
  fontWeight: "500",
  fontSize: "0.875rem",
};

export default MaintenancePage;