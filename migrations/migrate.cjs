const mysql = require("mysql2/promise");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

const dbConfig = {
  host: process.env.DB_HOST || "localhost",
  port: parseInt(process.env.DB_PORT || "3306", 10),
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "video_testimonial",
  multipleStatements: true,
};

const migrationsDir = path.join(__dirname);

async function runMigrations() {
  const sqlFiles = fs
    .readdirSync(migrationsDir)
    .filter((f) => f.endsWith(".sql"))
    .sort();

  if (sqlFiles.length === 0) {
    console.log("No SQL files found.");
    return;
  }

  const connection = await mysql.createConnection(dbConfig);
  console.log(`Connected to MySQL\n`);

  for (const file of sqlFiles) {
    const sql = fs.readFileSync(path.join(migrationsDir, file), "utf8");
    const statements = sql
      .split(";")
      .map((s) => s.trim())
      .filter((s) => s.length > 0);
    for (const stmt of statements) {
      try {
        await connection.query(stmt);
      } catch (err) {
        if (err.code === "ER_DUP_FIELDNAME") {
          // Column already exists, skip silently
        } else {
          throw err;
        }
      }
    }
    console.log(`✓ ${file}`);
  }

  const [rows] = await connection.query("SHOW TABLES");
  console.log("\nTables:");
  rows.forEach((row) => console.log(`  ${Object.values(row)[0]}`));

  await connection.end();
  console.log("\nDone!");
}

runMigrations().catch((err) => {
  console.error("Migration failed:", err.message);
  process.exit(1);
});
