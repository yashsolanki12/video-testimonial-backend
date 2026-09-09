import { Request, Response } from "express";
import { StatusCode } from "../utils/status-code.js";
import { ApiResponse } from "../utils/api-response.js";
import { asyncHandler } from "../utils/async-handler.js";
import { AppError } from "../utils/app-error.js";
import * as settingsService from "../services/settings.js";

const VALID_DISPLAY_LAYOUTS = ["slider", "grid"];
const VALID_SLIDER_EFFECTS = ["standard", "fade", "carousel"];

function getShop(req: Request): string {
  const shop = req.shopify?.session?.shop;
  if (!shop) {
    throw new AppError(
      "Unauthorized. Missing shop context.",
      StatusCode.UNAUTHORIZED,
    );
  }
  return shop;
}

// Get settings
export const getSettings = asyncHandler(async (req: Request, res: Response) => {
  const shop = getShop(req);
  const settings = await settingsService.getSettings(shop);

  return res
    .status(StatusCode.OK)
    .json(new ApiResponse(true, "Settings retrieved successfully.", settings));
});

// Update settings
export const updateSettings = asyncHandler(
  async (req: Request, res: Response) => {
    const shop = getShop(req);
    const { section_title, slider_effect, display_layout } = req.body;

    if (!section_title || !display_layout) {
      throw new AppError(
        "Section title and display layout are required.",
        StatusCode.BAD_REQUEST,
      );
    }

    if (!VALID_DISPLAY_LAYOUTS.includes(display_layout)) {
      throw new AppError(
        `Invalid display layout. Must be one of: ${VALID_DISPLAY_LAYOUTS.join(", ")}`,
        StatusCode.BAD_REQUEST,
      );
    }

    if (display_layout === "slider") {
      if (!slider_effect) {
        throw new AppError(
          "Slider effect is required when display layout is slider.",
          StatusCode.BAD_REQUEST,
        );
      }
      if (!VALID_SLIDER_EFFECTS.includes(slider_effect)) {
        throw new AppError(
          `Invalid slider effect. Must be one of: ${VALID_SLIDER_EFFECTS.join(", ")}`,
          StatusCode.BAD_REQUEST,
        );
      }
    }

    const settings = await settingsService.updateSettings(shop, {
      section_title,
      slider_effect: display_layout === "grid" ? "standard" : slider_effect,
      display_layout,
    });

    return res
      .status(StatusCode.OK)
      .json(new ApiResponse(true, "Settings updated successfully.", settings));
  },
);

// Create settings
export const createSettings = asyncHandler(
  async (req: Request, res: Response) => {
    const shop = getShop(req);
    const { section_title, slider_effect, display_layout } = req.body;

    if (!section_title || !display_layout) {
      throw new AppError(
        "Section title and display layout are required.",
        StatusCode.BAD_REQUEST,
      );
    }

    if (!VALID_DISPLAY_LAYOUTS.includes(display_layout)) {
      throw new AppError(
        `Invalid display layout. Must be one of: ${VALID_DISPLAY_LAYOUTS.join(", ")}`,
        StatusCode.BAD_REQUEST,
      );
    }

    if (display_layout === "slider") {
      if (!slider_effect) {
        throw new AppError(
          "Slider effect is required when display layout is slider.",
          StatusCode.BAD_REQUEST,
        );
      }
      if (!VALID_SLIDER_EFFECTS.includes(slider_effect)) {
        throw new AppError(
          `Invalid slider effect. Must be one of: ${VALID_SLIDER_EFFECTS.join(", ")}`,
          StatusCode.BAD_REQUEST,
        );
      }
    }

    const settings = await settingsService.createSettings(shop, {
      section_title,
      slider_effect: display_layout === "grid" ? "standard" : slider_effect,
      display_layout,
    });

    return res
      .status(StatusCode.CREATED)
      .json(new ApiResponse(true, "Settings created successfully.", settings));
  },
);

// Delete settings
export const deleteSettings = asyncHandler(
  async (req: Request, res: Response) => {
    const id = parseInt(req.params.id as string, 10);
    const shop = getShop(req);
    if (isNaN(id)) {
      throw new AppError("Invalid ID format.", StatusCode.BAD_REQUEST);
    }

    await settingsService.deleteSettings(id, shop);

    return res
      .status(StatusCode.OK)
      .json(new ApiResponse(true, "Settings deleted successfully.", null));
  },
);

// Get public settings (for storefront)
export const getPublicSettings = asyncHandler(
  async (req: Request, res: Response) => {
    const shop = req.headers["x-shopify-shop-domain"] as string;

    if (!shop) {
      throw new AppError("Missing shop domain header.", StatusCode.BAD_REQUEST);
    }

    const settings = await settingsService.getSettings(shop);

    return res
      .status(StatusCode.OK)
      .json(
        new ApiResponse(
          true,
          "Public settings retrieved successfully.",
          settings,
        ),
      );
  },
);
