CREATE TABLE IF NOT EXISTS testimonials (
  id INT AUTO_INCREMENT PRIMARY KEY,
  shop_domain VARCHAR(255) NOT NULL,
  title VARCHAR(255) NOT NULL,
  video_url TEXT NOT NULL,
  video_type ENUM('youtube', 'vimeo', 'shopify') NOT NULL DEFAULT 'youtube',
  sort_order INT NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_testimonials_shop_domain (shop_domain),
  INDEX idx_testimonials_shop_sort (shop_domain, sort_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
