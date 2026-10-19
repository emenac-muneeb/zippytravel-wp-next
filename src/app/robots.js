import { WEB_URL } from "../Helpers/WebsiteUrl";

/** @returns {import("next").MetadataRoute.Robots} */
export default function robots() {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
    },
    sitemap: [`${WEB_URL}/sitemap.xml`, `${WEB_URL}/post-sitemap.xml`],
  };
}