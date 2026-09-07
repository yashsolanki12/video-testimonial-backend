import { DataTypes, Model } from "sequelize";
import { getSequelize } from "../config/db.js";
import { ISettings } from "../types/index.js";

class Settings extends Model<ISettings> implements ISettings {
  public id!: number;
  public shop_domain!: string;
  public section_title!: string;
  public slider_effect!: "standard" | "fade" | "carousel";
  public display_layout!: "slider" | "grid";
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

export function initSettingsModel(): void {
  const sequelize = getSequelize();

  Settings.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      shop_domain: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: true,
        validate: {
          notEmpty: true,
        },
      },
      section_title: {
        type: DataTypes.STRING(255),
        allowNull: false,
        defaultValue: "Video Testimonials",
        validate: {
          len: [1, 255],
        },
      },
      slider_effect: {
        type: DataTypes.ENUM("standard", "fade", "carousel"),
        allowNull: false,
        defaultValue: "standard",
      },
      display_layout: {
        type: DataTypes.ENUM("slider", "grid"),
        allowNull: false,
        defaultValue: "slider",
      },
    },
    {
      sequelize,
      tableName: "settings",
      modelName: "Settings",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
      indexes: [
        {
          fields: ["shop_domain"],
          unique: true,
        },
      ],
    },
  );
}

export default Settings;
