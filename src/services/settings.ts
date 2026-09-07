import Settings from "../models/settings.js";
import { ISettings } from "../types/index.js";

// Get settings by shop domain
export const getSettings = async (
  shopDomain: string,
): Promise<ISettings> => {
  let settings = await Settings.findOne({
    where: { shop_domain: shopDomain },
  });

  if (!settings) {
    settings = await Settings.create({
      shop_domain: shopDomain,
      section_title: "Video Testimonials",
      slider_effect: "standard",
      display_layout: "slider",
    });
  }

  return settings;
};

// Update settings
export const updateSettings = async (
  shopDomain: string,
  data: Partial<Pick<ISettings, "section_title" | "slider_effect" | "display_layout">>,
): Promise<ISettings> => {
  const settings = await Settings.findOne({
    where: { shop_domain: shopDomain },
  });

  if (settings) {
    await settings.update(data);
    return settings.reload();
  }

  return await Settings.create({
    shop_domain: shopDomain,
    section_title: data.section_title || "Video Testimonials",
    slider_effect: data.slider_effect || "standard",
    display_layout: data.display_layout || "slider",
  });
};
