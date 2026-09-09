import { DataTypes, Model } from "sequelize";
import { getSequelize } from "../config/db.js";
import { ITestimonial } from "../types/index.js";

class Testimonial extends Model<ITestimonial> implements ITestimonial {
  public id!: number;
  public shop_domain!: string;
  public title!: string;
  public video_url!: string;
  public video_type!: "youtube" | "vimeo" | "shopify";
  public sort_order!: number;
  public is_active!: boolean;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

export function initTestimonialModel(): void {
  const sequelize = getSequelize();

  Testimonial.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      shop_domain: {
        type: DataTypes.STRING(255),
        allowNull: false,
        validate: {
          notEmpty: true,
        },
      },
      title: {
        type: DataTypes.STRING(255),
        allowNull: false,
        validate: {
          notEmpty: true,
          len: [1, 255],
        },
      },
      video_url: {
        type: DataTypes.TEXT,
        allowNull: false,
        validate: {
          notEmpty: true,
        },
      },
      video_type: {
        type: DataTypes.ENUM("youtube", "vimeo", "shopify", "other"),
        allowNull: false,
        defaultValue: "youtube",
      },
      sort_order: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      is_active: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
    },
    {
      sequelize,
      tableName: "testimonials",
      modelName: "Testimonial",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
      indexes: [
        {
          fields: ["shop_domain"],
        },
        {
          fields: ["shop_domain", "sort_order"],
        },
      ],
    },
  );
}

export default Testimonial;
