import { Router } from "express";
import { validateShopifyHeader } from "../middleware/auth.js";
import {
  getAllTestimonials,
  getActiveTestimonials,
  getTestimonialById,
  createTestimonial,
  updateTestimonial,
  deleteTestimonial,
  toggleActive,
  reorderTestimonials,
} from "../controllers/testimonial.js";

const router = Router();

// Public route for storefront
router.get("/active", getActiveTestimonials);

// Apply header validation to admin routes
router.use(validateShopifyHeader);

// List all testimonials
router.get("/", getAllTestimonials);

// Get testimonial by ID
router.get("/:id", getTestimonialById);

// Create testimonial
router.post("/add", createTestimonial);

// Update testimonial
router.put("/:id", updateTestimonial);

// Delete testimonial
router.delete("/:id", deleteTestimonial);

// Toggle active status
router.patch("/:id/toggle", toggleActive);

// Reorder testimonials
router.put("/reorder/bulk", reorderTestimonials);

export default router;
