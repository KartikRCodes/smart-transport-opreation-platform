const pool = require("../config/db");

const VALID_STATUSES = ["Available", "On Trip", "In Shop", "Retired"];

// ============================================
// CREATE VEHICLE
// ============================================

const createVehicle = async (req, res) => {
  try {
    const {
      registrationNumber,
      vehicleName,
      model,
      type,
      maxLoadCapacity,
      odometer,
      acquisitionCost,
      region,
    } = req.body;

    if (
      !registrationNumber ||
      !vehicleName ||
      !type ||
      maxLoadCapacity === undefined
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Registration number, vehicle name, type, and max load capacity are required",
      });
    }

    const capacity = Number(maxLoadCapacity);
    const currentOdometer = Number(odometer ?? 0);
    const cost = Number(acquisitionCost ?? 0);

    if (!Number.isFinite(capacity) || capacity <= 0) {
      return res.status(400).json({
        success: false,
        message: "Max load capacity must be greater than 0",
      });
    }

    if (!Number.isFinite(currentOdometer) || currentOdometer < 0) {
      return res.status(400).json({
        success: false,
        message: "Odometer cannot be negative",
      });
    }

    if (!Number.isFinite(cost) || cost < 0) {
      return res.status(400).json({
        success: false,
        message: "Acquisition cost cannot be negative",
      });
    }

    const existingVehicle = await pool.query(
      `
        SELECT id
        FROM vehicles
        WHERE UPPER(registration_number) = UPPER($1)
      `,
      [registrationNumber.trim()]
    );

    if (existingVehicle.rows.length > 0) {
      return res.status(409).json({
        success: false,
        message: "Vehicle registration number already exists",
      });
    }

    const result = await pool.query(
      `
        INSERT INTO vehicles (
          registration_number,
          vehicle_name,
          model,
          type,
          max_load_capacity,
          odometer,
          acquisition_cost,
          region,
          status
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'Available')
        RETURNING *
      `,
      [
        registrationNumber.trim().toUpperCase(),
        vehicleName.trim(),
        model?.trim() || null,
        type.trim(),
        capacity,
        currentOdometer,
        cost,
        region?.trim() || null,
      ]
    );

    return res.status(201).json({
      success: true,
      message: "Vehicle created successfully",
      data: {
        vehicle: result.rows[0],
      },
    });
  } catch (error) {
    console.error("Create vehicle error:", error);

    if (error.code === "23505") {
      return res.status(409).json({
        success: false,
        message: "Vehicle registration number already exists",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// ============================================
// GET ALL VEHICLES
// ============================================

const getVehicles = async (req, res) => {
  try {
    const result = await pool.query(
      `
        SELECT *
        FROM vehicles
        ORDER BY created_at DESC
      `
    );

    return res.status(200).json({
      success: true,
      count: result.rows.length,
      data: {
        vehicles: result.rows,
      },
    });
  } catch (error) {
    console.error("Get vehicles error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// ============================================
// GET VEHICLE BY ID
// ============================================

const getVehicleById = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `
        SELECT *
        FROM vehicles
        WHERE id = $1
      `,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Vehicle not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        vehicle: result.rows[0],
      },
    });
  } catch (error) {
    console.error("Get vehicle error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// ============================================
// UPDATE VEHICLE
// ============================================

const updateVehicle = async (req, res) => {
  try {
    const { id } = req.params;

    const existingResult = await pool.query(
      "SELECT * FROM vehicles WHERE id = $1",
      [id]
    );

    if (existingResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Vehicle not found",
      });
    }

    const existing = existingResult.rows[0];

    const {
      registrationNumber,
      vehicleName,
      model,
      type,
      maxLoadCapacity,
      odometer,
      acquisitionCost,
      region,
      status,
    } = req.body;

    const newStatus = status ?? existing.status;

    if (!VALID_STATUSES.includes(newStatus)) {
      return res.status(400).json({
        success: false,
        message: `Status must be one of: ${VALID_STATUSES.join(", ")}`,
      });
    }

    const capacity = Number(
      maxLoadCapacity ?? existing.max_load_capacity
    );

    const currentOdometer = Number(
      odometer ?? existing.odometer
    );

    const cost = Number(
      acquisitionCost ?? existing.acquisition_cost
    );

    if (!Number.isFinite(capacity) || capacity <= 0) {
      return res.status(400).json({
        success: false,
        message: "Max load capacity must be greater than 0",
      });
    }

    if (!Number.isFinite(currentOdometer) || currentOdometer < 0) {
      return res.status(400).json({
        success: false,
        message: "Odometer cannot be negative",
      });
    }

    if (!Number.isFinite(cost) || cost < 0) {
      return res.status(400).json({
        success: false,
        message: "Acquisition cost cannot be negative",
      });
    }

    const result = await pool.query(
      `
        UPDATE vehicles
        SET
          registration_number = $1,
          vehicle_name = $2,
          model = $3,
          type = $4,
          max_load_capacity = $5,
          odometer = $6,
          acquisition_cost = $7,
          region = $8,
          status = $9,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = $10
        RETURNING *
      `,
      [
        (registrationNumber ?? existing.registration_number)
          .trim()
          .toUpperCase(),
        (vehicleName ?? existing.vehicle_name).trim(),
        model !== undefined
          ? model?.trim() || null
          : existing.model,
        (type ?? existing.type).trim(),
        capacity,
        currentOdometer,
        cost,
        region !== undefined
          ? region?.trim() || null
          : existing.region,
        newStatus,
        id,
      ]
    );

    return res.status(200).json({
      success: true,
      message: "Vehicle updated successfully",
      data: {
        vehicle: result.rows[0],
      },
    });
  } catch (error) {
    console.error("Update vehicle error:", error);

    if (error.code === "23505") {
      return res.status(409).json({
        success: false,
        message: "Vehicle registration number already exists",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// ============================================
// RETIRE VEHICLE
// ============================================

const deleteVehicle = async (req, res) => {
  try {
    const { id } = req.params;

    const vehicleResult = await pool.query(
      `
        SELECT id, registration_number, status
        FROM vehicles
        WHERE id = $1
      `,
      [id]
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
        message: "Vehicle is already retired",
      });
    }

    if (vehicle.status === "On Trip") {
      return res.status(409).json({
        success: false,
        message: "Vehicle cannot be retired while it is on an active trip",
      });
    }

    if (vehicle.status === "In Shop") {
      return res.status(409).json({
        success: false,
        message: "Vehicle cannot be retired while it is in maintenance",
      });
    }

    const result = await pool.query(
      `
        UPDATE vehicles
        SET
          status = 'Retired',
          updated_at = CURRENT_TIMESTAMP
        WHERE id = $1
        RETURNING *
      `,
      [id]
    );

    return res.status(200).json({
      success: true,
      message: "Vehicle retired successfully",
      data: {
        vehicle: result.rows[0],
      },
    });
  } catch (error) {
    console.error("Retire vehicle error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

module.exports = {
  createVehicle,
  getVehicles,
  getVehicleById,
  updateVehicle,
  deleteVehicle,
};