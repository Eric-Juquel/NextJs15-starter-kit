/**
 * HOME PAGE — SERVER COMPONENT (RSC)
 *
 * No 'use client' directive = Server Component by default in App Router.
 * This component runs on the server and sends static HTML to the browser.
 * Zero JavaScript is shipped to the client for this page's rendering logic.
 */

import { HomeContent } from "@/features/home/components/HomeContent";

export default function HomePage() {
  return <HomeContent />;
}
