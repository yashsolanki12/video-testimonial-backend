import { Request, Response } from "express";
import { StatusCode } from "../utils/status-code.js";
import { ApiResponse } from "../utils/api-response.js";
import { asyncHandler } from "../utils/async-handler.js";
import { AppError } from "../utils/app-error.js";
import * as settingsService from "../services/settings.js";

function getShop(req: Request): string {
  const shop = req.shopify?.session?.shop;
  if (!shop) {
    throw new AppError("Unauthorized. Missing shop context.", StatusCode.UNAUTHORIZED);
  }
  return shop;
}

// Get settings
export const getSettings = asyncHandler(
  async (req: Request, res: Response) => {
    const shop = getShop(req);
    const settings = await settingsService.getSettings(shop);

    return res
      .status(StatusCode.OK)
      .json(
        new ApiResponse(true, "Settings retrieved successfully.", settings),
      );
  },
);

// Update settings
export const updateSettings = asyncHandler(
  async (req: Request, res: Response) => {
    const shop = getShop(req);
    const { section_title, slider_effect, display_layout } = req.body;

    if (!section_title) {
      throw new AppError(
        "Section title is required.",
        StatusCode.BAD_REQUEST,
      );
    }

    const settings = await settingsService.updateSettings(shop, {
      section_title,
      slider_effect,
      display_layout,
    });

    return res
      .status(StatusCode.OK)
      .json(
        new ApiResponse(true, "Settings updated successfully.", settings),
      );
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
        new ApiResponse(true, "Public settings retrieved successfully.", settings),
      );
  },
);
