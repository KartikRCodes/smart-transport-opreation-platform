const pool = require("../config/db");

// ============================================
// CREATE FUEL LOG
// ============================================

const createFuelLog = async (req, res) => {
  try {
    const {
      vehicleId,
      tripId,
      liters,
      cost,
      logDate,
    } = req.body;

    if (!vehicleId || liters === undefined || cost === undefined) {
      return res.status(400).json({
        success: false,
        message: "Vehicle ID, liters, and cost are required",
      });
    }

    const fuelLiters = Number(liters);
    const fuelCost = Number(cost);

    if (!Number.isFinite(fuelLiters) || fuelLiters <= 0) {
      return res.status(400).json({
        success: false,
        message: "Liters must be greater than 0",
      });
    }

    if (!Number.isFinite(fuelCost) || fuelCost < 0) {
      return res.status(400).json({
        success: false,
        message: "Fuel cost cannot be negative",
      });
    }

    // Check vehicle exists
    const vehicleResult = await pool.query(
      `
        SELECT id, registration_number
        FROM vehicles
        WHERE id = $1
      `,
      [vehicleId]
    );

    if (vehicleResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Vehicle not found",
      });
    }

    // If tripId is provided, validate the trip
    if (tripId !== undefined && tripId !== null) {
      const tripResult = await pool.query(
        `
          SELECT id, vehicle_id
          FROM trips
          WHERE id = $1
        `,
        [tripId]
      );

      if (tripResult.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Trip not found",
        });
      }

      const trip = tripResult.rows[0];

      // Prevent assigning a fuel log to a trip belonging
      // to a different vehicle.
      if (Number(trip.vehicle_id) !== Number(vehicleId)) {
        return res.status(400).json({
          success: false,
          message: "Trip does not belong to the selected vehicle",
        });
      }
    }

    const result = await pool.query(
      `
        INSERT INTO fuel_logs (
          vehicle_id,
          trip_id,
          liters,
          cost,
          log_date
        )
        VALUES (
          $1,
          $2,
          $3,
          $4,
          COALESCE($5::date, CURRENT_DATE)
        )
        RETURNING *
      `,
      [
        vehicleId,
        tripId ?? null,
        fuelLiters,
        fuelCost,
        logDate || null,
      ]
    );

    return res.status(201).json({
      success: true,
      message: "Fuel log created successfully",
      data: {
        fuelLog: result.rows[0],
      },
    });
  } catch (error) {
    console.error("Create fuel log error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// ============================================
// GET ALL FUEL LOGS
// ============================================

const getFuelLogs = async (req, res) => {
  try {
    const result = await pool.query(
      `
        SELECT
          f.*,
          v.registration_number,
          v.vehicle_name,
          t.source AS trip_source,
          t.destination AS trip_destination,
          t.actual_distance,
          CASE
            WHEN t.actual_distance IS NOT NULL
              AND f.liters > 0
            THEN ROUND(t.actual_distance / f.liters, 2)
            ELSE NULL
          END AS fuel_efficiency
        FROM fuel_logs f
        JOIN vehicles v
          ON v.id = f.vehicle_id
        LEFT JOIN trips t
          ON t.id = f.trip_id
        ORDER BY f.created_at DESC
      `
    );

    return res.status(200).json({
      success: true,
      count: result.rows.length,
      data: {
        fuelLogs: result.rows,
      },
    });
  } catch (error) {
    console.error("Get fuel logs error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

module.exports = {
  createFuelLog,
  getFuelLogs,
};