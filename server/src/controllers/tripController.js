const pool = require("../config/db");

// ============================================
// CREATE TRIP
// ============================================

const createTrip = async (req, res) => {
    try {
        const {
            vehicleId,
            driverId,
            source,
            destination,
            cargoWeight,
            plannedDistance,
            revenue,
        } = req.body;

        if (
            !vehicleId ||
            !driverId ||
            !source ||
            !destination ||
            cargoWeight === undefined ||
            plannedDistance === undefined
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Vehicle, driver, source, destination, cargo weight, and planned distance are required",
            });
        }

        const cargo = Number(cargoWeight);
        const distance = Number(plannedDistance);
        const tripRevenue = Number(revenue ?? 0);

        if (!Number.isFinite(cargo) || cargo <= 0) {
            return res.status(400).json({
                success: false,
                message: "Cargo weight must be greater than 0",
            });
        }

        if (!Number.isFinite(distance) || distance <= 0) {
            return res.status(400).json({
                success: false,
                message: "Planned distance must be greater than 0",
            });
        }

        if (!Number.isFinite(tripRevenue) || tripRevenue < 0) {
            return res.status(400).json({
                success: false,
                message: "Revenue cannot be negative",
            });
        }

        const vehicleResult = await pool.query(
            `
        SELECT id, registration_number, max_load_capacity, status
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

        const vehicle = vehicleResult.rows[0];

        if (vehicle.status === "Retired") {
            return res.status(409).json({
                success: false,
                message: "Retired vehicle cannot be assigned to a trip",
            });
        }

        if (cargo > Number(vehicle.max_load_capacity)) {
            return res.status(400).json({
                success: false,
                message: "Cargo weight exceeds vehicle maximum load capacity",
            });
        }

        const driverResult = await pool.query(
            `
        SELECT id, name, status, license_expiry_date
        FROM drivers
        WHERE id = $1
      `,
            [driverId]
        );

        if (driverResult.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Driver not found",
            });
        }

        const result = await pool.query(
            `
        INSERT INTO trips (
          vehicle_id,
          driver_id,
          source,
          destination,
          cargo_weight,
          planned_distance,
          revenue,
          status
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, 'Draft')
        RETURNING *
      `,
            [
                vehicleId,
                driverId,
                source.trim(),
                destination.trim(),
                cargo,
                distance,
                tripRevenue,
            ]
        );

        return res.status(201).json({
            success: true,
            message: "Trip created successfully",
            data: {
                trip: result.rows[0],
            },
        });
    } catch (error) {
        console.error("Create trip error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};

// ============================================
// GET ALL TRIPS
// ============================================

const getTrips = async (req, res) => {
    try {
        const result = await pool.query(
            `
        SELECT
          t.*,
          v.registration_number,
          v.vehicle_name,
          d.name AS driver_name
        FROM trips t
        JOIN vehicles v ON v.id = t.vehicle_id
        JOIN drivers d ON d.id = t.driver_id
        ORDER BY t.created_at DESC
      `
        );

        return res.status(200).json({
            success: true,
            count: result.rows.length,
            data: {
                trips: result.rows,
            },
        });
    } catch (error) {
        console.error("Get trips error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};

// ============================================
// GET TRIP BY ID
// ============================================

const getTripById = async (req, res) => {
    try {
        const { id } = req.params;

        const result = await pool.query(
            `
        SELECT
          t.*,
          v.registration_number,
          v.vehicle_name,
          v.max_load_capacity,
          v.odometer AS vehicle_odometer,
          d.name AS driver_name,
          d.license_number,
          d.license_expiry_date,
          d.safety_score
        FROM trips t
        JOIN vehicles v ON v.id = t.vehicle_id
        JOIN drivers d ON d.id = t.driver_id
        WHERE t.id = $1
      `,
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Trip not found",
            });
        }

        return res.status(200).json({
            success: true,
            data: {
                trip: result.rows[0],
            },
        });
    } catch (error) {
        console.error("Get trip error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};

// ============================================
// UPDATE DRAFT TRIP
// ============================================

const updateTrip = async (req, res) => {
    try {
        const { id } = req.params;

        const existingResult = await pool.query(
            "SELECT * FROM trips WHERE id = $1",
            [id]
        );

        if (existingResult.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Trip not found",
            });
        }

        const existing = existingResult.rows[0];

        if (existing.status !== "Draft") {
            return res.status(409).json({
                success: false,
                message: "Only draft trips can be edited",
            });
        }

        const {
            vehicleId,
            driverId,
            source,
            destination,
            cargoWeight,
            plannedDistance,
            revenue,
        } = req.body;

        const newVehicleId = vehicleId ?? existing.vehicle_id;
        const newDriverId = driverId ?? existing.driver_id;

        const cargo = Number(cargoWeight ?? existing.cargo_weight);
        const distance = Number(
            plannedDistance ?? existing.planned_distance
        );
        const tripRevenue = Number(revenue ?? existing.revenue);

        if (!Number.isFinite(cargo) || cargo <= 0) {
            return res.status(400).json({
                success: false,
                message: "Cargo weight must be greater than 0",
            });
        }

        if (!Number.isFinite(distance) || distance <= 0) {
            return res.status(400).json({
                success: false,
                message: "Planned distance must be greater than 0",
            });
        }

        if (!Number.isFinite(tripRevenue) || tripRevenue < 0) {
            return res.status(400).json({
                success: false,
                message: "Revenue cannot be negative",
            });
        }

        const vehicleResult = await pool.query(
            `
        SELECT id, max_load_capacity, status
        FROM vehicles
        WHERE id = $1
      `,
            [newVehicleId]
        );

        if (vehicleResult.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Vehicle not found",
            });
        }

        const vehicle = vehicleResult.rows[0];

        if (vehicle.status === "Retired") {
            return res.status(409).json({
                success: false,
                message: "Retired vehicle cannot be assigned to a trip",
            });
        }

        if (cargo > Number(vehicle.max_load_capacity)) {
            return res.status(400).json({
                success: false,
                message: "Cargo weight exceeds vehicle maximum load capacity",
            });
        }

        const driverResult = await pool.query(
            "SELECT id FROM drivers WHERE id = $1",
            [newDriverId]
        );

        if (driverResult.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Driver not found",
            });
        }

        const result = await pool.query(
            `
        UPDATE trips
        SET
          vehicle_id = $1,
          driver_id = $2,
          source = $3,
          destination = $4,
          cargo_weight = $5,
          planned_distance = $6,
          revenue = $7,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = $8
        RETURNING *
      `,
            [
                newVehicleId,
                newDriverId,
                (source ?? existing.source).trim(),
                (destination ?? existing.destination).trim(),
                cargo,
                distance,
                tripRevenue,
                id,
            ]
        );

        return res.status(200).json({
            success: true,
            message: "Trip updated successfully",
            data: {
                trip: result.rows[0],
            },
        });
    } catch (error) {
        console.error("Update trip error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};

// ============================================
// DISPATCH TRIP
// ============================================

const dispatchTrip = async (req, res) => {
    const client = await pool.connect();

    try {
        await client.query("BEGIN");

        const { id } = req.params;

        const tripResult = await client.query(
            `
        SELECT *
        FROM trips
        WHERE id = $1
        FOR UPDATE
      `,
            [id]
        );

        if (tripResult.rows.length === 0) {
            await client.query("ROLLBACK");

            return res.status(404).json({
                success: false,
                message: "Trip not found",
            });
        }

        const trip = tripResult.rows[0];

        if (trip.status !== "Draft") {
            await client.query("ROLLBACK");

            return res.status(409).json({
                success: false,
                message: "Only draft trips can be dispatched",
            });
        }

        const vehicleResult = await client.query(
            `
        SELECT *
        FROM vehicles
        WHERE id = $1
        FOR UPDATE
      `,
            [trip.vehicle_id]
        );

        const driverResult = await client.query(
            `
        SELECT *
        FROM drivers
        WHERE id = $1
        FOR UPDATE
      `,
            [trip.driver_id]
        );

        if (vehicleResult.rows.length === 0) {
            await client.query("ROLLBACK");

            return res.status(404).json({
                success: false,
                message: "Vehicle not found",
            });
        }

        if (driverResult.rows.length === 0) {
            await client.query("ROLLBACK");

            return res.status(404).json({
                success: false,
                message: "Driver not found",
            });
        }

        const vehicle = vehicleResult.rows[0];
        const driver = driverResult.rows[0];

        if (vehicle.status !== "Available") {
            await client.query("ROLLBACK");

            return res.status(409).json({
                success: false,
                message: "Vehicle is not available for dispatch",
            });
        }

        if (driver.status !== "Available") {
            await client.query("ROLLBACK");

            return res.status(409).json({
                success: false,
                message: "Driver is not available for dispatch",
            });
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const licenseExpiry = new Date(driver.license_expiry_date);
        licenseExpiry.setHours(0, 0, 0, 0);

        if (licenseExpiry < today) {
            await client.query("ROLLBACK");

            return res.status(409).json({
                success: false,
                message: "Driver license has expired",
            });
        }

        if (
            Number(trip.cargo_weight) >
            Number(vehicle.max_load_capacity)
        ) {
            await client.query("ROLLBACK");

            return res.status(400).json({
                success: false,
                message: "Cargo weight exceeds vehicle maximum load capacity",
            });
        }

        const updatedTrip = await client.query(
            `
        UPDATE trips
        SET
          status = 'Dispatched',
          dispatched_at = CURRENT_TIMESTAMP,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = $1
        RETURNING *
      `,
            [id]
        );

        await client.query(
            `
        UPDATE vehicles
        SET
          status = 'On Trip',
          updated_at = CURRENT_TIMESTAMP
        WHERE id = $1
      `,
            [trip.vehicle_id]
        );

        await client.query(
            `
        UPDATE drivers
        SET
          status = 'On Trip',
          updated_at = CURRENT_TIMESTAMP
        WHERE id = $1
      `,
            [trip.driver_id]
        );

        await client.query("COMMIT");

        return res.status(200).json({
            success: true,
            message: "Trip dispatched successfully",
            data: {
                trip: updatedTrip.rows[0],
            },
        });
    } catch (error) {
        await client.query("ROLLBACK");

        console.error("Dispatch trip error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    } finally {
        client.release();
    }
};

// ============================================
// COMPLETE TRIP
// ============================================

const completeTrip = async (req, res) => {
    const client = await pool.connect();

    try {
        await client.query("BEGIN");

        const { id } = req.params;
        const { finalOdometer, fuelConsumed } = req.body;

        if (finalOdometer === undefined) {
            await client.query("ROLLBACK");

            return res.status(400).json({
                success: false,
                message: "Final odometer is required",
            });
        }

        const finalOdo = Number(finalOdometer);
        const fuel =
            fuelConsumed === undefined ? null : Number(fuelConsumed);

        if (!Number.isFinite(finalOdo) || finalOdo < 0) {
            await client.query("ROLLBACK");

            return res.status(400).json({
                success: false,
                message: "Final odometer must be a valid non-negative number",
            });
        }

        if (
            fuel !== null &&
            (!Number.isFinite(fuel) || fuel <= 0)
        ) {
            await client.query("ROLLBACK");

            return res.status(400).json({
                success: false,
                message: "Fuel consumed must be greater than 0",
            });
        }

        const tripResult = await client.query(
            `
        SELECT *
        FROM trips
        WHERE id = $1
        FOR UPDATE
      `,
            [id]
        );

        if (tripResult.rows.length === 0) {
            await client.query("ROLLBACK");

            return res.status(404).json({
                success: false,
                message: "Trip not found",
            });
        }

        const trip = tripResult.rows[0];

        if (trip.status !== "Dispatched") {
            await client.query("ROLLBACK");

            return res.status(409).json({
                success: false,
                message: "Only dispatched trips can be completed",
            });
        }

        const vehicleResult = await client.query(
            `
        SELECT *
        FROM vehicles
        WHERE id = $1
        FOR UPDATE
      `,
            [trip.vehicle_id]
        );

        if (vehicleResult.rows.length === 0) {
            await client.query("ROLLBACK");

            return res.status(404).json({
                success: false,
                message: "Vehicle not found",
            });
        }

        const vehicle = vehicleResult.rows[0];

        if (finalOdo < Number(vehicle.odometer)) {
            await client.query("ROLLBACK");

            return res.status(400).json({
                success: false,
                message:
                    "Final odometer cannot be less than current vehicle odometer",
            });
        }

        const actualDistance =
            finalOdo - Number(vehicle.odometer);

        const updatedTrip = await client.query(
            `
        UPDATE trips
        SET
          status = 'Completed',
          final_odometer = $1,
          actual_distance = $2,
          completed_at = CURRENT_TIMESTAMP,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = $3
        RETURNING *
      `,
            [finalOdo, actualDistance, id]
        );

        await client.query(
            `
        UPDATE vehicles
        SET
          status = 'Available',
          odometer = $1,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = $2
      `,
            [finalOdo, trip.vehicle_id]
        );

        await client.query(
            `
        UPDATE drivers
        SET
          status = 'Available',
          updated_at = CURRENT_TIMESTAMP
        WHERE id = $1
      `,
            [trip.driver_id]
        );

        /*
          fuelConsumed is currently validated but not inserted into fuel_logs
          here. Fuel logging will be implemented in the Fuel module to avoid
          duplicate records and keep one clear source of truth.
        */

        await client.query("COMMIT");

        return res.status(200).json({
            success: true,
            message: "Trip completed successfully",
            data: {
                trip: updatedTrip.rows[0],
                fuel_consumed: fuel,
            },
        });
    } catch (error) {
        await client.query("ROLLBACK");

        console.error("Complete trip error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    } finally {
        client.release();
    }
};

// ============================================
// CANCEL TRIP
// ============================================

const cancelTrip = async (req, res) => {
    const client = await pool.connect();

    try {
        await client.query("BEGIN");

        const { id } = req.params;

        const tripResult = await client.query(
            `
        SELECT *
        FROM trips
        WHERE id = $1
        FOR UPDATE
      `,
            [id]
        );

        if (tripResult.rows.length === 0) {
            await client.query("ROLLBACK");

            return res.status(404).json({
                success: false,
                message: "Trip not found",
            });
        }

        const trip = tripResult.rows[0];

        if (
            trip.status === "Completed" ||
            trip.status === "Cancelled"
        ) {
            await client.query("ROLLBACK");

            return res.status(409).json({
                success: false,
                message: `${trip.status} trip cannot be cancelled`,
            });
        }

        const updatedTrip = await client.query(
            `
        UPDATE trips
SET
  status = 'Cancelled',
  cancelled_at = CURRENT_TIMESTAMP,
  updated_at = CURRENT_TIMESTAMP
WHERE id = $1
RETURNING *
      `,
            [id]
        );

        if (trip.status === "Dispatched") {
            await client.query(
                `
          UPDATE vehicles
          SET
            status = 'Available',
            updated_at = CURRENT_TIMESTAMP
          WHERE id = $1
        `,
                [trip.vehicle_id]
            );

            await client.query(
                `
          UPDATE drivers
          SET
            status = 'Available',
            updated_at = CURRENT_TIMESTAMP
          WHERE id = $1
        `,
                [trip.driver_id]
            );
        }

        await client.query("COMMIT");

        return res.status(200).json({
            success: true,
            message: "Trip cancelled successfully",
            data: {
                trip: updatedTrip.rows[0],
            },
        });
    } catch (error) {
        await client.query("ROLLBACK");

        console.error("Cancel trip error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    } finally {
        client.release();
    }
};

module.exports = {
    createTrip,
    getTrips,
    getTripById,
    updateTrip,
    dispatchTrip,
    completeTrip,
    cancelTrip,
};