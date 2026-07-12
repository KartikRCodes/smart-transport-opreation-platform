const pool = require("../config/db");

// ============================================
// GET VEHICLE PERFORMANCE REPORT
// ============================================

const getVehiclePerformance = async (req, res) => {
  try {
    const result = await pool.query(`
      WITH trip_stats AS (
        SELECT
          vehicle_id,
          COUNT(*) FILTER (
            WHERE status = 'Completed'
          )::int AS completed_trips,

          COALESCE(
            SUM(actual_distance) FILTER (
              WHERE status = 'Completed'
            ),
            0
          ) AS total_distance,

          COALESCE(
            SUM(revenue) FILTER (
              WHERE status = 'Completed'
            ),
            0
          ) AS total_revenue

        FROM trips
        GROUP BY vehicle_id
      ),

      fuel_stats AS (
        SELECT
          vehicle_id,
          COALESCE(SUM(liters), 0) AS total_fuel_consumed,
          COALESCE(SUM(cost), 0) AS total_fuel_cost
        FROM fuel_logs
        GROUP BY vehicle_id
      ),

      maintenance_stats AS (
        SELECT
          vehicle_id,
          COALESCE(SUM(cost), 0) AS total_maintenance_cost
        FROM maintenance_logs
        GROUP BY vehicle_id
      )

      SELECT
        v.id AS vehicle_id,
        v.registration_number,
        v.vehicle_name,
        v.type,
        v.region,
        v.status,
        v.acquisition_cost,

        COALESCE(t.completed_trips, 0) AS completed_trips,
        COALESCE(t.total_distance, 0) AS total_distance,
        COALESCE(t.total_revenue, 0) AS total_revenue,

        COALESCE(f.total_fuel_consumed, 0)
          AS total_fuel_consumed,

        COALESCE(f.total_fuel_cost, 0)
          AS total_fuel_cost,

        COALESCE(m.total_maintenance_cost, 0)
          AS total_maintenance_cost,

        (
          COALESCE(f.total_fuel_cost, 0)
          +
          COALESCE(m.total_maintenance_cost, 0)
        ) AS total_operational_cost,

        CASE
          WHEN COALESCE(f.total_fuel_consumed, 0) > 0
          THEN ROUND(
            COALESCE(t.total_distance, 0)
            /
            f.total_fuel_consumed,
            2
          )
          ELSE 0
        END AS fuel_efficiency,

        CASE
          WHEN v.acquisition_cost > 0
          THEN ROUND(
            (
              (
                COALESCE(t.total_revenue, 0)
                -
                (
                  COALESCE(f.total_fuel_cost, 0)
                  +
                  COALESCE(m.total_maintenance_cost, 0)
                )
              )
              /
              v.acquisition_cost
            ) * 100,
            2
          )
          ELSE 0
        END AS roi_percentage

      FROM vehicles v

      LEFT JOIN trip_stats t
        ON t.vehicle_id = v.id

      LEFT JOIN fuel_stats f
        ON f.vehicle_id = v.id

      LEFT JOIN maintenance_stats m
        ON m.vehicle_id = v.id

      ORDER BY v.id ASC
    `);

    return res.status(200).json({
      success: true,
      count: result.rows.length,
      data: {
        vehicles: result.rows,
      },
    });
  } catch (error) {
    console.error("Get vehicle performance report error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

module.exports = {
  getVehiclePerformance,
};