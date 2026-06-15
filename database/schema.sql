-- MySQL Database Schema for Roster Application
-- Secure User Authentication and Profile Management
-- Created for Plesk Server Deployment

-- ============================================
-- USERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  uuid CHAR(36) UNIQUE NOT NULL DEFAULT (UUID()),
  username VARCHAR(255) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  national_id VARCHAR(50) UNIQUE,
  user_type ENUM('school', 'individual', 'admin') DEFAULT 'school',
  status ENUM('active', 'inactive', 'suspended') DEFAULT 'active',
  email_verified BOOLEAN DEFAULT FALSE,
  phone_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  last_login TIMESTAMP NULL,
  INDEX idx_username (username),
  INDEX idx_email (email),
  INDEX idx_user_type (user_type),
  INDEX idx_status (status),
  INDEX idx_created_at (created_at)
);

-- ============================================
-- USER PROFILES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS user_profiles (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL UNIQUE,
  school_name VARCHAR(255),
  school_address VARCHAR(500),
  school_phone VARCHAR(20),
  school_email VARCHAR(255),
  school_reg_number VARCHAR(100) UNIQUE,
  school_logo_url VARCHAR(500),
  city VARCHAR(100),
  region VARCHAR(100),
  country VARCHAR(100) DEFAULT 'Ethiopia',
  bio TEXT,
  avatar_url VARCHAR(500),
  language ENUM('am', 'en', 'or') DEFAULT 'am',
  timezone VARCHAR(50) DEFAULT 'Africa/Addis_Ababa',
  notification_preferences JSON,
  two_factor_enabled BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id),
  INDEX idx_school_name (school_name)
);

-- ============================================
-- AUTH TOKENS TABLE (For JWT/Session Management)
-- ============================================
CREATE TABLE IF NOT EXISTS auth_tokens (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  token_hash VARCHAR(255) UNIQUE NOT NULL,
  token_type ENUM('access', 'refresh', 'email_verification', 'password_reset') DEFAULT 'access',
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  revoked BOOLEAN DEFAULT FALSE,
  revoked_at TIMESTAMP NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id),
  INDEX idx_token_hash (token_hash),
  INDEX idx_expires_at (expires_at),
  INDEX idx_token_type (token_type)
);

-- ============================================
-- PASSWORD RESET TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS password_resets (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  reset_token_hash VARCHAR(255) UNIQUE NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  used BOOLEAN DEFAULT FALSE,
  used_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id),
  INDEX idx_reset_token_hash (reset_token_hash),
  INDEX idx_expires_at (expires_at)
);

-- ============================================
-- EMAIL VERIFICATION TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS email_verifications (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  email VARCHAR(255) NOT NULL,
  verification_token_hash VARCHAR(255) UNIQUE NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  verified BOOLEAN DEFAULT FALSE,
  verified_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id),
  INDEX idx_email (email),
  INDEX idx_verification_token_hash (verification_token_hash)
);

-- ============================================
-- LOGIN ATTEMPTS TABLE (Security: Track Failed Logins)
-- ============================================
CREATE TABLE IF NOT EXISTS login_attempts (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT,
  username VARCHAR(255),
  ip_address VARCHAR(45),
  user_agent TEXT,
  success BOOLEAN DEFAULT FALSE,
  attempted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_username (username),
  INDEX idx_ip_address (ip_address),
  INDEX idx_attempted_at (attempted_at),
  INDEX idx_success (success)
);

-- ============================================
-- AUDIT LOG TABLE (Security: Track Changes)
-- ============================================
CREATE TABLE IF NOT EXISTS audit_logs (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT,
  action VARCHAR(255) NOT NULL,
  entity_type VARCHAR(100),
  entity_id INT,
  changes JSON,
  ip_address VARCHAR(45),
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_user_id (user_id),
  INDEX idx_action (action),
  INDEX idx_created_at (created_at),
  INDEX idx_entity_type (entity_type)
);

-- ============================================
-- USER SESSIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS user_sessions (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  session_token_hash VARCHAR(255) UNIQUE NOT NULL,
  ip_address VARCHAR(45),
  user_agent TEXT,
  device_name VARCHAR(255),
  last_activity TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id),
  INDEX idx_session_token_hash (session_token_hash),
  INDEX idx_expires_at (expires_at)
);

-- ============================================
-- USER PERMISSIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS user_permissions (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  permission_name VARCHAR(100) NOT NULL,
  granted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_user_permission (user_id, permission_name),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id),
  INDEX idx_permission_name (permission_name)
);

-- ============================================
-- CREATE CLEANUP PROCEDURES FOR EXPIRED DATA
-- ============================================
DELIMITER //

CREATE PROCEDURE cleanup_expired_tokens()
BEGIN
  DELETE FROM auth_tokens WHERE expires_at < NOW() AND revoked = TRUE;
  DELETE FROM password_resets WHERE expires_at < NOW();
  DELETE FROM email_verifications WHERE expires_at < NOW();
  DELETE FROM user_sessions WHERE expires_at < NOW();
END //

CREATE PROCEDURE cleanup_old_login_attempts()
BEGIN
  DELETE FROM login_attempts WHERE attempted_at < DATE_SUB(NOW(), INTERVAL 90 DAY);
END //

CREATE PROCEDURE cleanup_old_audit_logs()
BEGIN
  DELETE FROM audit_logs WHERE created_at < DATE_SUB(NOW(), INTERVAL 1 YEAR);
END //

DELIMITER ;

-- ============================================
-- CREATE EVENTS FOR AUTOMATIC CLEANUP
-- ============================================
CREATE EVENT IF NOT EXISTS event_cleanup_tokens
ON SCHEDULE EVERY 1 DAY
DO CALL cleanup_expired_tokens();

CREATE EVENT IF NOT EXISTS event_cleanup_login_attempts
ON SCHEDULE EVERY 7 DAY
DO CALL cleanup_old_login_attempts();

CREATE EVENT IF NOT EXISTS event_cleanup_audit_logs
ON SCHEDULE EVERY 30 DAY
DO CALL cleanup_old_audit_logs();
