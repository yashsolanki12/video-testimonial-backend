declare namespace Express {
  interface Request {
    shopify?: {
      session: {
        shop: string;
        shopId: number;
        shopifyToken: string;
        accessToken: string;
        scope: string;
      };
    };
  }
}
