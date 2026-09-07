import { Router } from "express";
import { validateShopifyHeader } from "../middleware/auth.js";
import {
  getSettings,
  updateSettings,
  getPublicSettings,
} from "../controllers/settings.js";

const router = Router();

// Public route for storefront
router.get("/public", getPublicSettings);

// Apply header validation to admin routes
router.use(validateShopifyHeader);

// Get settings
router.get("/", getSettings);

// Update settings
router.put("/", updateSettings);

export default router;
