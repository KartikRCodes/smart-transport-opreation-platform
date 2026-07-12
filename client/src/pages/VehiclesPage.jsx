import { useEffect, useState } from "react";
import axiosClient from "../api/axiosClient";
import { Truck, Plus, Search, X } from "lucide-react";

const initialFormData = {
  registration_number: "",
  vehicle_name: "",
  model: "",
  type: "",
  max_load_capacity: "",
  odometer: "",
  acquisition_cost: "",
  region: "",
};

const VehiclesPage = () => {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const [showAddModal, setShowAddModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState(initialFormData);

  // ============================================
  // FETCH VEHICLES
  // ============================================

  const fetchVehicles = async () => {
    try {
      setError("");

      const response = await axiosClient.get("/vehicles");

      const vehicleData = response.data?.data?.vehicles;

      if (!Array.isArray(vehicleData)) {
        throw new Error("Invalid vehicle response from server");
      }

      setVehicles(vehicleData);
    } catch (err) {
      console.error("Error fetching vehicles:", err);

      const message =
        err.response?.data?.message ||
        err.message ||
        "Failed to load vehicle data from backend server.";

      setError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicles();
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

  const handleAddVehicle = async (event) => {
  event.preventDefault();

  try {
    setIsSubmitting(true);
    setError("");

    const payload = {
      registrationNumber: formData.registration_number.trim(),
      vehicleName: formData.vehicle_name.trim(),
      model: formData.model.trim(),
      type: formData.type.trim(),
      maxLoadCapacity: Number(formData.max_load_capacity),
      odometer: Number(formData.odometer),
      acquisitionCost: Number(formData.acquisition_cost),
      region: formData.region.trim(),
    };

    await axiosClient.post("/vehicles", payload);

    setShowAddModal(false);
    setFormData(initialFormData);

    await fetchVehicles();
  } catch (err) {
    console.error("Create vehicle error:", err);

    const message =
      err.response?.data?.message ||
      err.message ||
      "Failed to create vehicle.";

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

      case "In Shop":
        return {
          background: "#FEF3C7",
          color: "#D97706",
        };

      case "Retired":
        return {
          background: "#FEE2E2",
          color: "#DC2626",
        };

      default:
        return {
          background: "var(--surface-muted)",
          color: "var(--text-secondary)",
        };
    }
  };

  // ============================================
  // SEARCH FILTER
  // ============================================

  const filteredVehicles = vehicles.filter((vehicle) => {
    const search = searchTerm.trim().toLowerCase();

    if (!search) {
      return true;
    }

    return (
      vehicle.registration_number?.toLowerCase().includes(search) ||
      vehicle.vehicle_name?.toLowerCase().includes(search) ||
      vehicle.model?.toLowerCase().includes(search) ||
      vehicle.type?.toLowerCase().includes(search) ||
      vehicle.region?.toLowerCase().includes(search) ||
      vehicle.status?.toLowerCase().includes(search)
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
        <h3>Loading transport registry...</h3>
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
            Vehicle Registry
          </h1>

          <p
            style={{
              color: "var(--text-secondary)",
              margin: 0,
            }}
          >
            Monitor fleet inventory, capacity, odometer, region, and
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
          <span>Add Vehicle</span>
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
            color: "var(--text-muted)",
            display: "flex",
          }}
        >
          <Search size={18} />
        </span>

        <input
          type="text"
          placeholder="Search by name, model, type, region, plate or status..."
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
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

      {/* API Error */}
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

      {/* Vehicle Grid */}
      {filteredVehicles.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: "3rem",
            background: "var(--surface)",
            borderRadius: "8px",
            border: "1px solid var(--border)",
          }}
        >
          <Truck
            size={48}
            style={{
              color: "var(--text-muted)",
              marginBottom: "1rem",
            }}
          />

          <p
            style={{
              color: "var(--text-secondary)",
              margin: 0,
            }}
          >
            No vehicles found in the registry.
          </p>
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fill, minmax(300px, 1fr))",
            gap: "1.5rem",
          }}
        >
          {filteredVehicles.map((vehicle) => {
            const statusStyle = getStatusStyle(vehicle.status);

            return (
              <div
                key={vehicle.id}
                style={{
                  background: "var(--surface)",
                  borderRadius: "8px",
                  border: "1px solid var(--border)",
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
                        background: "#EFF6FF",
                        color: "#2563EB",
                        borderRadius: "6px",
                        display: "flex",
                      }}
                    >
                      <Truck size={20} />
                    </div>

                    <div>
                      <h3
                        style={{
                          margin: 0,
                          fontSize: "1.05rem",
                          fontWeight: "600",
                        }}
                      >
                        {vehicle.vehicle_name || "Unnamed Vehicle"}
                      </h3>

                      <span
                        style={{
                          fontSize: "0.8rem",
                          color: "var(--text-secondary)",
                        }}
                      >
                        {vehicle.model || "No model"} Â·{" "}
                        {vehicle.type || "Unknown type"}
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
                    {vehicle.status || "Unknown"}
                  </span>
                </div>

                {/* Vehicle Details */}
                <div
                  style={{
                    borderTop: "1px solid #F1F5F9",
                    paddingTop: "0.75rem",
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.6rem",
                    fontSize: "0.875rem",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      gap: "1rem",
                    }}
                  >
                    <span style={{ color: "var(--text-secondary)" }}>
                      Registration:
                    </span>

                    <span
                      style={{
                        fontWeight: "600",
                        fontFamily: "monospace",
                      }}
                    >
                      {vehicle.registration_number || "N/A"}
                    </span>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      gap: "1rem",
                    }}
                  >
                    <span style={{ color: "var(--text-secondary)" }}>
                      Max Load:
                    </span>

                    <span style={{ fontWeight: "500" }}>
                      {Number(
                        vehicle.max_load_capacity || 0
                      ).toLocaleString()}{" "}
                      kg
                    </span>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      gap: "1rem",
                    }}
                  >
                    <span style={{ color: "var(--text-secondary)" }}>
                      Odometer:
                    </span>

                    <span style={{ fontWeight: "500" }}>
                      {Number(
                        vehicle.odometer || 0
                      ).toLocaleString()}{" "}
                      km
                    </span>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      gap: "1rem",
                    }}
                  >
                    <span style={{ color: "var(--text-secondary)" }}>
                      Region:
                    </span>

                    <span style={{ fontWeight: "500" }}>
                      {vehicle.region || "Not assigned"}
                    </span>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      gap: "1rem",
                    }}
                  >
                    <span style={{ color: "var(--text-secondary)" }}>
                      Acquisition Cost:
                    </span>

                    <span style={{ fontWeight: "500" }}>
                      â‚¹
                      {Number(
                        vehicle.acquisition_cost || 0
                      ).toLocaleString("en-IN")}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Vehicle Modal */}
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
              background: "var(--surface)",
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
                    color: "var(--text-primary)",
                  }}
                >
                  Add Vehicle
                </h2>

                <p
                  style={{
                    margin: "0.25rem 0 0",
                    color: "var(--text-secondary)",
                    fontSize: "0.875rem",
                  }}
                >
                  Register a new vehicle in the TransitOps fleet.
                </p>
              </div>

              <button
                type="button"
                onClick={closeAddModal}
                disabled={isSubmitting}
                aria-label="Close add vehicle modal"
                style={{
                  border: "none",
                  background: "transparent",
                  cursor: isSubmitting ? "not-allowed" : "pointer",
                  color: "var(--text-secondary)",
                  padding: "0.25rem",
                  display: "flex",
                }}
              >
                <X size={22} />
              </button>
            </div>

            <form onSubmit={handleAddVehicle}>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "repeat(auto-fit, minmax(220px, 1fr))",
                  gap: "1rem",
                }}
              >
                {/* Registration Number */}
                <div>
                  <label style={labelStyle}>
                    Registration Number *
                  </label>

                  <input
                    type="text"
                    name="registration_number"
                    value={formData.registration_number}
                    onChange={handleInputChange}
                    placeholder="GJ05XY9876"
                    required
                    style={inputStyle}
                  />
                </div>

                {/* Vehicle Name */}
                <div>
                  <label style={labelStyle}>Vehicle Name *</label>

                  <input
                    type="text"
                    name="vehicle_name"
                    value={formData.vehicle_name}
                    onChange={handleInputChange}
                    placeholder="Ashok Leyland AVTR"
                    required
                    style={inputStyle}
                  />
                </div>

                {/* Model */}
                <div>
                  <label style={labelStyle}>Model</label>

                  <input
                    type="text"
                    name="model"
                    value={formData.model}
                    onChange={handleInputChange}
                    placeholder="AVTR 4825"
                    style={inputStyle}
                  />
                </div>

                {/* Type */}
                <div>
                  <label style={labelStyle}>Vehicle Type *</label>

                  <select
                    name="type"
                    value={formData.type}
                    onChange={handleInputChange}
                    required
                    style={inputStyle}
                  >
                    <option value="">Select type</option>
                    <option value="Truck">Truck</option>
                    <option value="Van">Van</option>
                    <option value="Bus">Bus</option>
                    <option value="Trailer">Trailer</option>
                    <option value="Tanker">Tanker</option>
                  </select>
                </div>

                {/* Max Load */}
                <div>
                  <label style={labelStyle}>
                    Max Load Capacity (kg) *
                  </label>

                  <input
                    type="number"
                    name="max_load_capacity"
                    value={formData.max_load_capacity}
                    onChange={handleInputChange}
                    placeholder="25000"
                    required
                    min="0.01"
                    step="0.01"
                    style={inputStyle}
                  />
                </div>

                {/* Odometer */}
                <div>
                  <label style={labelStyle}>Odometer (km) *</label>

                  <input
                    type="number"
                    name="odometer"
                    value={formData.odometer}
                    onChange={handleInputChange}
                    placeholder="45000"
                    required
                    min="0"
                    step="0.01"
                    style={inputStyle}
                  />
                </div>

                {/* Acquisition Cost */}
                <div>
                  <label style={labelStyle}>
                    Acquisition Cost (â‚¹) *
                  </label>

                  <input
                    type="number"
                    name="acquisition_cost"
                    value={formData.acquisition_cost}
                    onChange={handleInputChange}
                    placeholder="4200000"
                    required
                    min="0"
                    step="0.01"
                    style={inputStyle}
                  />
                </div>

                {/* Region */}
                <div>
                  <label style={labelStyle}>Region</label>

                  <select
                    name="region"
                    value={formData.region}
                    onChange={handleInputChange}
                    style={inputStyle}
                  >
                    <option value="">Select region</option>
                    <option value="North">North</option>
                    <option value="South">South</option>
                    <option value="East">East</option>
                    <option value="West">West</option>
                    <option value="Central">Central</option>
                  </select>
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
                    background: "var(--surface)",
                    color: "var(--text-secondary)",
                    border: "1px solid var(--border)",
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
                  {isSubmitting ? "Creating..." : "Create Vehicle"}
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
  color: "var(--text-primary)",
};

const inputStyle = {
  width: "100%",
  boxSizing: "border-box",
  padding: "0.65rem 0.75rem",
  border: "1px solid var(--border)",
  borderRadius: "6px",
  outline: "none",
  fontSize: "0.9rem",
  background: "var(--surface)",
  color: "var(--text-primary)",
};

export default VehiclesPage;