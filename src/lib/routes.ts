import type { Dataset } from "./types.ts";

export function siteRoutes(data: Dataset): string[] {
  return [
    "/",
    "/methods/",
    ...data.industries.map((industry) => `/industries/${industry.slug}/`),
    ...data.roles.map((role) => `/roles/${role.slug}/`),
  ];
}
