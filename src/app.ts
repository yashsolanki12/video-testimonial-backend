import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import testimonialRoutes from "./router/testimonial.routes.js";
import settingsRoutes from "./router/settings.routes.js";
import webhookRoutes from "./router/webhook.routes.js";
import authRoutes from "./router/auth.routes.js";
import { errorHandler } from "./middleware/error-handler.js";
import { connectDB } from "./config/db.js";
import { initTestimonialModel } from "./models/testimonial.js";
import { initSettingsModel } from "./models/settings.js";
import { initShopModel } from "./models/shop.js";
import { isAllowedOrigin } from "./utils/allowed-origin.js";

const app = express();
dotenv.config({ path: ".env" });

app.get("/", (_req, res) => {
  res.send("Video Testimonial Backend API");
});

// Capture raw body for webhook HMAC verification (must come before express.json)
app.use("/api/webhooks", express.raw({ type: "*/*" }));

app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ extended: true }));

// Cors for Development & Production use
app.use(
  cors({
    origin: (origin, callback) => {
      if (isAllowedOrigin(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"), false);
      }
    },
    credentials: true,
    allowedHeaders: [
      "Content-Type",
      "x-shopify-shop-domain",
      "Accept",
      "Origin",
      "X-Requested-With",
    ],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
  }),
);

// Routes
app.use("/api/testimonials", testimonialRoutes);
app.use("/api/settings", settingsRoutes);
app.use("/api/webhooks", webhookRoutes);
app.use("/api/auth", authRoutes);

// Global error handler
app.use(errorHandler);

// Database connection and model initialization
const dbHost = process.env.DB_HOST || "localhost";
const dbPort = parseInt(process.env.DB_PORT || "3306", 10);
const dbName = process.env.DB_NAME || "video_testimonial";
const dbUser = process.env.DB_USER || "root";
const dbPassword = process.env.DB_PASSWORD || "";

if (!dbName || !dbUser) {
  throw new Error("Missing database connection environment variables.");
}

connectDB({
  host: dbHost,
  port: dbPort,
  dbName,
  user: dbUser,
  password: dbPassword,
});

// Initialize models
initShopModel();
initTestimonialModel();
initSettingsModel();

export default app;
