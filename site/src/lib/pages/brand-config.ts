export interface BrandConfig {
  slug: string;
  name: string;
  description: string;
  idPrefixes: string[];
}

export const BRANDS: BrandConfig[] = [
  { slug: "nike",       name: "Nike",        description: "Performance footwear, apparel, and sports equipment.",             idPrefixes: ["nike-"] },
  { slug: "adidas",     name: "Adidas",      description: "Athletic footwear, apparel, and sports gear.",                    idPrefixes: ["adidas-"] },
  { slug: "dyson",      name: "Dyson",       description: "Premium home appliances — vacuums, air purifiers, hair care.",    idPrefixes: ["dyson-"] },
  { slug: "philips",    name: "Philips",     description: "Electronics, grooming, and healthcare products.",                 idPrefixes: ["philips-"] },
  { slug: "anker",      name: "Anker",       description: "Charging, audio, and portable power products.",                  idPrefixes: ["anker-"] },
  { slug: "apple",      name: "Apple",       description: "iPhones, AirPods, Apple Watch, and Mac accessories.",            idPrefixes: ["apple-"] },
  { slug: "kitchenaid", name: "KitchenAid",  description: "Stand mixers, blenders, and kitchen appliances.",                idPrefixes: ["kitchenaid-"] },
  { slug: "garmin",     name: "Garmin",      description: "GPS fitness trackers, smartwatches, and navigation devices.",    idPrefixes: ["garmin-"] },
  { slug: "breville",   name: "Breville",    description: "Premium kitchen appliances — espresso machines, air fryers.",    idPrefixes: ["breville-"] },
  { slug: "nespresso",  name: "Nespresso",   description: "Capsule coffee machines and espresso systems.",                  idPrefixes: ["nespresso-"] },
  { slug: "panasonic",  name: "Panasonic",   description: "Consumer electronics, home appliances, and grooming.",           idPrefixes: ["panasonic-"] },
  { slug: "cuisinart",  name: "Cuisinart",   description: "Kitchen appliances — food processors, coffee makers, and more.", idPrefixes: ["cuisinart-"] },
  { slug: "rogue",      name: "Rogue",       description: "Professional-grade fitness equipment — barbells, racks, plates.", idPrefixes: ["rogue-"] },
  { slug: "bowflex",    name: "Bowflex",     description: "Adjustable dumbbells, home gyms, and cardio equipment.",         idPrefixes: ["bowflex-"] },
  { slug: "oxo",        name: "OXO",         description: "Kitchen tools and storage designed for everyday use.",           idPrefixes: ["oxo-"] },
  { slug: "lodge",      name: "Lodge",       description: "Cast iron cookware and skillets made in the USA.",               idPrefixes: ["lodge-"] },
  { slug: "hario",      name: "Hario",       description: "Japanese coffee brewing equipment — V60, kettles, scales.",      idPrefixes: ["hario-"] },
];

export const BRAND_MAP = Object.fromEntries(BRANDS.map((b) => [b.slug, b]));
export const BRAND_SLUGS = BRANDS.map((b) => b.slug);
