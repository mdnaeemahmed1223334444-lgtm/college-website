// Static site info. Edit freely. Dynamic values live in the `site_settings` table.
export const siteConfig = {
  name: "Your College Name",
  description: "Official website of Your College",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
} as const;
