import { Router } from "express";
import { validateShopifyHeader } from "../middleware/auth.js";
import {
  getSettings,
  updateSettings,
  createSettings,
  deleteSettings,
  getPublicSettings,
} from "../controllers/settings.js";

const router = Router();

// Public route for storefront
router.get("/public", getPublicSettings);

// Apply header validation to admin routes
router.use(validateShopifyHeader);

// Get settings
router.get("/", getSettings);

// Create settings
router.post("/add", createSettings);

// Update settings
router.put("/", updateSettings);

// Delete settings
router.delete("/:id", deleteSettings);

export default router;
