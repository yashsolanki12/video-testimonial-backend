import { Router, Request, Response } from "express";
import { getSequelize } from "../config/db.js";
import { ApiResponse } from "../utils/api-response.js";
import { StatusCode } from "../utils/status-code.js";
import { asyncHandler } from "../utils/async-handler.js";

const router = Router();

function normalizeShop(raw: string): string {
  let shop = raw.toLowerCase().trim();
  shop = shop.replace(/^https?:\/\//, "");
  if (!shop.endsWith(".myshopify.com")) {
    shop = `${shop}.myshopify.com`;
  }
  return shop;
}

router.get(
  "/current",
  asyncHandler(async (req: Request, res: Response) => {
    const shop =
      (req.headers["x-shopify-shop-domain"] as string) ||
      (req.headers["x-shop-domain"] as string);

    if (!shop) {
      return res
        .status(StatusCode.BAD_REQUEST)
        .json(new ApiResponse(false, "Missing x-shopify-shop-domain header"));
    }

    const normalized = normalizeShop(shop);
    const sequelize = getSequelize();
    const [sessions] = await sequelize.query(
      `SELECT id, shop, isOnline, scope, expires, accessToken, state, refreshToken, refreshTokenExpires, firstName, lastName, email, accountOwner, locale, collaborator, emailVerified, created_at, updated_at FROM shopify_sessions WHERE shop = ? LIMIT 1`,
      { replacements: [normalized] },
    );

    if (!(sessions as any[]).length) {
      return res
        .status(StatusCode.NOT_FOUND)
        .json(new ApiResponse(false, "Session not found"));
    }

    const session = (sessions as any[])[0];
    const hasToken = !!session.accessToken;

    res.status(StatusCode.OK).json(
      new ApiResponse(true, "Session fetched successfully", {
        ...session,
        accessToken: hasToken ? "****" + session.accessToken.slice(-4) : null,
        refreshToken: session.refreshToken
          ? "****" + session.refreshToken.slice(-4)
          : null,
        hasAccessToken: hasToken,
        hasRefreshToken: !!session.refreshToken,
      }),
    );
  }),
);

router.get(
  "/debug/all",
  asyncHandler(async (_req: Request, res: Response) => {
    const sequelize = getSequelize();
    const [sessions] = await sequelize.query(
      `SELECT id, shop, isOnline, scope, accessToken IS NOT NULL as hasToken, created_at, updated_at FROM shopify_sessions`,
    );

    res
      .status(StatusCode.OK)
      .json(new ApiResponse(true, "All sessions", sessions));
  }),
);

export default router;
