import { getEmailSettingsAction, getBroadcastLogsAction } from "@/features/communication/email-actions";
import { getEmailAiConfigAction, getEmailTemplatesAction } from "@/features/communication/ai-actions";
import { getBatches, getStudents } from "@/features/students/queries";
import { getBrandingSettings } from "@/features/website/queries";
import EmailManager from "@/components/admin/communication/EmailManager";
import Link from "next/link";

export const metadata = {
  title: "Email Broadcast & Sender | Admin Portal",
  description: "Send rich customized email broadcasts to students, teachers, and batches with recipient filtering",
};

export default async function ContentEmailBroadcastPage() {
  const [settings, aiConfig, templates, batches, students, logs, branding] = await Promise.all([
    getEmailSettingsAction(),
    getEmailAiConfigAction(),
    getEmailTemplatesAction(),
    getBatches(),
    getStudents(),
    getBroadcastLogsAction(),
    getBrandingSettings(),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <Link href="/admin/content" className="hover:underline">Content Management</Link>
        <span>&rsaquo;</span>
        <span className="font-medium text-gray-900">Email Broadcast & Sender</span>
      </div>

      <EmailManager
        initialSettings={settings}
        initialAiConfig={aiConfig}
        initialTemplates={templates}
        batches={batches}
        students={students}
        logs={logs}
        collegeName={branding.collegeName || "Dhaka Model College"}
        logoUrl={branding.logoUrl || ""}
      />
    </div>
  );
}
