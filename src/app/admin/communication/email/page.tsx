import { getEmailSettingsAction, getBroadcastLogsAction } from "@/features/communication/email-actions";
import { getBatches } from "@/features/students/queries";
import { getBrandingSettings } from "@/features/website/queries";
import EmailManager from "@/components/admin/communication/EmailManager";

export const metadata = {
  title: "Brevo Email Control Center | Admin Portal",
  description: "Send rich customized email broadcasts to students, teachers, and batches with recipient filtering",
};

export default async function EmailCommunicationPage() {
  const [settings, batches, logs, branding] = await Promise.all([
    getEmailSettingsAction(),
    getBatches(),
    getBroadcastLogsAction(),
    getBrandingSettings(),
  ]);

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      <EmailManager
        initialSettings={settings}
        batches={batches}
        logs={logs}
        collegeName={branding.collegeName || "Dhaka Model College"}
      />
    </div>
  );
}
