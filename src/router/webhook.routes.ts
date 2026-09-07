import { Router, Request, Response, NextFunction } from "express";
import crypto from "crypto";
import Testimonial from "../models/testimonial.js";
import Settings from "../models/settings.js";
import Shop from "../models/shop.js";
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

  const cleanSecret = (process.env.SHOPIFY_API_SECRET || "").trim();
  const secrets = [cleanSecret, cleanSecret.replace("shpss_", "")];

  let verified = false;
  for (const secret of secrets) {
    const hash = crypto
      .createHmac("sha256", secret)
      .update(rawBody, "utf8")
      .digest("base64");

    const trusted = Buffer.from(hash, "base64");
    const received = Buffer.from(hmacHeader, "base64");

    if (
      trusted.length === received.length &&
      crypto.timingSafeEqual(trusted, received)
    ) {
      verified = true;
      break;
    }
  }

  if (!verified) {
    return res
      .status(StatusCode.UNAUTHORIZED)
      .json(new ApiResponse(false, "Invalid HMAC"));
  }

  req.body = JSON.parse(rawBody.toString("utf8"));
  next();
}

router.post(
  "/webhook",
  verifyShopifyWebhook,
  asyncHandler(async (req: Request, res: Response) => {
    const topic = req.headers["x-shopify-topic"] as string;
    const shopDomain = req.headers["x-shopify-shop-domain"] as string;
    const shop = shopDomain || req.body?.myshopify_domain || req.body?.shop;

    console.log(`[Webhook] Received topic=${topic} shop=${shop}`);

    if (topic === "app/uninstalled") {
      if (!shop) {
        throw new AppError(
          "Missing shop in uninstall webhook",
          StatusCode.BAD_REQUEST,
        );
      }

      // Soft-delete: null out tokens in shopify_sessions
      const { getSequelize } = await import("../config/db.js");
      const sequelize = getSequelize();
      await sequelize.query(
        `UPDATE shopify_sessions SET accessToken = NULL, refreshToken = NULL WHERE shop = ?`,
        { replacements: [shop] },
      );

      // Delete shop record
      // await Shop.destroy({ where: { shop } });
      await Shop.update({ isActive: false }, { where: { shop } });

      // Delete testimonials and settings
      await Promise.all([
        Testimonial.destroy({ where: { shop_domain: shop } }),
        Settings.destroy({ where: { shop_domain: shop } }),
      ]);

      console.log(`[Webhook] Uninstall cleanup completed for ${shop}`);
    }

    if (topic === "app/scopes_update") {
      if (!shop) {
        throw new AppError(
          "Missing shop in scopes_update webhook",
          StatusCode.BAD_REQUEST,
        );
      }

      const current = req.body?.current;
      if (current) {
        const { getSequelize } = await import("../config/db.js");
        const sequelize = getSequelize();
        await sequelize.query(
          `UPDATE shopify_sessions SET scope = ? WHERE shop = ?`,
          { replacements: [current, shop] },
        );
        console.log(`[Webhook] Scopes updated for ${shop}`);
      }
    }

    res.status(StatusCode.OK).json(new ApiResponse(true, "Received"));
  }),
);

export default router;
