import type { NavNode } from "@/types/navigation";
import { publicNav } from "./public";
import { studentNav } from "./student";
import { teacherNav } from "./teacher";
import { adminNav } from "./admin";

export { publicNav, studentNav, teacherNav, adminNav };

const allTrees: NavNode[][] = [publicNav, studentNav, teacherNav, adminNav];

function search(nodes: NavNode[], href: string): NavNode | null {
  for (const node of nodes) {
    if (node.href === href) return node;
    if (node.children) {
      const found = search(node.children, href);
      if (found) return found;
    }
  }
  return null;
}

export function findNode(href: string): NavNode | null {
  for (const tree of allTrees) {
    const found = search(tree, href);
    if (found) return found;
  }
  return null;
}

/** Parent route that exists in the config (for "Back" links). */
export function findParent(href: string): NavNode | null {
  const parts = href.split("/").filter(Boolean);
  while (parts.length > 1) {
    parts.pop();
    const node = findNode("/" + parts.join("/"));
    if (node) return node;
  }
  return null;
}
