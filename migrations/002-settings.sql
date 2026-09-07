CREATE TABLE IF NOT EXISTS settings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  shop_domain VARCHAR(255) NOT NULL UNIQUE,
  section_title VARCHAR(255) NOT NULL DEFAULT 'Video Testimonials',
  slider_effect ENUM('standard', 'fade', 'carousel') NOT NULL DEFAULT 'standard',
  display_layout ENUM('slider', 'grid') NOT NULL DEFAULT 'slider',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_settings_shop_domain (shop_domain)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
