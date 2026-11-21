// Contact Us page: UI only. Submitting will save to contact_messages (Communication part).
export default function ContactPage() {
  return (
    <div className="max-w-xl space-y-4">
      <h1 className="text-2xl font-bold">Contact Us</h1>
      <p className="text-sm text-gray-500">[College address, phone, email, map: from site settings]</p>
      <div className="space-y-3">
        <input placeholder="Your name" className="w-full rounded border px-3 py-2" disabled />
        <input placeholder="Email" className="w-full rounded border px-3 py-2" disabled />
        <textarea placeholder="Message" rows={5} className="w-full rounded border px-3 py-2" disabled />
        <button className="rounded bg-blue-600 px-4 py-2 text-white opacity-60" disabled>Send (coming later)</button>
      </div>
    </div>
  );
}
