import type { AffiliateOffer } from "./types";

/**
 * Returns the display image URL for an offer.
 * Only uses the explicit imageUrl field — Amazon's ASIN-based CDN paths
 * (images-na.ssl-images-amazon.com/images/P/) return blank GIF stubs and
 * cannot be used to derive real product images without the PA API.
 */
export function getOfferImageUrl(offer: AffiliateOffer): string | null {
  return offer.imageUrl ?? null;
}
