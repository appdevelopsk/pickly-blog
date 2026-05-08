import type { NextConfig } from "next";
import path from "node:path";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/lib/i18n/request.ts");

const config: NextConfig = {
  output: "export",
  outputFileTracingRoot: path.resolve(__dirname),
  reactStrictMode: true,
  poweredByHeader: false,
  images: {
    unoptimized: true,
    formats: ["image/avif", "image/webp"],
  },
  trailingSlash: true,
};

export default withNextIntl(config);
