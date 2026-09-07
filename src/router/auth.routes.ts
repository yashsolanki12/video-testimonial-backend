import { Router, Request, Response } from "express";
import { getSequelize } from "../config/db.js";
import Shop from "../models/shop.js";
import { ApiResponse } from "../utils/api-response.js";
import { StatusCode } from "../utils/status-code.js";
import { AppError } from "../utils/app-error.js";
import { asyncHandler } from "../utils/async-handler.js";

const router = Router();

router.post(
  "/post-setup",
  asyncHandler(async (req: Request, res: Response) => {
    const { shop } = req.body;

    if (!shop) {
      throw new AppError("Missing shop parameter", StatusCode.BAD_REQUEST);
    }

    const sequelize = getSequelize();
    const [sessions] = await sequelize.query(
      `SELECT id, shop, accessToken, scope FROM shopify_sessions WHERE shop = ? LIMIT 1`,
      { replacements: [shop] },
    );

    if (!sessions || (sessions as any[]).length === 0) {
      throw new AppError(`No session found for ${shop}`, StatusCode.NOT_FOUND);
    }

    const session = (sessions as any[])[0];

    // Find or create shop record
    let shopRecord = await Shop.findOne({ where: { shop } });
    if (!shopRecord) {
      shopRecord = await Shop.create({
        shop,
        shopifyToken: session.accessToken,
        scope: session.scope || "pending",
      });
    } else {
      // Update token and scope from session
      await shopRecord.update({
        shopifyToken: session.accessToken,
        scope: session.scope || shopRecord.scope,
        isActive: true,
      });
    }

    console.log(`[PostSetup] Shop record ready for ${shop} (id: ${shopRecord.id})`);
    res
      .status(StatusCode.OK)
      .json(
        new ApiResponse(true, "Post-setup completed", { shopId: shopRecord.id }),
      );
  }),
);

export default router;
