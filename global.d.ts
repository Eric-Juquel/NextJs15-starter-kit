// Allow TypeScript to recognize plain CSS side-effect imports.
// Next.js handles CSS via its own loader — no runtime types are needed.
declare module "*.css" {}
