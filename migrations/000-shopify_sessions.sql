CREATE TABLE IF NOT EXISTS shopify_sessions_migrations (
  migration_name varchar(191) NOT NULL PRIMARY KEY
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS shopify_sessions (
  id varchar(255) NOT NULL PRIMARY KEY,
  shop varchar(255) NOT NULL,
  isOnline tinyint NOT NULL,
  scope varchar(1024),
  expires DATETIME,
  accessToken varchar(255),
  state varchar(255) DEFAULT '',
  refreshToken varchar(255),
  refreshTokenExpires DATETIME,
  firstName varchar(255),
  lastName varchar(255),
  email varchar(255),
  accountOwner tinyint,
  locale varchar(255),
  collaborator tinyint,
  emailVerified tinyint,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_shop (shop)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
