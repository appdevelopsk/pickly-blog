export type { ArticleDef, NewOffer } from "./batch-articles-types";
import { OFFERS } from "./batch-articles-offers";
import { FASHION } from "./batch-articles-fashion";
import { FINANCE } from "./batch-articles-finance";
import { PARENTING } from "./batch-articles-parenting";
import { PETS } from "./batch-articles-pets";
import { TRAVEL } from "./batch-articles-travel";

export const NEW_OFFERS = OFFERS;

export const ARTICLES = [
  ...FASHION,
  ...FINANCE,
  ...PARENTING,
  ...PETS,
  ...TRAVEL,
];
