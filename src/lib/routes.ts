import type { Dataset } from "./types.ts";

export function siteRoutes(data: Dataset): string[] {
  return [
    "/",
    "/compare/",
    "/data/",
    "/methods/",
    ...data.industries.map((industry) => `/industries/${industry.slug}/`),
    ...data.roles.map((role) => `/roles/${role.slug}/`),
  ];
}
