export type { ArticleDef, NewOffer } from "./batch-articles-types";
import { OFFERS } from "./batch-articles-offers";
import { FASHION } from "./batch-articles-fashion";
import { FINANCE } from "./batch-articles-finance";
import { PARENTING } from "./batch-articles-parenting";
import { PETS } from "./batch-articles-pets";
import { TRAVEL } from "./batch-articles-travel";
import { TECH } from "./batch-articles-tech";
import { BATCH5 } from "./batch-articles-batch5";
import { BATCH6 } from "./batch-articles-batch6";

export const NEW_OFFERS = OFFERS;

export const ARTICLES = [
  ...FASHION,
  ...FINANCE,
  ...PARENTING,
  ...PETS,
  ...TRAVEL,
  ...TECH,
  ...BATCH5,
  ...BATCH6,
];
