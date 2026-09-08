import Settings from "../models/settings.js";
import { ISettings } from "../types/index.js";

// Get settings by shop domain
export const getSettings = async (
  shopDomain: string,
): Promise<ISettings | null> => {
  const settings = await Settings.findOne({
    where: { shop_domain: shopDomain },
  });

  return settings || null;
};

// Update settings
export const updateSettings = async (
  shopDomain: string,
  data: Partial<
    Pick<ISettings, "section_title" | "slider_effect" | "display_layout">
  >,
): Promise<ISettings> => {
  const settings = await Settings.findOne({
    where: { shop_domain: shopDomain },
  });

  if (!settings) {
    throw new Error("Settings not found. Please create settings first.");
  }

  await settings.update(data);
  return settings.reload();
};

// Create settings
export const createSettings = async (
  shopDomain: string,
  data: Pick<ISettings, "section_title" | "slider_effect" | "display_layout">,
): Promise<ISettings> => {
  const existing = await Settings.findOne({
    where: { shop_domain: shopDomain },
  });

  if (existing) {
    throw new Error(
      "Settings already exist for this shop. Use update instead.",
    );
  }

  return await Settings.create({
    shop_domain: shopDomain,
    section_title: data.section_title,
    slider_effect: data.slider_effect,
    display_layout: data.display_layout,
  });
};

// Delete settings
export const deleteSettings = async (
  id: number,
  shopDomain: string,
): Promise<void> => {
  const settings = await Settings.findOne({
    where: { id, shop_domain: shopDomain },
  });

  if (!settings) {
    throw new Error("Settings not found for this shop.");
  }

  await settings.destroy();
};
