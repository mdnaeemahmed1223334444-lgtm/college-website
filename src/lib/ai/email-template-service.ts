import "server-only";
import { mainAdmin } from "@/lib/supabase/main-server";
import {
  type EmailTemplateItem,
  defaultBuiltInTemplates,
} from "@/features/communication/ai-types";

const TEMPLATES_KEY = "email_custom_templates";

/**
 * Retrieves all email templates (built-in defaults + any custom/edited templates in database)
 */
export async function getAllEmailTemplates(): Promise<EmailTemplateItem[]> {
  const supabase = mainAdmin();
  let customList: EmailTemplateItem[] = [];

  if (supabase) {
    try {
      const { data } = await supabase
        .from("site_settings")
        .select("value")
        .eq("key", TEMPLATES_KEY)
        .maybeSingle();

      if (data?.value && Array.isArray(data.value)) {
        customList = data.value;
      }
    } catch {
      // ignore
    }
  }

  // Merge built-in templates with custom templates
  // Custom templates can override built-ins by ID or add new ones
  const customMap = new Map<string, EmailTemplateItem>();
  for (const item of customList) {
    if (item.id) {
      customMap.set(item.id, item);
    }
  }

  const merged: EmailTemplateItem[] = [];

  // Add all built-ins (or their customized versions)
  for (const builtIn of defaultBuiltInTemplates) {
    if (customMap.has(builtIn.id)) {
      merged.push({ ...builtIn, ...customMap.get(builtIn.id)!, isBuiltIn: true });
      customMap.delete(builtIn.id);
    } else {
      merged.push({ ...builtIn, isBuiltIn: true });
    }
  }

  // Add remaining user custom templates
  for (const custom of customMap.values()) {
    merged.push({ ...custom, isBuiltIn: false });
  }

  return merged;
}

/**
 * Saves a new template or updates an existing template
 */
export async function saveEmailTemplateItem(
  template: EmailTemplateItem
): Promise<{ success: boolean; template?: EmailTemplateItem; error?: string }> {
  const supabase = mainAdmin();
  if (!supabase) {
    return { success: false, error: "Database connection failed" };
  }

  try {
    const existingList = await getAllEmailTemplates();
    const now = new Date().toISOString();

    const templateToSave: EmailTemplateItem = {
      ...template,
      id: template.id || `custom-tpl-${Date.now()}`,
      updatedAt: now,
    };

    const index = existingList.findIndex((t) => t.id === templateToSave.id);
    let updatedList: EmailTemplateItem[];
    if (index >= 0) {
      updatedList = existingList.map((t) =>
        t.id === templateToSave.id ? templateToSave : t
      );
    } else {
      updatedList = [templateToSave, ...existingList];
    }

    const { error } = await supabase.from("site_settings").upsert({
      key: TEMPLATES_KEY,
      value: updatedList,
      updated_at: now,
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, template: templateToSave };
  } catch (err: any) {
    return {
      success: false,
      error: err.message || "Failed to save template",
    };
  }
}

/**
 * Deletes a template by ID
 */
export async function deleteEmailTemplateItem(
  id: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = mainAdmin();
  if (!supabase) {
    return { success: false, error: "Database connection failed" };
  }

  try {
    const existingList = await getAllEmailTemplates();
    const updatedList = existingList.filter((t) => t.id !== id);

    const { error } = await supabase.from("site_settings").upsert({
      key: TEMPLATES_KEY,
      value: updatedList,
      updated_at: new Date().toISOString(),
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err: any) {
    return {
      success: false,
      error: err.message || "Failed to delete template",
    };
  }
}

/**
 * Resets all templates back to default system templates
 */
export async function resetEmailTemplatesToDefault(): Promise<{
  success: boolean;
  templates?: EmailTemplateItem[];
  error?: string;
}> {
  const supabase = mainAdmin();
  if (!supabase) {
    return { success: false, error: "Database connection failed" };
  }

  try {
    const { error } = await supabase.from("site_settings").upsert({
      key: TEMPLATES_KEY,
      value: defaultBuiltInTemplates,
      updated_at: new Date().toISOString(),
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, templates: defaultBuiltInTemplates };
  } catch (err: any) {
    return {
      success: false,
      error: err.message || "Failed to reset templates",
    };
  }
}
