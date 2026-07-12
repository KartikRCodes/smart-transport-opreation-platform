const pool = require("../config/db");

// ============================================
// GET DASHBOARD KPIs
// ============================================

const getDashboardKPIs = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        -- Vehicle KPIs
        (SELECT COUNT(*)::int FROM vehicles)
          AS total_vehicles,

        (SELECT COUNT(*)::int
         FROM vehicles
         WHERE status = 'Available')
          AS available_vehicles,

        (SELECT COUNT(*)::int
         FROM vehicles
         WHERE status = 'On Trip')
          AS active_vehicles,

        (SELECT COUNT(*)::int
         FROM vehicles
         WHERE status = 'In Shop')
          AS in_shop_vehicles,

        (SELECT COUNT(*)::int
         FROM vehicles
         WHERE status = 'Retired')
          AS retired_vehicles,

        -- Driver KPIs
        (SELECT COUNT(*)::int FROM drivers)
          AS total_drivers,

        (SELECT COUNT(*)::int
         FROM drivers
         WHERE status = 'Available')
          AS available_drivers,

        (SELECT COUNT(*)::int
         FROM drivers
         WHERE status = 'Suspended')
          AS suspended_drivers,

        -- Trip KPIs
        (SELECT COUNT(*)::int
         FROM trips
         WHERE status = 'Draft')
          AS draft_trips,

        (SELECT COUNT(*)::int
         FROM trips
         WHERE status = 'Dispatched')
          AS active_trips,

        (SELECT COUNT(*)::int
         FROM trips
         WHERE status = 'Completed')
          AS completed_trips,

        (SELECT COUNT(*)::int
         FROM trips
         WHERE status = 'Cancelled')
          AS cancelled_trips,

        -- Maintenance KPIs
        (SELECT COUNT(*)::int
         FROM maintenance_logs
         WHERE status = 'Active')
          AS active_maintenance
    `);

    const data = result.rows[0];

    const activeNonRetiredVehicles =
      data.total_vehicles - data.retired_vehicles;

    const fleetUtilization =
      activeNonRetiredVehicles > 0
        ? Number(
            (
              (data.active_vehicles / activeNonRetiredVehicles) *
              100
            ).toFixed(2)
          )
        : 0;

    return res.status(200).json({
      success: true,
      data: {
        kpis: {
          totalVehicles: data.total_vehicles,
          availableVehicles: data.available_vehicles,
          activeVehicles: data.active_vehicles,
          inShopVehicles: data.in_shop_vehicles,
          retiredVehicles: data.retired_vehicles,

          totalDrivers: data.total_drivers,
          availableDrivers: data.available_drivers,
          suspendedDrivers: data.suspended_drivers,

          draftTrips: data.draft_trips,
          activeTrips: data.active_trips,
          completedTrips: data.completed_trips,
          cancelledTrips: data.cancelled_trips,

          activeMaintenance: data.active_maintenance,

          fleetUtilization,
        },
      },
    });
  } catch (error) {
    console.error("Get dashboard KPIs error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

module.exports = {
  getDashboardKPIs,
};