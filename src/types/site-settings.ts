export type HomeBannerSlide = {
  id: string;
  eyebrow: string;
  title: string;
  description: string;
  imageUrl: string;
  linkedProductSlug: string;
};

export type HomeBannerSettings = {
  rotationMs: number;
  slides: HomeBannerSlide[];
};
