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

/**
 * Reduces Amazon CDN image to `maxPx` max dimension using URL-based sizing.
 * Amazon supports ._SL600_, ._SX600_, ._AC_UL600_ etc. in image URLs.
 * Non-Amazon URLs are returned unchanged.
 */
export function resizeAmazonImageUrl(url: string, maxPx = 600): string {
  if (!url.includes("amazon.com/images/")) return url;
  return url
    .replace(/\._AC_UL\d+_/g, `._AC_UL${maxPx}_`)
    .replace(/\._AC_SL\d+_/g, `._AC_SL${maxPx}_`)
    .replace(/\._SL\d+_/g, `._SL${maxPx}_`)
    .replace(/\._SX\d+_/g, `._SX${maxPx}_`)
    .replace(/\._AC_\.jpg/, `._AC_SX${maxPx}_.jpg`);
}
