import { Request, Response, NextFunction } from "express";
import { ApiResponse } from "../utils/api-response.js";
import { z } from "zod";
import { StatusCode } from "../utils/status-code.js";

export const validate =
  (schema: z.ZodObject<any>) =>
  (req: Request, res: Response, next: NextFunction) => {
    if (!req.body) {
      return res
        .status(StatusCode.BAD_REQUEST)
        .json(new ApiResponse(false, "Request body is required"));
    }

    try {
      schema.parse({
        body: req.body,
        params: req.params,
        query: req.query,
      });
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const messages = error.errors.map((e) => e.message);
        return res
          .status(StatusCode.BAD_REQUEST)
          .json(new ApiResponse(false, messages.join(", ")));
      }
      res
        .status(StatusCode.INTERNAL_SERVER_ERROR)
        .json(new ApiResponse(false, "Internal server error"));
    }
  };
