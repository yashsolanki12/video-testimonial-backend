import { getSequelize } from "../config/db.js";

export async function getRealSession(shop: string) {
  const sequelize = getSequelize();
  const [sessions] = await sequelize.query(
    `SELECT id, shop, accessToken, scope FROM shopify_sessions WHERE shop = ? AND accessToken IS NOT NULL LIMIT 1`,
    { replacements: [shop] },
  );

  if (!(sessions as any[]).length) {
    return null;
  }

  const session = (sessions as any[])[0];
  return {
    shop: session.shop,
    accessToken: session.accessToken,
    scope: session.scope,
  };
}
