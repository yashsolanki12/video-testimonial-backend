import { Request, Response, NextFunction } from "express";
import { StatusCode } from "../utils/status-code.js";
import { ApiResponse } from "../utils/api-response.js";
import Shop from "../models/shop.js";

function normalizeShop(raw: string): string {
  let shop = raw.toLowerCase().trim();
  shop = shop.replace(/^https?:\/\//, "");
  if (!shop.endsWith(".myshopify.com")) {
    shop = `${shop}.myshopify.com`;
  }
  return shop;
}

export const validateShopifyHeader = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const rawShop =
    (req.headers["x-shopify-shop-domain"] as string) ||
    (req.headers["x-shop-domain"] as string) ||
    (req.query.shop as string);

  if (!rawShop) {
    return res
      .status(StatusCode.BAD_REQUEST)
      .json(
        new ApiResponse(
          false,
          "Missing shop domain header(x-shopify-shop-domain)",
        ),
      );
  }

  const shop = normalizeShop(rawShop);

  try {
    let shopRecord = await Shop.findOne({ where: { shop } });

    if (!shopRecord) {
      shopRecord = await Shop.create({
        shop,
        shopifyToken: "pending",
        scope: "pending",
      });
    }

    req.shopify = {
      session: {
        shop,
        shopId: shopRecord.id,
        shopifyToken: shopRecord.shopifyToken,
        accessToken: shopRecord.shopifyToken,
        scope: shopRecord.scope,
      },
    };

    next();
  } catch (error: any) {
    console.error("[Auth] Error:", error.message);
    return res
      .status(StatusCode.INTERNAL_SERVER_ERROR)
      .json(new ApiResponse(false, "Authentication failed"));
  }
};
