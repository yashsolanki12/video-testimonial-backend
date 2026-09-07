import { Router, Request, Response, NextFunction } from "express";
import crypto from "crypto";
import Testimonial from "../models/testimonial.js";
import Settings from "../models/settings.js";
import { ApiResponse } from "../utils/api-response.js";
import { StatusCode } from "../utils/status-code.js";
import { AppError } from "../utils/app-error.js";
import { asyncHandler } from "../utils/async-handler.js";

const router = Router();

function verifyShopifyWebhook(req: Request, res: Response, next: NextFunction) {
  const hmacHeader = req.headers["x-shopify-hmac-sha256"] as string;
  if (!hmacHeader) {
    return res
      .status(StatusCode.UNAUTHORIZED)
      .json(new ApiResponse(false, "Missing HMAC header"));
  }

  const rawBody = req.body;
  if (!rawBody) {
    return res
      .status(StatusCode.UNAUTHORIZED)
      .json(new ApiResponse(false, "Missing request body"));
  }

  const hash = crypto
    .createHmac("sha256", process.env.SHOPIFY_API_SECRET || "")
    .update(rawBody, "utf8")
    .digest("base64");

  const trusted = Buffer.from(hash, "base64");
  const received = Buffer.from(hmacHeader, "base64");

  if (!crypto.timingSafeEqual(trusted, received)) {
    return res
      .status(StatusCode.UNAUTHORIZED)
      .json(new ApiResponse(false, "Invalid HMAC"));
  }

  req.body = JSON.parse(rawBody.toString("utf8"));
  next();
}

router.post(
  "/uninstall",
  verifyShopifyWebhook,
  asyncHandler(async (req: Request, res: Response) => {
    const shop = req.body.shop;
    if (!shop) {
      throw new AppError("Missing shop parameter", StatusCode.BAD_REQUEST);
    }

    console.log(`Received app/uninstalled webhook for ${shop}`);

    await Promise.all([
      Testimonial.destroy({ where: { shop_domain: shop } }),
      Settings.destroy({ where: { shop_domain: shop } }),
    ]);

    console.log(`Cleaned up data for ${shop}`);
    res
      .status(StatusCode.OK)
      .json(new ApiResponse(true, "Uninstall webhook processed successfully"));
  }),
);

export default router;
