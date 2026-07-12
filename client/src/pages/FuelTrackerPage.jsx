import { useEffect, useState } from "react";
import axiosClient from "../api/axiosClient";
import {
  Fuel,
  IndianRupee,
  Droplet,
  Plus,
  Search,
  Calendar,
  X,
  Truck,
  Route,
  Gauge,
  MapPin,
} from "lucide-react";

const initialFormData = {
  vehicleId: "",
  tripId: "",
  liters: "",
  cost: "",
  logDate: "",
};

const FuelTrackerPage = () => {
  const [logs, setLogs] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [trips, setTrips] = useState([]);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState(initialFormData);

  // ============================================
  // FETCH FUEL LOGS
  // ============================================

  const fetchFuelLogs = async () => {
    try {
      setError("");

      const response = await axiosClient.get("/fuel");

      const fuelLogs = response.data?.data?.fuelLogs;

      if (!Array.isArray(fuelLogs)) {
        throw new Error("Invalid fuel logs response from server");
      }

      setLogs(fuelLogs);
    } catch (err) {
      console.error("Error fetching fuel logs:", err);

      setError(
        err.response?.data?.message ||
          err.message ||
          "Failed to load fuel logs."
      );

      setLogs([]);
    } finally {
      setLoading(false);
    }
  };

  // ============================================
  // FETCH VEHICLES
  // ============================================

  const fetchVehicles = async () => {
    try {
      const response = await axiosClient.get("/vehicles");

      const vehicleData =
        response.data?.data?.vehicles || [];

      setVehicles(vehicleData);
    } catch (err) {
      console.error("Error fetching vehicles:", err);
      setVehicles([]);
    }
  };

  // ============================================
  // FETCH TRIPS
  // ============================================

  const fetchTrips = async () => {
    try {
      const response = await axiosClient.get("/trips");

      const tripData = response.data?.data?.trips || [];

      setTrips(tripData);
    } catch (err) {
      console.error("Error fetching trips:", err);
      setTrips([]);
    }
  };

  // ============================================
  // INITIAL PAGE LOAD
  // ============================================

  useEffect(() => {
    const loadPageData = async () => {
      await Promise.all([
        fetchFuelLogs(),
        fetchVehicles(),
        fetchTrips(),
      ]);
    };

    loadPageData();
  }, []);

  // ============================================
  // FORM HANDLER
  // ============================================

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => {
      if (name === "vehicleId") {
        return {
          ...previous,
          vehicleId: value,
          tripId: "",
        };
      }

      return {
        ...previous,
        [name]: value,
      };
    });
  };

  // ============================================
  // FILTER TRIPS BY SELECTED VEHICLE
  // ============================================

  const availableTrips = trips.filter(
    (trip) =>
      Number(trip.vehicle_id) === Number(formData.vehicleId)
  );

  // ============================================
  // OPEN MODAL
  // ============================================

  const openModal = async () => {
    setError("");
    setSuccess("");
    setFormData(initialFormData);

    await Promise.all([
      fetchVehicles(),
      fetchTrips(),
    ]);

    setShowModal(true);
  };

  // ============================================
  // CLOSE MODAL
  // ============================================

  const closeModal = () => {
    if (submitting) {
      return;
    }

    setShowModal(false);
    setFormData(initialFormData);
  };

  // ============================================
  // CREATE FUEL LOG
  // ============================================

  const handleCreateFuelLog = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    const liters = Number(formData.liters);
    const cost = Number(formData.cost);

    if (!formData.vehicleId) {
      setError("Vehicle is required.");
      return;
    }

    if (!Number.isFinite(liters) || liters <= 0) {
      setError("Liters must be greater than 0.");
      return;
    }

    if (!Number.isFinite(cost) || cost < 0) {
      setError("Fuel cost cannot be negative.");
      return;
    }

    try {
      setSubmitting(true);

      const payload = {
        vehicleId: Number(formData.vehicleId),
        liters,
        cost,
      };

      if (formData.tripId) {
        payload.tripId = Number(formData.tripId);
      }

      if (formData.logDate) {
        payload.logDate = formData.logDate;
      }

      const response = await axiosClient.post(
        "/fuel",
        payload
      );

      setShowModal(false);
      setFormData(initialFormData);

      setSuccess(
        response.data?.message ||
          "Fuel log created successfully."
      );

      await fetchFuelLogs();
    } catch (err) {
      console.error("Create fuel log error:", err);

      setError(
        err.response?.data?.message ||
          err.message ||
          "Failed to create fuel log."
      );
    } finally {
      setSubmitting(false);
    }
  };

  // ============================================
  // SEARCH
  // ============================================

  const filteredLogs = logs.filter((log) => {
    const search = searchTerm.trim().toLowerCase();

    if (!search) {
      return true;
    }

    return (
      log.vehicle_name?.toLowerCase().includes(search) ||
      log.registration_number?.toLowerCase().includes(search) ||
      log.trip_source?.toLowerCase().includes(search) ||
      log.trip_destination?.toLowerCase().includes(search) ||
      String(log.id).includes(search)
    );
  });

  // ============================================
  // DATE FORMATTER
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
        <h3>Loading fuel metrics logs...</h3>
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
            Fuel Consumption Tracker
          </h1>

          <p style={{ color: "#64748B", margin: 0 }}>
            Log refueling entries, track transaction costs, and
            evaluate real fleet efficiency.
          </p>
        </div>

        <button
          type="button"
          onClick={openModal}
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
          <span>Log Refueling</span>
        </button>
      </div>

      {/* MESSAGES */}

      {error && (
        <div
          style={{
            background: "#FEE2E2",
            border: "1px solid #FCA5A5",
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
            border: "1px solid #86EFAC",
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
          placeholder="Search by vehicle, registration, route, or log ID..."
          value={searchTerm}
          onChange={(event) =>
            setSearchTerm(event.target.value)
          }
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

      {/* EMPTY STATE */}

      {filteredLogs.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: "3rem",
            background: "#FFFFFF",
            borderRadius: "8px",
            border: "1px solid #E2E8F0",
          }}
        >
          <Fuel
            size={48}
            style={{
              color: "#94A3B8",
              marginBottom: "1rem",
            }}
          />

          <p style={{ color: "#64748B", margin: 0 }}>
            No fuel logs found.
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
                background: "#FFFFFF",
                borderRadius: "8px",
                border: "1px solid #E2E8F0",
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
                      background: "#FEF3C7",
                      color: "#D97706",
                      borderRadius: "6px",
                      display: "flex",
                    }}
                  >
                    <Fuel size={20} />
                  </div>

                  <div>
                    <h3
                      style={{
                        margin: 0,
                        fontSize: "1.05rem",
                        fontWeight: "600",
                      }}
                    >
                      {log.vehicle_name || "Unknown vehicle"}
                    </h3>

                    <span
                      style={{
                        fontSize: "0.8rem",
                        color: "#64748B",
                      }}
                    >
                      {log.registration_number || "N/A"}
                    </span>
                  </div>
                </div>

                <span
                  style={{
                    fontSize: "0.75rem",
                    fontWeight: "600",
                    fontFamily: "monospace",
                    color: "#64748B",
                  }}
                >
                  #{log.id}
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
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: "1rem",
                  }}
                >
                  <span
                    style={{
                      color: "#64748B",
                      display: "flex",
                      alignItems: "center",
                      gap: "0.25rem",
                    }}
                  >
                    <Calendar size={14} />
                    Date:
                  </span>

                  <span style={{ fontWeight: "500" }}>
                    {formatDate(log.log_date)}
                  </span>
                </div>

                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: "1rem",
                  }}
                >
                  <span
                    style={{
                      color: "#64748B",
                      display: "flex",
                      alignItems: "center",
                      gap: "0.25rem",
                    }}
                  >
                    <Droplet size={14} />
                    Refueled Volume:
                  </span>

                  <span
                    style={{
                      fontWeight: "600",
                      color: "#0F172A",
                    }}
                  >
                    {Number(log.liters).toLocaleString("en-IN")} L
                  </span>
                </div>

                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: "1rem",
                  }}
                >
                  <span
                    style={{
                      color: "#64748B",
                      display: "flex",
                      alignItems: "center",
                      gap: "0.25rem",
                    }}
                  >
                    <IndianRupee size={14} />
                    Total Cost:
                  </span>

                  <span
                    style={{
                      fontWeight: "600",
                      color: "#16A34A",
                    }}
                  >
                    ₹
                    {Number(log.cost || 0).toLocaleString(
                      "en-IN"
                    )}
                  </span>
                </div>

                {log.trip_id && (
                  <div
                    style={{
                      marginTop: "0.35rem",
                      paddingTop: "0.65rem",
                      borderTop: "1px solid #F1F5F9",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.35rem",
                        color: "#475569",
                        marginBottom: "0.4rem",
                      }}
                    >
                      <Route size={14} />

                      <strong>Trip #{log.trip_id}</strong>
                    </div>

                    {log.trip_source &&
                      log.trip_destination && (
                        <div
                          style={{
                            display: "flex",
                            alignItems: "flex-start",
                            gap: "0.35rem",
                            color: "#64748B",
                            fontSize: "0.8rem",
                          }}
                        >
                          <MapPin
                            size={13}
                            style={{
                              flexShrink: 0,
                              marginTop: "2px",
                            }}
                          />

                          <span>
                            {log.trip_source} →{" "}
                            {log.trip_destination}
                          </span>
                        </div>
                      )}
                  </div>
                )}

                {log.actual_distance !== null &&
                  log.actual_distance !== undefined && (
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        gap: "1rem",
                      }}
                    >
                      <span style={{ color: "#64748B" }}>
                        Actual Distance:
                      </span>

                      <span style={{ fontWeight: "500" }}>
                        {Number(
                          log.actual_distance
                        ).toLocaleString("en-IN")}{" "}
                        km
                      </span>
                    </div>
                  )}

                {log.fuel_efficiency !== null &&
                  log.fuel_efficiency !== undefined && (
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        gap: "1rem",
                        padding: "0.65rem",
                        background: "#EFF6FF",
                        borderRadius: "6px",
                        marginTop: "0.25rem",
                      }}
                    >
                      <span
                        style={{
                          color: "#2563EB",
                          display: "flex",
                          alignItems: "center",
                          gap: "0.3rem",
                          fontWeight: "500",
                        }}
                      >
                        <Gauge size={15} />
                        Fuel Efficiency:
                      </span>

                      <strong style={{ color: "#1D4ED8" }}>
                        {Number(log.fuel_efficiency).toFixed(2)} km/L
                      </strong>
                    </div>
                  )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* LOG REFUELING MODAL */}

      {showModal && (
        <div
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeModal();
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
              maxWidth: "560px",
              background: "#FFFFFF",
              borderRadius: "10px",
              padding: "1.5rem",
              maxHeight: "90vh",
              overflowY: "auto",
              boxShadow: "0 20px 40px rgba(0,0,0,0.2)",
            }}
          >
            {/* MODAL HEADER */}

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                marginBottom: "1.5rem",
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
                  Log Refueling
                </h2>

                <p
                  style={{
                    margin: "0.25rem 0 0",
                    color: "#64748B",
                    fontSize: "0.875rem",
                  }}
                >
                  Add a fuel transaction for a fleet vehicle.
                </p>
              </div>

              <button
                type="button"
                onClick={closeModal}
                disabled={submitting}
                style={{
                  border: "none",
                  background: "transparent",
                  cursor: submitting
                    ? "not-allowed"
                    : "pointer",
                  color: "#64748B",
                  display: "flex",
                }}
              >
                <X size={22} />
              </button>
            </div>

            <form onSubmit={handleCreateFuelLog}>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "1rem",
                }}
              >
                {/* VEHICLE */}

                <div>
                  <label style={labelStyle}>
                    <Truck size={14} />
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
                      Select vehicle
                    </option>

                    {vehicles.map((vehicle) => (
                      <option
                        key={vehicle.id}
                        value={vehicle.id}
                      >
                        {vehicle.vehicle_name} —{" "}
                        {vehicle.registration_number}
                      </option>
                    ))}
                  </select>
                </div>

                {/* OPTIONAL TRIP */}

                <div>
                  <label style={labelStyle}>
                    <Route size={14} />
                    Related Trip
                  </label>

                  <select
                    name="tripId"
                    value={formData.tripId}
                    onChange={handleChange}
                    disabled={!formData.vehicleId}
                    style={{
                      ...inputStyle,
                      background: !formData.vehicleId
                        ? "#F8FAFC"
                        : "#FFFFFF",
                    }}
                  >
                    <option value="">
                      No related trip
                    </option>

                    {availableTrips.map((trip) => (
                      <option
                        key={trip.id}
                        value={trip.id}
                      >
                        Trip #{trip.id} — {trip.source} →{" "}
                        {trip.destination} ({trip.status})
                      </option>
                    ))}
                  </select>

                  {formData.vehicleId &&
                    availableTrips.length === 0 && (
                      <p
                        style={{
                          color: "#64748B",
                          fontSize: "0.75rem",
                          margin: "0.35rem 0 0",
                        }}
                      >
                        No trips found for this vehicle. The fuel log
                        can still be created without a related trip.
                      </p>
                    )}
                </div>

                {/* LITERS */}

                <div>
                  <label style={labelStyle}>
                    <Droplet size={14} />
                    Liters *
                  </label>

                  <input
                    type="number"
                    name="liters"
                    value={formData.liters}
                    onChange={handleChange}
                    placeholder="Example: 120"
                    min="0.01"
                    step="0.01"
                    required
                    style={inputStyle}
                  />
                </div>

                {/* COST */}

                <div>
                  <label style={labelStyle}>
                    <IndianRupee size={14} />
                    Total Cost *
                  </label>

                  <input
                    type="number"
                    name="cost"
                    value={formData.cost}
                    onChange={handleChange}
                    placeholder="Example: 12000"
                    min="0"
                    step="0.01"
                    required
                    style={inputStyle}
                  />
                </div>

                {/* DATE */}

                <div>
                  <label style={labelStyle}>
                    <Calendar size={14} />
                    Log Date
                  </label>

                  <input
                    type="date"
                    name="logDate"
                    value={formData.logDate}
                    onChange={handleChange}
                    style={inputStyle}
                  />

                  <p
                    style={{
                      margin: "0.35rem 0 0",
                      fontSize: "0.75rem",
                      color: "#64748B",
                    }}
                  >
                    Leave empty to use today's date.
                  </p>
                </div>

                {/* ACTION BUTTONS */}

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
                    onClick={closeModal}
                    disabled={submitting}
                    style={{
                      padding: "0.625rem 1rem",
                      border: "1px solid #CBD5E1",
                      background: "#FFFFFF",
                      color: "#475569",
                      borderRadius: "6px",
                      cursor: submitting
                        ? "not-allowed"
                        : "pointer",
                      fontWeight: "600",
                    }}
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={submitting}
                    style={{
                      padding: "0.625rem 1rem",
                      border: "none",
                      background: submitting
                        ? "#93C5FD"
                        : "#2563EB",
                      color: "#FFFFFF",
                      borderRadius: "6px",
                      cursor: submitting
                        ? "not-allowed"
                        : "pointer",
                      fontWeight: "600",
                    }}
                  >
                    {submitting
                      ? "Saving..."
                      : "Save Fuel Log"}
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

const labelStyle = {
  display: "flex",
  alignItems: "center",
  gap: "0.35rem",
  marginBottom: "0.4rem",
  fontWeight: "600",
  fontSize: "0.875rem",
  color: "#334155",
};

const inputStyle = {
  width: "100%",
  padding: "0.625rem 0.75rem",
  border: "1px solid #CBD5E1",
  borderRadius: "6px",
  outline: "none",
  boxSizing: "border-box",
  fontFamily: "inherit",
  color: "#0F172A",
};

export default FuelTrackerPage;