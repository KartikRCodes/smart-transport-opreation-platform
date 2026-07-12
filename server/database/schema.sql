-- ============================================
-- TRANSITOPS DATABASE SCHEMA
-- ============================================


-- 1. ROLES
CREATE TABLE IF NOT EXISTS roles (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL
);


-- 2. USERS
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role_id INTEGER NOT NULL REFERENCES roles(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


-- 3. VEHICLES
CREATE TABLE IF NOT EXISTS vehicles (
    id SERIAL PRIMARY KEY,
    registration_number VARCHAR(50) UNIQUE NOT NULL,
    vehicle_name VARCHAR(100) NOT NULL,
    model VARCHAR(100),
    type VARCHAR(50) NOT NULL,
    max_load_capacity NUMERIC(10, 2) NOT NULL
        CHECK (max_load_capacity > 0),
    odometer NUMERIC(12, 2) NOT NULL DEFAULT 0
        CHECK (odometer >= 0),
    acquisition_cost NUMERIC(14, 2) NOT NULL DEFAULT 0
        CHECK (acquisition_cost >= 0),
    region VARCHAR(100),
    status VARCHAR(20) NOT NULL DEFAULT 'Available'
        CHECK (status IN ('Available', 'On Trip', 'In Shop', 'Retired')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


-- 4. DRIVERS
CREATE TABLE IF NOT EXISTS drivers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    license_number VARCHAR(100) UNIQUE NOT NULL,
    license_category VARCHAR(50) NOT NULL,
    license_expiry_date DATE NOT NULL,
    contact_number VARCHAR(20) NOT NULL,
    safety_score NUMERIC(5, 2) DEFAULT 100
        CHECK (safety_score >= 0 AND safety_score <= 100),
    status VARCHAR(20) NOT NULL DEFAULT 'Available'
        CHECK (status IN ('Available', 'On Trip', 'Off Duty', 'Suspended')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


-- 5. TRIPS
CREATE TABLE IF NOT EXISTS trips (
    id SERIAL PRIMARY KEY,
    source VARCHAR(255) NOT NULL,
    destination VARCHAR(255) NOT NULL,

    vehicle_id INTEGER NOT NULL REFERENCES vehicles(id),
    driver_id INTEGER NOT NULL REFERENCES drivers(id),

    cargo_weight NUMERIC(10, 2) NOT NULL
        CHECK (cargo_weight > 0),

    planned_distance NUMERIC(12, 2) NOT NULL
        CHECK (planned_distance > 0),

    actual_distance NUMERIC(12, 2)
        CHECK (actual_distance >= 0),

    revenue NUMERIC(14, 2) DEFAULT 0
        CHECK (revenue >= 0),

    final_odometer NUMERIC(12, 2)
        CHECK (final_odometer >= 0),

    status VARCHAR(20) NOT NULL DEFAULT 'Draft'
        CHECK (status IN ('Draft', 'Dispatched', 'Completed', 'Cancelled')),

    dispatched_at TIMESTAMP,
    completed_at TIMESTAMP,
    cancelled_at TIMESTAMP,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


-- 6. MAINTENANCE LOGS
CREATE TABLE IF NOT EXISTS maintenance_logs (
    id SERIAL PRIMARY KEY,
    vehicle_id INTEGER NOT NULL REFERENCES vehicles(id),

    maintenance_type VARCHAR(100) NOT NULL,
    description TEXT,

    cost NUMERIC(14, 2) NOT NULL DEFAULT 0
        CHECK (cost >= 0),

    start_date DATE NOT NULL DEFAULT CURRENT_DATE,
    end_date DATE,

    status VARCHAR(20) NOT NULL DEFAULT 'Active'
        CHECK (status IN ('Active', 'Completed')),

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


-- 7. FUEL LOGS
CREATE TABLE IF NOT EXISTS fuel_logs (
    id SERIAL PRIMARY KEY,

    vehicle_id INTEGER NOT NULL REFERENCES vehicles(id),
    trip_id INTEGER REFERENCES trips(id),

    liters NUMERIC(10, 2) NOT NULL
        CHECK (liters > 0),

    cost NUMERIC(14, 2) NOT NULL
        CHECK (cost >= 0),

    log_date DATE NOT NULL DEFAULT CURRENT_DATE,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


-- 8. EXPENSES
CREATE TABLE IF NOT EXISTS expenses (
    id SERIAL PRIMARY KEY,

    vehicle_id INTEGER NOT NULL REFERENCES vehicles(id),
    trip_id INTEGER REFERENCES trips(id),

    expense_type VARCHAR(100) NOT NULL,

    amount NUMERIC(14, 2) NOT NULL
        CHECK (amount >= 0),

    description TEXT,

    expense_date DATE NOT NULL DEFAULT CURRENT_DATE,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


-- ============================================
-- INDEXES
-- ============================================

CREATE INDEX IF NOT EXISTS idx_vehicles_status
ON vehicles(status);

CREATE INDEX IF NOT EXISTS idx_vehicles_type
ON vehicles(type);

CREATE INDEX IF NOT EXISTS idx_vehicles_region
ON vehicles(region);

CREATE INDEX IF NOT EXISTS idx_drivers_status
ON drivers(status);

CREATE INDEX IF NOT EXISTS idx_driver_license_expiry
ON drivers(license_expiry_date);

CREATE INDEX IF NOT EXISTS idx_trips_status
ON trips(status);

CREATE INDEX IF NOT EXISTS idx_trips_vehicle
ON trips(vehicle_id);

CREATE INDEX IF NOT EXISTS idx_trips_driver
ON trips(driver_id);

CREATE INDEX IF NOT EXISTS idx_maintenance_vehicle
ON maintenance_logs(vehicle_id);

CREATE INDEX IF NOT EXISTS idx_fuel_vehicle
ON fuel_logs(vehicle_id);

CREATE INDEX IF NOT EXISTS idx_expenses_vehicle
ON expenses(vehicle_id);