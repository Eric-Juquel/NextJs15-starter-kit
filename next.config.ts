import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  // Strict mode for better RSC hydration detection
  reactStrictMode: true,
};

export default withNextIntl(nextConfig);
