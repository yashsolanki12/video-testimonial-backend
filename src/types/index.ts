export interface ITestimonial {
  id?: number;
  shop_domain: string;
  title: string;
  video_url: string;
  video_type: "youtube" | "vimeo" | "shopify";
  sort_order: number;
  is_active: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ISettings {
  id?: number;
  shop_domain: string;
  section_title: string;
  slider_effect: "standard" | "fade" | "carousel";
  display_layout: "slider" | "grid";
  createdAt?: Date;
  updatedAt?: Date;
}
