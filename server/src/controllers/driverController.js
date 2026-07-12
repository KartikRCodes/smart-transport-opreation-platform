const pool = require("../config/db");

const VALID_STATUSES = [
  "Available",
  "On Trip",
  "Off Duty",
  "Suspended",
];

// ============================================
// CREATE DRIVER
// ============================================

const createDriver = async (req, res) => {
  try {
    const {
      name,
      licenseNumber,
      licenseCategory,
      licenseExpiryDate,
      contactNumber,
      safetyScore,
    } = req.body;

    if (
      !name ||
      !licenseNumber ||
      !licenseCategory ||
      !licenseExpiryDate ||
      !contactNumber
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Name, license number, license category, license expiry date, and contact number are required",
      });
    }

    const score =
      safetyScore === undefined ? 100 : Number(safetyScore);

    if (!Number.isFinite(score) || score < 0 || score > 100) {
      return res.status(400).json({
        success: false,
        message: "Safety score must be between 0 and 100",
      });
    }

    const expiryDate = new Date(licenseExpiryDate);

    if (Number.isNaN(expiryDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: "Invalid license expiry date",
      });
    }

    const existingDriver = await pool.query(
      `
        SELECT id
        FROM drivers
        WHERE UPPER(license_number) = UPPER($1)
      `,
      [licenseNumber.trim()]
    );

    if (existingDriver.rows.length > 0) {
      return res.status(409).json({
        success: false,
        message: "Driver license number already exists",
      });
    }

    const result = await pool.query(
      `
        INSERT INTO drivers (
          name,
          license_number,
          license_category,
          license_expiry_date,
          contact_number,
          safety_score,
          status
        )
        VALUES ($1, $2, $3, $4, $5, $6, 'Available')
        RETURNING *
      `,
      [
        name.trim(),
        licenseNumber.trim().toUpperCase(),
        licenseCategory.trim(),
        licenseExpiryDate,
        contactNumber.trim(),
        score,
      ]
    );

    return res.status(201).json({
      success: true,
      message: "Driver created successfully",
      data: {
        driver: result.rows[0],
      },
    });
  } catch (error) {
    console.error("Create driver error:", error);

    if (error.code === "23505") {
      return res.status(409).json({
        success: false,
        message: "Driver license number already exists",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// ============================================
// GET ALL DRIVERS
// ============================================

const getDrivers = async (req, res) => {
  try {
    const result = await pool.query(
      `
        SELECT *
        FROM drivers
        ORDER BY created_at DESC
      `
    );

    return res.status(200).json({
      success: true,
      count: result.rows.length,
      data: {
        drivers: result.rows,
      },
    });
  } catch (error) {
    console.error("Get drivers error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// ============================================
// GET DRIVER BY ID
// ============================================

const getDriverById = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `
        SELECT *
        FROM drivers
        WHERE id = $1
      `,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Driver not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        driver: result.rows[0],
      },
    });
  } catch (error) {
    console.error("Get driver error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// ============================================
// UPDATE DRIVER
// ============================================

const updateDriver = async (req, res) => {
  try {
    const { id } = req.params;

    const existingResult = await pool.query(
      "SELECT * FROM drivers WHERE id = $1",
      [id]
    );

    if (existingResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Driver not found",
      });
    }

    const existing = existingResult.rows[0];

    const {
      name,
      licenseNumber,
      licenseCategory,
      licenseExpiryDate,
      contactNumber,
      safetyScore,
      status,
    } = req.body;

    /*
      "On Trip" must be controlled by the Trip module.
      It should not be manually assigned through general driver CRUD.
    */
    if (status === "On Trip" && existing.status !== "On Trip") {
      return res.status(400).json({
        success: false,
        message:
          "Driver status cannot be manually changed to On Trip",
      });
    }

    const newStatus = status ?? existing.status;

    if (!VALID_STATUSES.includes(newStatus)) {
      return res.status(400).json({
        success: false,
        message: `Status must be one of: ${VALID_STATUSES.join(", ")}`,
      });
    }

    const score = Number(
      safetyScore ?? existing.safety_score
    );

    if (!Number.isFinite(score) || score < 0 || score > 100) {
      return res.status(400).json({
        success: false,
        message: "Safety score must be between 0 and 100",
      });
    }

    const newExpiryDate =
      licenseExpiryDate ?? existing.license_expiry_date;

    const expiryDate = new Date(newExpiryDate);

    if (Number.isNaN(expiryDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: "Invalid license expiry date",
      });
    }

    const result = await pool.query(
      `
        UPDATE drivers
        SET
          name = $1,
          license_number = $2,
          license_category = $3,
          license_expiry_date = $4,
          contact_number = $5,
          safety_score = $6,
          status = $7,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = $8
        RETURNING *
      `,
      [
        (name ?? existing.name).trim(),
        (licenseNumber ?? existing.license_number)
          .trim()
          .toUpperCase(),
        (licenseCategory ?? existing.license_category).trim(),
        newExpiryDate,
        (contactNumber ?? existing.contact_number).trim(),
        score,
        newStatus,
        id,
      ]
    );

    return res.status(200).json({
      success: true,
      message: "Driver updated successfully",
      data: {
        driver: result.rows[0],
      },
    });
  } catch (error) {
    console.error("Update driver error:", error);

    if (error.code === "23505") {
      return res.status(409).json({
        success: false,
        message: "Driver license number already exists",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// ============================================
// SUSPEND DRIVER
// ============================================

const suspendDriver = async (req, res) => {
  try {
    const { id } = req.params;

    const driverResult = await pool.query(
      `
        SELECT id, name, status
        FROM drivers
        WHERE id = $1
      `,
      [id]
    );

    if (driverResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Driver not found",
      });
    }

    const driver = driverResult.rows[0];

    if (driver.status === "Suspended") {
      return res.status(409).json({
        success: false,
        message: "Driver is already suspended",
      });
    }

    if (driver.status === "On Trip") {
      return res.status(409).json({
        success: false,
        message:
          "Driver cannot be suspended while assigned to an active trip",
      });
    }

    const result = await pool.query(
      `
        UPDATE drivers
        SET
          status = 'Suspended',
          updated_at = CURRENT_TIMESTAMP
        WHERE id = $1
        RETURNING *
      `,
      [id]
    );

    return res.status(200).json({
      success: true,
      message: "Driver suspended successfully",
      data: {
        driver: result.rows[0],
      },
    });
  } catch (error) {
    console.error("Suspend driver error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

module.exports = {
  createDriver,
  getDrivers,
  getDriverById,
  updateDriver,
  suspendDriver,
};