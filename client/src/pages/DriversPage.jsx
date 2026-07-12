import { useEffect, useState } from "react";
import axiosClient from "../api/axiosClient";
import {
  UserCheck,
  UserX,
  Search,
  Plus,
  Phone,
  Award,
  Calendar,
  ShieldCheck,
  X,
} from "lucide-react";

const initialFormData = {
  name: "",
  license_number: "",
  license_category: "",
  license_expiry_date: "",
  contact_number: "",
  safety_score: "100",
};

const DriversPage = () => {
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const [showAddModal, setShowAddModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState(initialFormData);

  // ============================================
  // FETCH DRIVERS
  // ============================================

  const fetchDrivers = async () => {
    try {
      setError("");

      const response = await axiosClient.get("/drivers");

      const driverData = response.data?.data?.drivers;

      if (!Array.isArray(driverData)) {
        throw new Error("Invalid driver response from server");
      }

      setDrivers(driverData);
    } catch (err) {
      console.error("Error fetching drivers:", err);

      const message =
        err.response?.data?.message ||
        err.message ||
        "Failed to load driver data from backend server.";

      setError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDrivers();
  }, []);

  // ============================================
  // FORM HANDLERS
  // ============================================

  const handleInputChange = (event) => {
    const { name, value } = event.target;

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const closeAddModal = () => {
    if (isSubmitting) {
      return;
    }

    setShowAddModal(false);
    setFormData(initialFormData);
  };

  const handleAddDriver = async (event) => {
    event.preventDefault();

    try {
      setIsSubmitting(true);
      setError("");

      /*
        Backend expects camelCase request fields.
        PostgreSQL returns snake_case response fields.
      */
      const payload = {
        name: formData.name.trim(),
        licenseNumber: formData.license_number.trim(),
        licenseCategory: formData.license_category.trim(),
        licenseExpiryDate: formData.license_expiry_date,
        contactNumber: formData.contact_number.trim(),
        safetyScore: Number(formData.safety_score),
      };

      await axiosClient.post("/drivers", payload);

      setShowAddModal(false);
      setFormData(initialFormData);

      await fetchDrivers();
    } catch (err) {
      console.error("Create driver error:", err);

      const message =
        err.response?.data?.message ||
        err.message ||
        "Failed to create driver.";

      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // ============================================
  // STATUS STYLES
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

      case "Off Duty":
        return {
          background: "#FEF3C7",
          color: "#D97706",
        };

      case "Suspended":
        return {
          background: "#FEE2E2",
          color: "#DC2626",
        };

      default:
        return {
          background: "#F1F5F9",
          color: "#475569",
        };
    }
  };

  const getDriverIconStyle = (status) => {
    switch (status) {
      case "Available":
        return {
          background: "#E0F2FE",
          color: "#0369A1",
        };

      case "On Trip":
        return {
          background: "#DBEAFE",
          color: "#2563EB",
        };

      case "Off Duty":
        return {
          background: "#FEF3C7",
          color: "#B45309",
        };

      case "Suspended":
        return {
          background: "#FEE2E2",
          color: "#DC2626",
        };

      default:
        return {
          background: "#F1F5F9",
          color: "#475569",
        };
    }
  };

  // ============================================
  // DATE FORMAT
  // ============================================

  const formatDate = (dateValue) => {
    if (!dateValue) {
      return "N/A";
    }

    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) {
      return "Invalid date";
    }

    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  // ============================================
  // SEARCH FILTER
  // ============================================

  const filteredDrivers = drivers.filter((driver) => {
    const search = searchTerm.trim().toLowerCase();

    if (!search) {
      return true;
    }

    return (
      driver.name?.toLowerCase().includes(search) ||
      driver.license_number?.toLowerCase().includes(search) ||
      driver.license_category?.toLowerCase().includes(search) ||
      driver.contact_number?.toLowerCase().includes(search) ||
      driver.status?.toLowerCase().includes(search)
    );
  });

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
        <h3>Loading drivers database...</h3>
      </div>
    );
  }

  return (
    <div style={{ padding: "0.5rem" }}>
      {/* Header */}
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
            Driver Management Pool
          </h1>

          <p
            style={{
              color: "#64748B",
              margin: 0,
            }}
          >
            Track operators, license compliance, safety scores, and
            operational status.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setError("");
            setShowAddModal(true);
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
          <span>Add Driver</span>
        </button>
      </div>

      {/* Search */}
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
          placeholder="Search by name, license, category, contact or status..."
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
          style={{
            width: "100%",
            padding: "0.5rem 0.75rem 0.5rem 2.5rem",
            borderRadius: "6px",
            border: "1px solid #CBD5E1",
            outline: "none",
            boxSizing: "border-box",
          }}
        />
      </div>

      {/* Error */}
      {error && (
        <div
          style={{
            background: "#FEE2E2",
            border: "1px solid #FCA5A5",
            color: "#DC2626",
            padding: "1rem",
            borderRadius: "6px",
            marginBottom: "1.5rem",
          }}
        >
          {error}
        </div>
      )}

      {/* Driver Grid */}
      {filteredDrivers.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: "3rem",
            background: "#FFFFFF",
            borderRadius: "8px",
            border: "1px solid #E2E8F0",
          }}
        >
          <UserX
            size={48}
            style={{
              color: "#94A3B8",
              marginBottom: "1rem",
            }}
          />

          <p
            style={{
              color: "#64748B",
              margin: 0,
            }}
          >
            No drivers found in the database.
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
          {filteredDrivers.map((driver) => {
            const statusStyle = getStatusStyle(driver.status);
            const iconStyle = getDriverIconStyle(driver.status);

            return (
              <div
                key={driver.id}
                style={{
                  background: "#FFFFFF",
                  borderRadius: "8px",
                  border: "1px solid #E2E8F0",
                  padding: "1.25rem",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                }}
              >
                {/* Card Header */}
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
                        background: iconStyle.background,
                        color: iconStyle.color,
                        borderRadius: "50%",
                        display: "flex",
                      }}
                    >
                      {driver.status === "Available" ? (
                        <UserCheck size={20} />
                      ) : (
                        <UserX size={20} />
                      )}
                    </div>

                    <div>
                      <h3
                        style={{
                          margin: 0,
                          fontSize: "1.05rem",
                          fontWeight: "600",
                        }}
                      >
                        {driver.name || "Unnamed Driver"}
                      </h3>

                      <span
                        style={{
                          fontSize: "0.8rem",
                          color: "#64748B",
                        }}
                      >
                        Safety Score:{" "}
                        <strong>{driver.safety_score ?? 0}/100</strong>
                      </span>
                    </div>
                  </div>

                  <span
                    style={{
                      fontSize: "0.75rem",
                      fontWeight: "600",
                      padding: "0.25rem 0.5rem",
                      borderRadius: "4px",
                      background: statusStyle.background,
                      color: statusStyle.color,
                      whiteSpace: "nowrap",
                    }}
                  >
                    {driver.status || "Unknown"}
                  </span>
                </div>

                {/* Driver Details */}
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
                  <div style={detailRowStyle}>
                    <span style={detailLabelStyle}>
                      <Award size={14} />
                      License:
                    </span>

                    <span
                      style={{
                        fontWeight: "500",
                        fontFamily: "monospace",
                      }}
                    >
                      {driver.license_number || "N/A"}
                    </span>
                  </div>

                  <div style={detailRowStyle}>
                    <span style={detailLabelStyle}>
                      <ShieldCheck size={14} />
                      Category:
                    </span>

                    <span style={{ fontWeight: "500" }}>
                      {driver.license_category || "N/A"}
                    </span>
                  </div>

                  <div style={detailRowStyle}>
                    <span style={detailLabelStyle}>
                      <Calendar size={14} />
                      License Expiry:
                    </span>

                    <span style={{ fontWeight: "500" }}>
                      {formatDate(driver.license_expiry_date)}
                    </span>
                  </div>

                  <div style={detailRowStyle}>
                    <span style={detailLabelStyle}>
                      <Phone size={14} />
                      Contact:
                    </span>

                    <span style={{ fontWeight: "500" }}>
                      {driver.contact_number || "N/A"}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Driver Modal */}
      {showAddModal && (
        <div
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeAddModal();
            }
          }}
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
              maxWidth: "650px",
              maxHeight: "90vh",
              overflowY: "auto",
              background: "#FFFFFF",
              borderRadius: "10px",
              padding: "1.5rem",
              boxShadow: "0 20px 40px rgba(0,0,0,0.2)",
            }}
          >
            {/* Modal Header */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                marginBottom: "1.5rem",
                gap: "1rem",
              }}
            >
              <div>
                <h2
                  style={{
                    margin: 0,
                    fontSize: "1.25rem",
                    color: "#0F172A",
                  }}
                >
                  Add Driver
                </h2>

                <p
                  style={{
                    margin: "0.25rem 0 0",
                    color: "#64748B",
                    fontSize: "0.875rem",
                  }}
                >
                  Register a new driver in the TransitOps system.
                </p>
              </div>

              <button
                type="button"
                onClick={closeAddModal}
                disabled={isSubmitting}
                aria-label="Close add driver modal"
                style={{
                  border: "none",
                  background: "transparent",
                  cursor: isSubmitting ? "not-allowed" : "pointer",
                  color: "#64748B",
                  padding: "0.25rem",
                  display: "flex",
                }}
              >
                <X size={22} />
              </button>
            </div>

            <form onSubmit={handleAddDriver}>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "repeat(auto-fit, minmax(220px, 1fr))",
                  gap: "1rem",
                }}
              >
                {/* Name */}
                <div>
                  <label style={labelStyle}>Driver Name *</label>

                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Rahul Sharma"
                    required
                    style={inputStyle}
                  />
                </div>

                {/* License Number */}
                <div>
                  <label style={labelStyle}>License Number *</label>

                  <input
                    type="text"
                    name="license_number"
                    value={formData.license_number}
                    onChange={handleInputChange}
                    placeholder="GJ-0120261234"
                    required
                    style={inputStyle}
                  />
                </div>

                {/* License Category */}
                <div>
                  <label style={labelStyle}>License Category *</label>

                  <select
                    name="license_category"
                    value={formData.license_category}
                    onChange={handleInputChange}
                    required
                    style={inputStyle}
                  >
                    <option value="">Select category</option>
                    <option value="LMV">LMV</option>
                    <option value="HMV">HMV</option>
                    <option value="HGMV">HGMV</option>
                    <option value="HPMV">HPMV</option>
                    <option value="Transport">Transport</option>
                  </select>
                </div>

                {/* Expiry Date */}
                <div>
                  <label style={labelStyle}>License Expiry Date *</label>

                  <input
                    type="date"
                    name="license_expiry_date"
                    value={formData.license_expiry_date}
                    onChange={handleInputChange}
                    required
                    style={inputStyle}
                  />
                </div>

                {/* Contact Number */}
                <div>
                  <label style={labelStyle}>Contact Number *</label>

                  <input
                    type="text"
                    name="contact_number"
                    value={formData.contact_number}
                    onChange={handleInputChange}
                    placeholder="+91 98765 43210"
                    required
                    style={inputStyle}
                  />
                </div>

                {/* Safety Score */}
                <div>
                  <label style={labelStyle}>Safety Score *</label>

                  <input
                    type="number"
                    name="safety_score"
                    value={formData.safety_score}
                    onChange={handleInputChange}
                    min="0"
                    max="100"
                    step="0.01"
                    required
                    style={inputStyle}
                  />
                </div>
              </div>

              {/* Actions */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: "0.75rem",
                  marginTop: "1.5rem",
                }}
              >
                <button
                  type="button"
                  onClick={closeAddModal}
                  disabled={isSubmitting}
                  style={{
                    padding: "0.65rem 1rem",
                    background: "#FFFFFF",
                    color: "#475569",
                    border: "1px solid #CBD5E1",
                    borderRadius: "6px",
                    cursor: isSubmitting
                      ? "not-allowed"
                      : "pointer",
                    fontWeight: "600",
                  }}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  style={{
                    padding: "0.65rem 1rem",
                    background: isSubmitting
                      ? "#93C5FD"
                      : "#2563EB",
                    color: "#FFFFFF",
                    border: "none",
                    borderRadius: "6px",
                    cursor: isSubmitting
                      ? "not-allowed"
                      : "pointer",
                    fontWeight: "600",
                  }}
                >
                  {isSubmitting ? "Creating..." : "Create Driver"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const labelStyle = {
  display: "block",
  marginBottom: "0.4rem",
  fontSize: "0.8rem",
  fontWeight: "600",
  color: "#334155",
};

const inputStyle = {
  width: "100%",
  boxSizing: "border-box",
  padding: "0.65rem 0.75rem",
  border: "1px solid #CBD5E1",
  borderRadius: "6px",
  outline: "none",
  fontSize: "0.9rem",
  background: "#FFFFFF",
  color: "#0F172A",
};

const detailRowStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: "1rem",
};

const detailLabelStyle = {
  color: "#64748B",
  display: "flex",
  alignItems: "center",
  gap: "0.35rem",
};

export default DriversPage;