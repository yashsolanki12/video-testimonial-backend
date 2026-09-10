import { Sequelize } from "sequelize";

interface DBConfig {
  host: string;
  port: number;
  dbName: string;
  user: string;
  password: string;
}

let sequelize: Sequelize;

export function connectDB(config: DBConfig): Sequelize {
  sequelize = new Sequelize(config.dbName, config.user, config.password, {
    host: config.host,
    port: config.port,
    dialect: "mysql",
    logging: process.env.NODE_ENV === "development" ? console.log : false,
    pool: {
      max: 1,
      min: 0,
      acquire: 30000,
      idle: 5000,
    },
    define: {
      timestamps: true,
      underscored: true,
    },
  });

  return sequelize;
}

export function getSequelize(): Sequelize {
  if (!sequelize) {
    throw new Error("Database not initialized. Call connectDB first.");
  }
  return sequelize;
}
