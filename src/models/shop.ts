import { DataTypes, Model } from "sequelize";
import { getSequelize } from "../config/db.js";

class Shop extends Model {
  public id!: number;
  public shop!: string;
  public shopifyToken!: string;
  public scope!: string;
  public isActive!: boolean;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

export function initShopModel(): void {
  const sequelize = getSequelize();

  Shop.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      shop: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: true,
      },
      shopifyToken: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      scope: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      isActive: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
    },
    {
      sequelize,
      tableName: "shops",
      modelName: "Shop",
      timestamps: true,
      createdAt: "createdAt",
      updatedAt: "updatedAt",
    },
  );
}

export default Shop;
