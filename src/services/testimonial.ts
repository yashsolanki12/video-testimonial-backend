import Testimonial from "../models/testimonial.js";
import { ITestimonial } from "../types/index.js";
import { AppError } from "../utils/app-error.js";
import { StatusCode } from "../utils/status-code.js";

const MAX_TESTIMONIALS = 10;

// Get all testimonials by shop domain
export const getAllTestimonials = async (
  shopDomain: string,
): Promise<ITestimonial[]> => {
  return await Testimonial.findAll({
    where: { shop_domain: shopDomain },
    order: [["sort_order", "ASC"]],
  });
};

// Get active testimonials by shop domain (for storefront)
export const getActiveTestimonials = async (
  shopDomain: string,
): Promise<ITestimonial[]> => {
  return await Testimonial.findAll({
    where: { shop_domain: shopDomain, is_active: true },
    order: [["sort_order", "ASC"]],
  });
};

// Get testimonial by ID
export const getTestimonialById = async (
  id: number,
  shopDomain: string,
): Promise<ITestimonial | null> => {
  return await Testimonial.findOne({
    where: { id, shop_domain: shopDomain },
  });
};

// Create testimonial
export const createTestimonial = async (
  data: Pick<ITestimonial, "shop_domain" | "title" | "video_url" | "video_type">,
): Promise<ITestimonial> => {
  const count = await Testimonial.count({
    where: { shop_domain: data.shop_domain },
  });

  if (count >= MAX_TESTIMONIALS) {
    throw new AppError(
      `Maximum of ${MAX_TESTIMONIALS} testimonials allowed`,
      StatusCode.FORBIDDEN,
    );
  }

  const maxOrder = await Testimonial.max("sort_order", {
    where: { shop_domain: data.shop_domain },
  });

  const sortOrder = (maxOrder as number) + 1 || 0;

  return await Testimonial.create({
    shop_domain: data.shop_domain,
    title: data.title,
    video_url: data.video_url,
    video_type: data.video_type,
    sort_order: sortOrder,
    is_active: true,
  });
};

// Update testimonial
export const updateTestimonial = async (
  id: number,
  shopDomain: string,
  data: Partial<Pick<ITestimonial, "title" | "video_url" | "video_type" | "is_active">>,
): Promise<ITestimonial | null> => {
  const testimonial = await Testimonial.findOne({
    where: { id, shop_domain: shopDomain },
  });

  if (!testimonial) return null;

  await testimonial.update(data);
  return testimonial.reload();
};

// Delete testimonial
export const deleteTestimonial = async (
  id: number,
  shopDomain: string,
): Promise<boolean> => {
  const deleted = await Testimonial.destroy({
    where: { id, shop_domain: shopDomain },
  });

  return deleted > 0;
};

// Toggle active status
export const toggleActive = async (
  id: number,
  shopDomain: string,
): Promise<ITestimonial | null> => {
  const testimonial = await Testimonial.findOne({
    where: { id, shop_domain: shopDomain },
  });

  if (!testimonial) return null;

  await testimonial.update({ is_active: !testimonial.is_active });
  return testimonial.reload();
};

// Reorder testimonials
export const reorderTestimonials = async (
  shopDomain: string,
  orderedIds: number[],
): Promise<void> => {
  const updates = orderedIds.map((id, index) =>
    Testimonial.update(
      { sort_order: index },
      { where: { id, shop_domain: shopDomain } },
    ),
  );

  await Promise.all(updates);
};
