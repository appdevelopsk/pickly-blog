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
import { BATCH7 } from "./batch-articles-batch7";
import { BATCH8, BATCH8_OFFERS } from "./batch-articles-batch8";
import { BATCH9, BATCH9_OFFERS } from "./batch-articles-batch9";
import { BATCH10, BATCH10_OFFERS } from "./batch-articles-batch10";

export const NEW_OFFERS = [...OFFERS, ...BATCH8_OFFERS, ...BATCH9_OFFERS, ...BATCH10_OFFERS];

export const ARTICLES = [
  ...FASHION,
  ...FINANCE,
  ...PARENTING,
  ...PETS,
  ...TRAVEL,
  ...TECH,
  ...BATCH5,
  ...BATCH6,
  ...BATCH7,
  ...BATCH8,
  ...BATCH9,
  ...BATCH10,
];
