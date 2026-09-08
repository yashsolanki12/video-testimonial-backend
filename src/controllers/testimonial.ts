import { Request, Response } from "express";
import { StatusCode } from "../utils/status-code.js";
import { ApiResponse } from "../utils/api-response.js";
import { asyncHandler } from "../utils/async-handler.js";
import { AppError } from "../utils/app-error.js";
import * as testimonialService from "../services/testimonial.js";

function getShop(req: Request): string {
  const shop = req.shopify?.session?.shop;
  if (!shop) {
    throw new AppError("Unauthorized. Missing shop context.", StatusCode.UNAUTHORIZED);
  }
  return shop;
}

// Get all testimonials
export const getAllTestimonials = asyncHandler(
  async (req: Request, res: Response) => {
    const shop = getShop(req);
    const testimonials = await testimonialService.getAllTestimonials(shop);

    return res
      .status(StatusCode.OK)
      .json(
        new ApiResponse(true, "Testimonials retrieved successfully.", testimonials),
      );
  },
);

// Get active testimonials (for storefront)
export const getActiveTestimonials = asyncHandler(
  async (req: Request, res: Response) => {
    const shop = req.headers["x-shopify-shop-domain"] as string;

    if (!shop) {
      throw new AppError("Missing shop domain header.", StatusCode.BAD_REQUEST);
    }

    const testimonials = await testimonialService.getActiveTestimonials(shop);

    return res
      .status(StatusCode.OK)
      .json(
        new ApiResponse(true, "Active testimonials retrieved successfully.", testimonials),
      );
  },
);

// Get testimonial by ID
export const getTestimonialById = asyncHandler(
  async (req: Request, res: Response) => {
    const id = parseInt(req.params.id as string, 10);
    const shop = getShop(req);

    if (isNaN(id)) {
      throw new AppError("Invalid ID format.", StatusCode.BAD_REQUEST);
    }

    const testimonial = await testimonialService.getTestimonialById(id, shop);

    if (!testimonial) {
      throw new AppError("Testimonial not found.", StatusCode.NOT_FOUND);
    }

    return res
      .status(StatusCode.OK)
      .json(
        new ApiResponse(true, "Testimonial retrieved successfully.", testimonial),
      );
  },
);

// Create testimonial
export const createTestimonial = asyncHandler(
  async (req: Request, res: Response) => {
    const shop = getShop(req);
    const { title, video_url, video_type } = req.body;

    if (!title || !video_url) {
      throw new AppError(
        "Title and video URL are required.",
        StatusCode.BAD_REQUEST,
      );
    }

    const MAX_TESTIMONIALS = 10;
    const existingTestimonials = await testimonialService.getAllTestimonials(shop);
    if (existingTestimonials.length >= MAX_TESTIMONIALS) {
      throw new AppError(
        `Maximum limit of ${MAX_TESTIMONIALS} testimonials reached. Please delete an existing testimonial before adding a new one.`,
        StatusCode.BAD_REQUEST,
      );
    }

    const duplicateTitle = existingTestimonials.find(
      (t: any) => t.title.toLowerCase() === title.toLowerCase(),
    );
    if (duplicateTitle) {
      throw new AppError(
        `A testimonial with the title "${title}" already exists. Please use a different title.`,
        StatusCode.BAD_REQUEST,
      );
    }

    const testimonial = await testimonialService.createTestimonial({
      shop_domain: shop,
      title,
      video_url,
      video_type: video_type || "youtube",
    });

    return res
      .status(StatusCode.CREATED)
      .json(
        new ApiResponse(true, "Testimonial created successfully.", testimonial),
      );
  },
);

// Update testimonial
export const updateTestimonial = asyncHandler(
  async (req: Request, res: Response) => {
    const id = parseInt(req.params.id as string, 10);
    const shop = getShop(req);
    const { title, video_url, video_type, is_active } = req.body;

    if (isNaN(id)) {
      throw new AppError("Invalid ID format.", StatusCode.BAD_REQUEST);
    }

    if (!title || !video_url) {
      throw new AppError(
        "Title and video URL are required.",
        StatusCode.BAD_REQUEST,
      );
    }

    const allTestimonials = await testimonialService.getAllTestimonials(shop);
    const duplicateTitle = allTestimonials.find(
      (t: any) => t.title.toLowerCase() === title.toLowerCase() && t.id !== id,
    );
    if (duplicateTitle) {
      throw new AppError(
        `A testimonial with the title "${title}" already exists. Please use a different title.`,
        StatusCode.BAD_REQUEST,
      );
    }

    const testimonial = await testimonialService.updateTestimonial(
      id,
      shop,
      { title, video_url, video_type, is_active },
    );

    if (!testimonial) {
      throw new AppError("Testimonial not found.", StatusCode.NOT_FOUND);
    }

    return res
      .status(StatusCode.OK)
      .json(
        new ApiResponse(true, "Testimonial updated successfully.", testimonial),
      );
  },
);

// Delete testimonial
export const deleteTestimonial = asyncHandler(
  async (req: Request, res: Response) => {
    const id = parseInt(req.params.id as string, 10);
    const shop = getShop(req);

    if (isNaN(id)) {
      throw new AppError("Invalid ID format.", StatusCode.BAD_REQUEST);
    }

    const deleted = await testimonialService.deleteTestimonial(id, shop);

    if (!deleted) {
      throw new AppError("Testimonial not found.", StatusCode.NOT_FOUND);
    }

    return res
      .status(StatusCode.OK)
      .json(
        new ApiResponse(true, "Testimonial deleted successfully."),
      );
  },
);

// Toggle active status
export const toggleActive = asyncHandler(
  async (req: Request, res: Response) => {
    const id = parseInt(req.params.id as string, 10);
    const shop = getShop(req);

    if (isNaN(id)) {
      throw new AppError("Invalid ID format.", StatusCode.BAD_REQUEST);
    }

    const testimonial = await testimonialService.toggleActive(id, shop);

    if (!testimonial) {
      throw new AppError("Testimonial not found.", StatusCode.NOT_FOUND);
    }

    return res
      .status(StatusCode.OK)
      .json(
        new ApiResponse(
          true,
          `Testimonial ${testimonial.is_active ? "activated" : "deactivated"} successfully.`,
          testimonial,
        ),
      );
  },
);

// Reorder testimonials
export const reorderTestimonials = asyncHandler(
  async (req: Request, res: Response) => {
    const shop = getShop(req);
    const { orderedIds } = req.body;

    if (!orderedIds || !Array.isArray(orderedIds)) {
      throw new AppError(
        "orderedIds must be an array.",
        StatusCode.BAD_REQUEST,
      );
    }

    await testimonialService.reorderTestimonials(shop, orderedIds);

    return res
      .status(StatusCode.OK)
      .json(
        new ApiResponse(true, "Testimonials reordered successfully."),
      );
  },
);
