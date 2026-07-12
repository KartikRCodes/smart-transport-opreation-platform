const pool = require("../config/db");

// ============================================
// CREATE MAINTENANCE LOG
// ============================================

const createMaintenance = async (req, res) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const {
      vehicleId,
      maintenanceType,
      description,
      cost,
      startDate,
    } = req.body;

    if (!vehicleId || !maintenanceType) {
      await client.query("ROLLBACK");

      return res.status(400).json({
        success: false,
        message: "Vehicle ID and maintenance type are required",
      });
    }

    const maintenanceCost = Number(cost ?? 0);

    if (!Number.isFinite(maintenanceCost) || maintenanceCost < 0) {
      await client.query("ROLLBACK");

      return res.status(400).json({
        success: false,
        message: "Maintenance cost cannot be negative",
      });
    }

    const vehicleResult = await client.query(
      `
        SELECT id, registration_number, status
        FROM vehicles
        WHERE id = $1
        FOR UPDATE
      `,
      [vehicleId]
    );

    if (vehicleResult.rows.length === 0) {
      await client.query("ROLLBACK");

      return res.status(404).json({
        success: false,
        message: "Vehicle not found",
      });
    }

    const vehicle = vehicleResult.rows[0];

    if (vehicle.status === "On Trip") {
      await client.query("ROLLBACK");

      return res.status(409).json({
        success: false,
        message: "Vehicle cannot enter maintenance while on an active trip",
      });
    }

    if (vehicle.status === "In Shop") {
      await client.query("ROLLBACK");

      return res.status(409).json({
        success: false,
        message: "Vehicle is already in maintenance",
      });
    }

    if (vehicle.status === "Retired") {
      await client.query("ROLLBACK");

      return res.status(409).json({
        success: false,
        message: "Retired vehicle cannot enter maintenance",
      });
    }

    const result = await client.query(
      `
        INSERT INTO maintenance_logs (
          vehicle_id,
          maintenance_type,
          description,
          cost,
          start_date,
          status
        )
        VALUES (
          $1,
          $2,
          $3,
          $4,
          COALESCE($5::date, CURRENT_DATE),
          'Active'
        )
        RETURNING *
      `,
      [
        vehicleId,
        maintenanceType.trim(),
        description?.trim() || null,
        maintenanceCost,
        startDate || null,
      ]
    );

    await client.query(
      `
        UPDATE vehicles
        SET
          status = 'In Shop',
          updated_at = CURRENT_TIMESTAMP
        WHERE id = $1
      `,
      [vehicleId]
    );

    await client.query("COMMIT");

    return res.status(201).json({
      success: true,
      message: "Maintenance started successfully",
      data: {
        maintenance: result.rows[0],
      },
    });
  } catch (error) {
    await client.query("ROLLBACK");

    console.error("Create maintenance error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  } finally {
    client.release();
  }
};

// ============================================
// GET ALL MAINTENANCE LOGS
// ============================================

const getMaintenanceLogs = async (req, res) => {
  try {
    const result = await pool.query(
      `
        SELECT
          m.*,
          v.registration_number,
          v.vehicle_name,
          v.status AS vehicle_status
        FROM maintenance_logs m
        JOIN vehicles v ON v.id = m.vehicle_id
        ORDER BY m.created_at DESC
      `
    );

    return res.status(200).json({
      success: true,
      count: result.rows.length,
      data: {
        maintenance: result.rows,
      },
    });
  } catch (error) {
    console.error("Get maintenance logs error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// ============================================
// COMPLETE MAINTENANCE
// ============================================

const completeMaintenance = async (req, res) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const { id } = req.params;
    const { endDate } = req.body;

    const maintenanceResult = await client.query(
      `
        SELECT *
        FROM maintenance_logs
        WHERE id = $1
        FOR UPDATE
      `,
      [id]
    );

    if (maintenanceResult.rows.length === 0) {
      await client.query("ROLLBACK");

      return res.status(404).json({
        success: false,
        message: "Maintenance record not found",
      });
    }

    const maintenance = maintenanceResult.rows[0];

    if (maintenance.status === "Completed") {
      await client.query("ROLLBACK");

      return res.status(409).json({
        success: false,
        message: "Maintenance is already completed",
      });
    }

    const result = await client.query(
      `
        UPDATE maintenance_logs
        SET
          status = 'Completed',
          end_date = COALESCE($1::date, CURRENT_DATE),
          updated_at = CURRENT_TIMESTAMP
        WHERE id = $2
        RETURNING *
      `,
      [endDate || null, id]
    );

    await client.query(
      `
        UPDATE vehicles
        SET
          status = 'Available',
          updated_at = CURRENT_TIMESTAMP
        WHERE id = $1
      `,
      [maintenance.vehicle_id]
    );

    await client.query("COMMIT");

    return res.status(200).json({
      success: true,
      message: "Maintenance completed successfully",
      data: {
        maintenance: result.rows[0],
      },
    });
  } catch (error) {
    await client.query("ROLLBACK");

    console.error("Complete maintenance error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  } finally {
    client.release();
  }
};

module.exports = {
  createMaintenance,
  getMaintenanceLogs,
  completeMaintenance,
};