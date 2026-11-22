// Supabase Edge Function: rfid-attendance
// Deployed to: https://<project-ref>.supabase.co/functions/v1/rfid-attendance

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-device-id, x-device-token",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  // Handshake GET
  if (req.method === "GET") {
    return new Response(
      JSON.stringify({
        success: true,
        status: "CONNECTED",
        message: "Supabase Edge Function RFID Attendance online",
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const body = await req.json().catch(() => ({}));
    const deviceId = (body.device_id || req.headers.get("x-device-id") || "GATE-01").trim();
    const rawUid = (body.card_uid || body.uid || "").trim();

    if (!rawUid) {
      return new Response(
        JSON.stringify({ success: false, status: "INVALID_REQUEST", message: "Card UID is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const normalizedUid = rawUid.replace(/[^a-fA-F0-9]/g, "").toUpperCase();

    // Dhaka Time calculation
    const now = new Date();
    const dhakaFormatter = new Intl.DateTimeFormat("en-CA", {
      timeZone: "Asia/Dhaka",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });
    const parts = dhakaFormatter.formatToParts(now);
    const pMap: Record<string, string> = {};
    for (const p of parts) pMap[p.type] = p.value;

    const dateStr = `${pMap.year}-${pMap.month}-${pMap.day}`;
    const timeStr = `${pMap.hour}:${pMap.minute}:${pMap.second}`;
    const hour = parseInt(pMap.hour, 10);
    const minute = parseInt(pMap.minute, 10);
    const h12 = hour % 12 || 12;
    const ampm = hour >= 12 ? "PM" : "AM";
    const formattedTime12 = `${String(h12).padStart(2, "0")}:${pMap.minute} ${ampm}`;

    // Lookup student
    const { data: student } = await supabase
      .from("students")
      .select("id, student_code, full_name, status")
      .ilike("rfid_card_id", normalizedUid)
      .maybeSingle();

    if (!student) {
      return new Response(
        JSON.stringify({
          success: false,
          status: "UNREGISTERED_CARD",
          uid: normalizedUid,
          message: "This card is not registered",
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (student.status !== "active") {
      return new Response(
        JSON.stringify({
          success: false,
          status: "INACTIVE_CARD",
          uid: normalizedUid,
          student_name: student.full_name,
          student_code: student.student_code,
          message: "This card is disabled",
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Duplicate check
    const { data: existing } = await supabase
      .from("student_attendance")
      .select("id, in_time, status")
      .eq("student_id", student.id)
      .eq("date", dateStr)
      .maybeSingle();

    if (existing) {
      return new Response(
        JSON.stringify({
          success: true,
          status: "ALREADY_PRESENT",
          uid: normalizedUid,
          student_name: student.full_name,
          student_code: student.student_code,
          message: "Attendance already recorded today",
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Cutoff 09:15 AM
    const isLate = hour > 9 || (hour === 9 && minute > 15);
    const status = isLate ? "late" : "present";
    const displayStatus = isLate ? "LATE" : "PRESENT";
    const displayMessage = isLate ? "Late attendance recorded" : "Attendance recorded successfully";

    await supabase.from("student_attendance").insert({
      student_id: student.id,
      date: dateStr,
      in_time: timeStr,
      status: status,
      rfid_card_id: normalizedUid,
      device_id: deviceId,
    });

    return new Response(
      JSON.stringify({
        success: true,
        status: displayStatus,
        uid: normalizedUid,
        student_name: student.full_name,
        student_code: student.student_code,
        time: formattedTime12,
        message: displayMessage,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({
        success: false,
        status: "NETWORK_ERROR",
        message: "Attendance could not be confirmed",
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
