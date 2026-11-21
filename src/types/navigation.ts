// One node = one route (page). `sections` = things shown INSIDE that page (widgets, steps, fields).
// `hidden` = page exists but is not shown in the header/footer menus.
export type NavNode = {
  title: string;
  href: string;
  children?: NavNode[];
  sections?: string[];
  hidden?: boolean;
};
