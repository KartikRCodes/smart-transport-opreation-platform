import { useEffect, useState } from "react";
import axiosClient from "../api/axiosClient";
import {
  MapPin,
  Plus,
  Search,
  X,
  Truck,
  User,
  Package,
  Navigation,
  IndianRupee,
  Send,
  CheckCircle,
  Ban,
} from "lucide-react";

const initialFormData = {
  vehicle_id: "",
  driver_id: "",
  source: "",
  destination: "",
  cargo_weight: "",
  planned_distance: "",
  revenue: "",
};

const initialCompleteFormData = {
  final_odometer: "",
  fuel_consumed: "",
};

const TripsPage = () => {
  const [trips, setTrips] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [drivers, setDrivers] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionMessage, setActionMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const [showAddModal, setShowAddModal] = useState(false);
  const [showCompleteModal, setShowCompleteModal] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionTripId, setActionTripId] = useState(null);
  const [selectedTrip, setSelectedTrip] = useState(null);

  const [formData, setFormData] = useState(initialFormData);
  const [completeFormData, setCompleteFormData] = useState(
    initialCompleteFormData
  );

  // ============================================
  // FETCH TRIPS
  // ============================================

  const fetchTrips = async () => {
    try {
      setError("");

      const response = await axiosClient.get("/trips");

      const tripData = response.data?.data?.trips;

      if (!Array.isArray(tripData)) {
        throw new Error("Invalid trip response from server");
      }

      setTrips(tripData);
    } catch (err) {
      console.error("Error fetching trips:", err);

      setError(
        err.response?.data?.message ||
          err.message ||
          "Failed to load trips from backend server."
      );
    } finally {
      setLoading(false);
    }
  };

  // ============================================
  // FETCH AVAILABLE VEHICLES AND DRIVERS
  // ============================================

  const fetchAvailableAssets = async () => {
    try {
      const [vehiclesResponse, driversResponse] = await Promise.all([
        axiosClient.get("/vehicles"),
        axiosClient.get("/drivers"),
      ]);

      const vehicleData =
        vehiclesResponse.data?.data?.vehicles || [];

      const driverData =
        driversResponse.data?.data?.drivers || [];

      setVehicles(
        vehicleData.filter(
          (vehicle) => vehicle.status === "Available"
        )
      );

      setDrivers(
        driverData.filter(
          (driver) => driver.status === "Available"
        )
      );
    } catch (err) {
      console.error("Error fetching available assets:", err);

      setError(
        err.response?.data?.message ||
          err.message ||
          "Failed to load available vehicles and drivers."
      );
    }
  };

  // ============================================
  // INITIAL PAGE LOAD
  // ============================================

  useEffect(() => {
    const loadPage = async () => {
      await Promise.all([
        fetchTrips(),
        fetchAvailableAssets(),
      ]);
    };

    loadPage();
  }, []);

  // ============================================
  // CREATE TRIP FORM HANDLERS
  // ============================================

  const handleInputChange = (event) => {
    const { name, value } = event.target;

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const openAddModal = async () => {
    setError("");
    setActionMessage("");

    await fetchAvailableAssets();

    setShowAddModal(true);
  };

  const closeAddModal = () => {
    if (isSubmitting) {
      return;
    }

    setShowAddModal(false);
    setFormData(initialFormData);
  };

  // ============================================
  // CREATE TRIP
  // ============================================

  const handleCreateTrip = async (event) => {
    event.preventDefault();

    try {
      setIsSubmitting(true);
      setError("");
      setActionMessage("");

      const payload = {
        vehicleId: Number(formData.vehicle_id),
        driverId: Number(formData.driver_id),
        source: formData.source.trim(),
        destination: formData.destination.trim(),
        cargoWeight: Number(formData.cargo_weight),
        plannedDistance: Number(formData.planned_distance),
        revenue: Number(formData.revenue || 0),
      };

      const response = await axiosClient.post("/trips", payload);

      setShowAddModal(false);
      setFormData(initialFormData);

      setActionMessage(
        response.data?.message || "Trip created successfully"
      );

      await fetchTrips();
    } catch (err) {
      console.error("Create trip error:", err);

      setError(
        err.response?.data?.message ||
          err.message ||
          "Failed to create trip."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // ============================================
  // DISPATCH TRIP
  // ============================================

  const handleDispatchTrip = async (tripId) => {
    const confirmed = window.confirm(
      `Dispatch Trip #${tripId}? The assigned vehicle and driver will be marked On Trip.`
    );

    if (!confirmed) {
      return;
    }

    try {
      setActionTripId(tripId);
      setError("");
      setActionMessage("");

      const response = await axiosClient.patch(
        `/trips/${tripId}/dispatch`
      );

      setActionMessage(
        response.data?.message || "Trip dispatched successfully"
      );

      await Promise.all([
        fetchTrips(),
        fetchAvailableAssets(),
      ]);
    } catch (err) {
      console.error("Dispatch trip error:", err);

      setError(
        err.response?.data?.message ||
          err.message ||
          "Failed to dispatch trip."
      );
    } finally {
      setActionTripId(null);
    }
  };

  // ============================================
  // CANCEL TRIP
  // ============================================

  const handleCancelTrip = async (tripId) => {
    const confirmed = window.confirm(
      `Cancel Trip #${tripId}?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setActionTripId(tripId);
      setError("");
      setActionMessage("");

      const response = await axiosClient.patch(
        `/trips/${tripId}/cancel`
      );

      setActionMessage(
        response.data?.message || "Trip cancelled successfully"
      );

      await Promise.all([
        fetchTrips(),
        fetchAvailableAssets(),
      ]);
    } catch (err) {
      console.error("Cancel trip error:", err);

      setError(
        err.response?.data?.message ||
          err.message ||
          "Failed to cancel trip."
      );
    } finally {
      setActionTripId(null);
    }
  };

  // ============================================
  // COMPLETE TRIP MODAL
  // ============================================

  const openCompleteModal = (trip) => {
    setError("");
    setActionMessage("");
    setSelectedTrip(trip);
    setCompleteFormData(initialCompleteFormData);
    setShowCompleteModal(true);
  };

  const closeCompleteModal = () => {
    if (isSubmitting) {
      return;
    }

    setShowCompleteModal(false);
    setSelectedTrip(null);
    setCompleteFormData(initialCompleteFormData);
  };

  const handleCompleteInputChange = (event) => {
    const { name, value } = event.target;

    setCompleteFormData((current) => ({
      ...current,
      [name]: value,
    }));
  };

  // ============================================
  // COMPLETE TRIP
  // ============================================

  const handleCompleteTrip = async (event) => {
    event.preventDefault();

    if (!selectedTrip) {
      return;
    }

    try {
      setIsSubmitting(true);
      setError("");
      setActionMessage("");

      const payload = {
        finalOdometer: Number(
          completeFormData.final_odometer
        ),
      };

      if (completeFormData.fuel_consumed !== "") {
        payload.fuelConsumed = Number(
          completeFormData.fuel_consumed
        );
      }

      const response = await axiosClient.patch(
        `/trips/${selectedTrip.id}/complete`,
        payload
      );

      setShowCompleteModal(false);
      setSelectedTrip(null);
      setCompleteFormData(initialCompleteFormData);

      setActionMessage(
        response.data?.message || "Trip completed successfully"
      );

      await Promise.all([
        fetchTrips(),
        fetchAvailableAssets(),
      ]);
    } catch (err) {
      console.error("Complete trip error:", err);

      setError(
        err.response?.data?.message ||
          err.message ||
          "Failed to complete trip."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // ============================================
  // STATUS STYLES
  // ============================================

  const getStatusStyle = (status) => {
    switch (status) {
      case "Draft":
        return {
          background: "#F1F5F9",
          color: "#475569",
        };

      case "Dispatched":
        return {
          background: "#DBEAFE",
          color: "#2563EB",
        };

      case "Completed":
        return {
          background: "#DCFCE7",
          color: "#16A34A",
        };

      case "Cancelled":
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

  const formatDateTime = (dateValue) => {
    if (!dateValue) {
      return "Not dispatched";
    }

    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) {
      return "Invalid date";
    }

    return date.toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // ============================================
  // SEARCH
  // ============================================

  const filteredTrips = trips.filter((trip) => {
    const search = searchTerm.trim().toLowerCase();

    if (!search) {
      return true;
    }

    return (
      String(trip.id).includes(search) ||
      trip.source?.toLowerCase().includes(search) ||
      trip.destination?.toLowerCase().includes(search) ||
      trip.driver_name?.toLowerCase().includes(search) ||
      trip.vehicle_name?.toLowerCase().includes(search) ||
      trip.registration_number?.toLowerCase().includes(search) ||
      trip.status?.toLowerCase().includes(search)
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
        <h3>Loading dispatcher registry...</h3>
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
            Trips & Dispatches
          </h1>

          <p style={{ color: "#64748B", margin: 0 }}>
            Create, dispatch, monitor, and manage cargo trips.
          </p>
        </div>

        <button
          type="button"
          onClick={openAddModal}
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
          <span>Create New Trip</span>
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
          placeholder="Search by trip, route, driver, vehicle or status..."
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

      {/* Success Message */}
      {actionMessage && (
        <div
          style={{
            background: "#DCFCE7",
            border: "1px solid #86EFAC",
            color: "#15803D",
            padding: "1rem",
            borderRadius: "6px",
            marginBottom: "1.5rem",
          }}
        >
          {actionMessage}
        </div>
      )}

      {/* Error Message */}
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

      {/* Trips Table */}
      <div
        style={{
          background: "#FFFFFF",
          border: "1px solid #E2E8F0",
          borderRadius: "8px",
          overflowX: "auto",
          boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
        }}
      >
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            textAlign: "left",
            fontSize: "0.875rem",
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
              <th style={{ padding: "1rem" }}>Trip ID</th>
              <th style={{ padding: "1rem" }}>Route Manifest</th>
              <th style={{ padding: "1rem" }}>Assigned Assets</th>
              <th style={{ padding: "1rem" }}>Cargo / Distance</th>
              <th style={{ padding: "1rem" }}>Dispatch Time</th>
              <th style={{ padding: "1rem" }}>Status</th>
              <th style={{ padding: "1rem" }}>Actions</th>
            </tr>
          </thead>

          <tbody>
            {filteredTrips.length === 0 ? (
              <tr>
                <td
                  colSpan="7"
                  style={{
                    padding: "3rem",
                    textAlign: "center",
                    color: "#64748B",
                  }}
                >
                  No trips found.
                </td>
              </tr>
            ) : (
              filteredTrips.map((trip) => {
                const statusStyle = getStatusStyle(trip.status);
                const isActionRunning =
                  actionTripId === trip.id;

                return (
                  <tr
                    key={trip.id}
                    style={{
                      borderBottom: "1px solid #F1F5F9",
                      color: "#0F172A",
                    }}
                  >
                    <td
                      style={{
                        padding: "1rem",
                        fontWeight: "600",
                        fontFamily: "monospace",
                        color: "#2563EB",
                      }}
                    >
                      #{trip.id}
                    </td>

                    <td style={{ padding: "1rem" }}>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "0.5rem",
                          fontWeight: "500",
                        }}
                      >
                        <MapPin
                          size={16}
                          style={{ color: "#64748B" }}
                        />
                        {trip.source} → {trip.destination}
                      </div>
                    </td>

                    <td style={{ padding: "1rem" }}>
                      <div style={{ fontWeight: "500" }}>
                        {trip.driver_name || "Unknown driver"}
                      </div>

                      <div
                        style={{
                          fontSize: "0.75rem",
                          color: "#64748B",
                          marginTop: "0.2rem",
                        }}
                      >
                        {trip.vehicle_name || "Unknown vehicle"} ·{" "}
                        {trip.registration_number || "N/A"}
                      </div>
                    </td>

                    <td style={{ padding: "1rem" }}>
                      <div>
                        {Number(
                          trip.cargo_weight || 0
                        ).toLocaleString()}{" "}
                        kg
                      </div>

                      <div
                        style={{
                          fontSize: "0.75rem",
                          color: "#64748B",
                          marginTop: "0.2rem",
                        }}
                      >
                        {Number(
                          trip.planned_distance || 0
                        ).toLocaleString()}{" "}
                        km planned
                      </div>
                    </td>

                    <td
                      style={{
                        padding: "1rem",
                        color: "#475569",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {formatDateTime(trip.dispatched_at)}
                    </td>

                    <td style={{ padding: "1rem" }}>
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
                        {trip.status}
                      </span>
                    </td>

                    <td style={{ padding: "1rem" }}>
                      <div
                        style={{
                          display: "flex",
                          flexWrap: "wrap",
                          gap: "0.5rem",
                        }}
                      >
                        {trip.status === "Draft" && (
                          <button
                            type="button"
                            disabled={isActionRunning}
                            onClick={() =>
                              handleDispatchTrip(trip.id)
                            }
                            style={{
                              ...actionButtonStyle,
                              background: "#2563EB",
                              color: "#FFFFFF",
                            }}
                          >
                            <Send size={14} />
                            Dispatch
                          </button>
                        )}

                        {trip.status === "Dispatched" && (
                          <button
                            type="button"
                            disabled={isActionRunning}
                            onClick={() =>
                              openCompleteModal(trip)
                            }
                            style={{
                              ...actionButtonStyle,
                              background: "#DCFCE7",
                              color: "#15803D",
                            }}
                          >
                            <CheckCircle size={14} />
                            Complete
                          </button>
                        )}

                        {(trip.status === "Draft" ||
                          trip.status === "Dispatched") && (
                          <button
                            type="button"
                            disabled={isActionRunning}
                            onClick={() =>
                              handleCancelTrip(trip.id)
                            }
                            style={{
                              ...actionButtonStyle,
                              background: "#FEE2E2",
                              color: "#DC2626",
                            }}
                          >
                            <Ban size={14} />
                            Cancel
                          </button>
                        )}

                        {trip.status === "Completed" && (
                          <span
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "0.3rem",
                              color: "#16A34A",
                              fontWeight: "600",
                              fontSize: "0.8rem",
                            }}
                          >
                            <CheckCircle size={15} />
                            Finished
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Create Trip Modal */}
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
              maxWidth: "700px",
              maxHeight: "90vh",
              overflowY: "auto",
              background: "#FFFFFF",
              borderRadius: "10px",
              padding: "1.5rem",
              boxShadow: "0 20px 40px rgba(0,0,0,0.2)",
            }}
          >
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
                  Create New Trip
                </h2>

                <p
                  style={{
                    margin: "0.25rem 0 0",
                    color: "#64748B",
                    fontSize: "0.875rem",
                  }}
                >
                  Create a draft trip using an available vehicle and
                  driver.
                </p>
              </div>

              <button
                type="button"
                onClick={closeAddModal}
                disabled={isSubmitting}
                style={{
                  border: "none",
                  background: "transparent",
                  cursor: isSubmitting
                    ? "not-allowed"
                    : "pointer",
                  color: "#64748B",
                  display: "flex",
                }}
              >
                <X size={22} />
              </button>
            </div>

            <form onSubmit={handleCreateTrip}>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "repeat(auto-fit, minmax(250px, 1fr))",
                  gap: "1rem",
                }}
              >
                <div>
                  <label style={labelStyle}>
                    <Truck size={14} />
                    Vehicle *
                  </label>

                  <select
                    name="vehicle_id"
                    value={formData.vehicle_id}
                    onChange={handleInputChange}
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
                        {vehicle.vehicle_name} —{" "}
                        {vehicle.registration_number}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={labelStyle}>
                    <User size={14} />
                    Driver *
                  </label>

                  <select
                    name="driver_id"
                    value={formData.driver_id}
                    onChange={handleInputChange}
                    required
                    style={inputStyle}
                  >
                    <option value="">
                      Select available driver
                    </option>

                    {drivers.map((driver) => (
                      <option
                        key={driver.id}
                        value={driver.id}
                      >
                        {driver.name} —{" "}
                        {driver.license_number}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={labelStyle}>
                    <MapPin size={14} />
                    Source *
                  </label>

                  <input
                    type="text"
                    name="source"
                    value={formData.source}
                    onChange={handleInputChange}
                    placeholder="Ahmedabad Hub"
                    required
                    style={inputStyle}
                  />
                </div>

                <div>
                  <label style={labelStyle}>
                    <Navigation size={14} />
                    Destination *
                  </label>

                  <input
                    type="text"
                    name="destination"
                    value={formData.destination}
                    onChange={handleInputChange}
                    placeholder="Mumbai Port"
                    required
                    style={inputStyle}
                  />
                </div>

                <div>
                  <label style={labelStyle}>
                    <Package size={14} />
                    Cargo Weight (kg) *
                  </label>

                  <input
                    type="number"
                    name="cargo_weight"
                    value={formData.cargo_weight}
                    onChange={handleInputChange}
                    min="0.01"
                    step="0.01"
                    required
                    style={inputStyle}
                  />
                </div>

                <div>
                  <label style={labelStyle}>
                    <Navigation size={14} />
                    Planned Distance (km) *
                  </label>

                  <input
                    type="number"
                    name="planned_distance"
                    value={formData.planned_distance}
                    onChange={handleInputChange}
                    min="0.01"
                    step="0.01"
                    required
                    style={inputStyle}
                  />
                </div>

                <div>
                  <label style={labelStyle}>
                    <IndianRupee size={14} />
                    Revenue
                  </label>

                  <input
                    type="number"
                    name="revenue"
                    value={formData.revenue}
                    onChange={handleInputChange}
                    min="0"
                    step="0.01"
                    placeholder="0"
                    style={inputStyle}
                  />
                </div>
              </div>

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
                  {isSubmitting
                    ? "Creating..."
                    : "Create Draft Trip"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Complete Trip Modal */}
      {showCompleteModal && selectedTrip && (
        <div
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeCompleteModal();
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
              maxWidth: "500px",
              background: "#FFFFFF",
              borderRadius: "10px",
              padding: "1.5rem",
              boxShadow: "0 20px 40px rgba(0,0,0,0.2)",
            }}
          >
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
                  Complete Trip #{selectedTrip.id}
                </h2>

                <p
                  style={{
                    margin: "0.25rem 0 0",
                    color: "#64748B",
                    fontSize: "0.875rem",
                  }}
                >
                  {selectedTrip.source} →{" "}
                  {selectedTrip.destination}
                </p>
              </div>

              <button
                type="button"
                onClick={closeCompleteModal}
                disabled={isSubmitting}
                style={{
                  border: "none",
                  background: "transparent",
                  cursor: isSubmitting
                    ? "not-allowed"
                    : "pointer",
                  color: "#64748B",
                  display: "flex",
                }}
              >
                <X size={22} />
              </button>
            </div>

            <form onSubmit={handleCompleteTrip}>
              <div style={{ marginBottom: "1rem" }}>
                <label style={labelStyle}>
                  Final Odometer (km) *
                </label>

                <input
                  type="number"
                  name="final_odometer"
                  value={completeFormData.final_odometer}
                  onChange={handleCompleteInputChange}
                  placeholder="Enter final vehicle odometer"
                  min="0"
                  step="0.01"
                  required
                  style={inputStyle}
                />
              </div>

              <div style={{ marginBottom: "1rem" }}>
                <label style={labelStyle}>
                  Fuel Consumed (liters)
                </label>

                <input
                  type="number"
                  name="fuel_consumed"
                  value={completeFormData.fuel_consumed}
                  onChange={handleCompleteInputChange}
                  placeholder="Optional"
                  min="0.01"
                  step="0.01"
                  style={inputStyle}
                />
              </div>

              <div
                style={{
                  padding: "0.75rem",
                  background: "#F8FAFC",
                  border: "1px solid #E2E8F0",
                  borderRadius: "6px",
                  marginBottom: "1.5rem",
                  fontSize: "0.8rem",
                  color: "#475569",
                }}
              >
                Completing this trip will update the vehicle odometer
                and make both the assigned vehicle and driver
                available again.
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: "0.75rem",
                }}
              >
                <button
                  type="button"
                  onClick={closeCompleteModal}
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
                      ? "#86EFAC"
                      : "#16A34A",
                    color: "#FFFFFF",
                    border: "none",
                    borderRadius: "6px",
                    cursor: isSubmitting
                      ? "not-allowed"
                      : "pointer",
                    fontWeight: "600",
                  }}
                >
                  {isSubmitting
                    ? "Completing..."
                    : "Complete Trip"}
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
  display: "flex",
  alignItems: "center",
  gap: "0.35rem",
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

const actionButtonStyle = {
  display: "flex",
  alignItems: "center",
  gap: "0.3rem",
  border: "none",
  borderRadius: "5px",
  padding: "0.4rem 0.6rem",
  fontSize: "0.75rem",
  fontWeight: "600",
  cursor: "pointer",
};

export default TripsPage;