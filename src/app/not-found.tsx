import Link from "next/link";

export default function NotFound() {
  return (
    <main className="p-12 text-center">
      <h1 className="text-2xl font-bold">Page not found</h1>
      <Link href="/" className="text-blue-700 underline">Back to home</Link>
    </main>
  );
}
