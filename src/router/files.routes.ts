import { Router, Request } from "express";
import { validateShopifyHeader } from "../middleware/auth.js";
import { getRealSession } from "../services/session.js";
import { ApiResponse } from "../utils/api-response.js";
import { StatusCode } from "../utils/status-code.js";
import { AppError } from "../utils/app-error.js";
import { asyncHandler } from "../utils/async-handler.js";
import { getPaginationParams, paginate } from "../utils/pagination.js";
import { FILES_QUERY } from "../graphql/shopify.js";

const router = Router();

router.use(validateShopifyHeader);

router.get(
  "/videos",
  asyncHandler(async (req: Request, res) => {
    const shop = req.shopify!.session.shop;
    const session = await getRealSession(shop);

    if (!session) {
      throw new AppError("No valid session found", StatusCode.UNAUTHORIZED);
    }

    const { page, limit } = getPaginationParams(req.query as Record<string, string>);

    const videos: any[] = [];
    let hasNextPage = true;
    let afterCursor: string | null = null;

    while (hasNextPage) {
      const response = await fetch(
        `https://${shop}/admin/api/2026-07/graphql.json`,
        {
          method: "POST",
          headers: {
            "X-Shopify-Access-Token": session.accessToken,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            query: FILES_QUERY,
            variables: { first: 50, after: afterCursor },
          }),
        },
      );

      if (!response.ok) {
        const error = await response.text();
        console.error("[Files] Shopify GraphQL error:", response.status, error);
        throw new AppError(`Shopify API error: ${response.status} - ${error}`, StatusCode.BAD_REQUEST);
      }

      const result: any = await response.json();

      if (result.errors) {
        console.error("[Files] GraphQL errors:", JSON.stringify(result.errors));
        throw new AppError(`GraphQL errors: ${result.errors.map((e: any) => e.message).join(", ")}`, StatusCode.BAD_REQUEST);
      }

      const files = result.data?.files?.edges || [];

      for (const fileEdge of files) {
        const file = fileEdge.node;

        if (file.originalSource) {
          const mp4Source = file.sources?.find((s: any) => s.format === "mp4") || file.sources?.[0];
          videos.push({
            id: file.id,
            title: file.alt || "",
            url: mp4Source?.url || file.originalSource.url,
            type: "shopify",
            mediaType: "VIDEO",
            createdAt: file.createdAt,
          });
        } else if (file.embedUrl) {
          videos.push({
            id: file.id,
            title: file.alt || "",
            url: file.embedUrl || file.originUrl || "",
            type: file.embedUrl?.includes("youtube") ? "youtube" : "vimeo",
            mediaType: "EXTERNAL_VIDEO",
            createdAt: file.createdAt,
          });
        }
      }

      hasNextPage = result.data?.files?.pageInfo?.hasNextPage || false;
      afterCursor = result.data?.files?.pageInfo?.endCursor || null;
    }

    const paginatedVideos = paginate(videos, { page, limit });

    console.log(`[Files] Fetched ${videos.length} total videos, returning page ${page}`);

    res.status(StatusCode.OK).json(
      new ApiResponse(true, "Videos fetched successfully", paginatedVideos),
    );
  }),
);

export default router;
