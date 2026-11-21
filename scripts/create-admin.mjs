// Creates the FIRST admin account (login + profile row) in the PRIVATE Supabase project.
// Usage:  npm run create-admin -- admin@college.edu "StrongPassword123" "Full Name"
import { createClient } from "@supabase/supabase-js";

const [email, password, ...nameParts] = process.argv.slice(2);
const fullName = nameParts.join(" ") || "Administrator";

if (!email || !password) {
  console.error('Usage: npm run create-admin -- <email> <password> "Full Name"');
  process.exit(1);
}
if (password.length < 8) {
  console.error("Password must be at least 8 characters.");
  process.exit(1);
}

const url = process.env.PRIVATE_SUPABASE_URL;
const key = process.env.PRIVATE_SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error("Missing PRIVATE_SUPABASE_URL or PRIVATE_SUPABASE_SERVICE_ROLE_KEY in .env.local");
  process.exit(1);
}

const supabase = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });

const { data, error } = await supabase.auth.admin.createUser({ email, password, email_confirm: true });
if (error) {
  console.error("Could not create auth user:", error.message);
  process.exit(1);
}

const { error: profileError } = await supabase
  .from("profiles")
  .insert({ id: data.user.id, role: "admin", full_name: fullName, email });

if (profileError) {
  await supabase.auth.admin.deleteUser(data.user.id); // roll back
  console.error("Could not create profile:", profileError.message);
  process.exit(1);
}

console.log(`Admin created: ${email}. You can now log in at /login`);
