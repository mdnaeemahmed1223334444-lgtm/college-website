"use client";

import { useActionState, useState } from "react";
import { saveNavigationItemAction, deleteNavigationItemAction } from "@/features/website/actions";
import type { NavigationItemRecord, ActionFeedback } from "@/features/website/types";
import { SubmitButton, FeedbackAlert } from "./FormControls";

export default function NavigationManager({
  headerItems,
  footerItems,
}: {
  headerItems: NavigationItemRecord[];
  footerItems: NavigationItemRecord[];
}) {
  const [activeTab, setActiveTab] = useState<"header" | "footer">("header");
  const [editingItem, setEditingItem] = useState<NavigationItemRecord | null>(null);
  const [saveState, saveAction] = useActionState<ActionFeedback, FormData>(saveNavigationItemAction, {});
  const [deleteMsg, setDeleteMsg] = useState<string | null>(null);

  const currentItems = activeTab === "header" ? headerItems : footerItems;

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to remove this menu link?")) return;
    const res = await deleteNavigationItemAction(id);
    if (res.error) setDeleteMsg(res.error);
    else setDeleteMsg("Menu link removed successfully.");
  }

  return (
    <div className="space-y-5">

      {/* Explanation box */}
      <div className="rounded-lg border border-blue-100 bg-blue-50 p-4">
        <p className="text-sm text-blue-900 font-medium">📋 What is this?</p>
        <p className="text-xs text-blue-700 mt-1 leading-relaxed">
          These are the <strong>navigation links</strong> shown on your website. The <strong>Top Menu</strong> appears
          in the header bar at the top of every page. The <strong>Footer Links</strong> appear at the very bottom.
          Add, edit, or remove links as needed.
        </p>
      </div>

      {/* Tab bar */}
      <div className="flex border-b">
        <button
          type="button"
          onClick={() => { setActiveTab("header"); setEditingItem(null); }}
          className={`border-b-2 px-5 py-2.5 text-sm font-semibold transition ${
            activeTab === "header"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          🔝 Top Menu ({headerItems.length} links)
        </button>
        <button
          type="button"
          onClick={() => { setActiveTab("footer"); setEditingItem(null); }}
          className={`border-b-2 px-5 py-2.5 text-sm font-semibold transition ${
            activeTab === "footer"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          🔽 Footer Links ({footerItems.length} links)
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Existing Items Table */}
        <div className="lg:col-span-2 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-gray-900 text-sm">
              {activeTab === "header" ? "🔝 Current Top Menu Links" : "🔽 Current Footer Links"}
            </h3>
            <button
              type="button"
              onClick={() => setEditingItem(null)}
              className="text-sm text-blue-600 font-semibold hover:underline"
            >
              + Add New Link
            </button>
          </div>

          {deleteMsg && (
            <div className="rounded border border-green-200 bg-green-50 p-2 text-xs text-green-800">
              ✅ {deleteMsg}
            </div>
          )}

          <div className="overflow-hidden rounded-lg border bg-white shadow-sm">
            {currentItems.length === 0 ? (
              <div className="p-6 text-center text-sm text-gray-400">
                <p>No custom links added yet.</p>
                <p className="text-xs mt-1">The website is currently using its default menu. Add a link to customize it.</p>
              </div>
            ) : (
              <table className="w-full text-left text-sm text-gray-700">
                <thead className="border-b bg-gray-50 text-xs font-semibold text-gray-500 uppercase">
                  <tr>
                    <th className="px-3 py-2">Order</th>
                    <th className="px-3 py-2">Menu Text</th>
                    <th className="px-3 py-2">Goes To (Link)</th>
                    <th className="px-3 py-2">Visible?</th>
                    <th className="px-3 py-2 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {currentItems.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="px-3 py-2 text-center text-gray-400 text-xs font-mono">{item.position}</td>
                      <td className="px-3 py-2 font-semibold text-gray-900">{item.label}</td>
                      <td className="px-3 py-2 text-blue-600 text-xs font-mono truncate max-w-xs">{item.href}</td>
                      <td className="px-3 py-2">
                        {item.is_visible ? (
                          <span className="inline-flex rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-semibold text-green-800">
                            ✓ Shown
                          </span>
                        ) : (
                          <span className="inline-flex rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-semibold text-gray-500">
                            Hidden
                          </span>
                        )}
                      </td>
                      <td className="px-3 py-2 text-right space-x-3">
                        <button
                          type="button"
                          onClick={() => setEditingItem(item)}
                          className="text-xs font-semibold text-blue-600 hover:underline"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(item.id)}
                          className="text-xs font-semibold text-red-600 hover:underline"
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Add / Edit Form */}
        <div className="rounded-lg border bg-white p-5 shadow-sm space-y-4">
          <h3 className="font-bold text-gray-900 text-sm border-b pb-2">
            {editingItem ? `✏️ Edit: ${editingItem.label}` : `➕ Add New ${activeTab === "header" ? "Top Menu" : "Footer"} Link`}
          </h3>

          <FeedbackAlert state={saveState} />

          <form action={saveAction} className="space-y-4">
            {editingItem && <input type="hidden" name="id" value={editingItem.id} />}
            <input type="hidden" name="location" value={activeTab} />

            <div>
              <label className="block text-sm font-semibold text-gray-800">
                Menu Text <span className="text-red-500">*</span>
              </label>
              <p className="text-xs text-gray-500 mb-1">What visitors will see in the menu</p>
              <input
                name="label"
                key={editingItem?.id || "new-label"}
                defaultValue={editingItem?.label || ""}
                placeholder="e.g. Academic Programs"
                required
                className="w-full rounded border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-800">
                Link (Page it opens) <span className="text-red-500">*</span>
              </label>
              <p className="text-xs text-gray-500 mb-1">The page address — start with / for internal pages</p>
              <input
                name="href"
                key={editingItem?.id || "new-href"}
                defaultValue={editingItem?.href || ""}
                placeholder="e.g. /academic/courses"
                required
                className="w-full rounded border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-800">Order Number</label>
              <p className="text-xs text-gray-500 mb-1">Lower number = appears first in the menu</p>
              <input
                name="position"
                type="number"
                key={editingItem?.id || "new-pos"}
                defaultValue={editingItem?.position ?? currentItems.length}
                className="w-24 rounded border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 p-3">
              <input
                type="checkbox"
                name="is_visible"
                id="is_visible"
                key={editingItem?.id || "new-vis"}
                defaultChecked={editingItem?.is_visible ?? true}
                className="h-4 w-4 rounded border-gray-300 text-blue-600 cursor-pointer"
              />
              <label htmlFor="is_visible" className="text-sm text-gray-700 font-medium cursor-pointer">
                Show this link in the menu
              </label>
            </div>

            <div className="flex items-center justify-between pt-2 border-t">
              {editingItem ? (
                <button
                  type="button"
                  onClick={() => setEditingItem(null)}
                  className="text-sm text-gray-500 hover:underline"
                >
                  Cancel
                </button>
              ) : (
                <span />
              )}
              <SubmitButton label={editingItem ? "✅ Update Link" : "➕ Add Link"} />
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
