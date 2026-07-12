const app = require("./app");
const pool = require("./config/db");
const config = require("./config/env");

const startServer = async () => {
  try {
    // Test PostgreSQL connection before starting the server
    await pool.query("SELECT NOW()");

    console.log("PostgreSQL connected successfully");

    app.listen(config.port, () => {
      console.log(`TransitOps server running on port ${config.port}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error.message);
    process.exit(1);
  }
};

startServer();