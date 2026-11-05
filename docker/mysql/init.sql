-- SmartLink MySQL 8 Initialization Script
CREATE DATABASE IF NOT EXISTS smartlink_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE smartlink_db;

CREATE TABLE IF NOT EXISTS urls (
    id INT AUTO_INCREMENT PRIMARY KEY,
    original_url VARCHAR(2048) NOT NULL,
    short_code VARCHAR(64) NOT NULL UNIQUE,
    short_url VARCHAR(512) NOT NULL,
    click_count INT NOT NULL DEFAULT 0,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_short_code (short_code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS click_events (
    id INT AUTO_INCREMENT PRIMARY KEY,
    url_id INT NOT NULL,
    clicked_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    referrer VARCHAR(512) DEFAULT NULL,
    user_agent VARCHAR(512) DEFAULT NULL,
    INDEX idx_url_id (url_id),
    INDEX idx_clicked_at (clicked_at),
    CONSTRAINT fk_click_events_url FOREIGN KEY (url_id) REFERENCES urls (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
