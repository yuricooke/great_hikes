"use server";

import { z } from "zod";

import { SUPABASE_CONFIGURED } from "@/lib/flags";
import { supabaseAdmin } from "@/lib/supabase/server";

export type ContactState = { status: "idle" | "sent" | "error"; message?: string; fields?: Record<string, string> };

const Message = z.object({
  name: z.string().trim().min(1, "Please tell us your name.").max(120),
  email: z.email("Enter a valid email address."),
  topic: z.enum(["hiker", "photographer", "partner", "privacy", "other"]),
  message: z.string().trim().min(10, "Your message is a little short.").max(5000, "Please keep it under 5,000 characters."),
});

export async function sendMessage(_prev: ContactState, form: FormData): Promise<ContactState> {
  const fields = Object.fromEntries(["name", "email", "topic", "message"].map((k) => [k, String(form.get(k) ?? "")]));
  // Honeypot: people never see this field; bots fill it.
  if (form.get("website")) return { status: "sent" };

  const parsed = Message.safeParse(fields);
  if (!parsed.success) return { status: "error", message: parsed.error.issues[0].message, fields };
  if (!SUPABASE_CONFIGURED) {
    return { status: "error", message: "The form isn't available here — please DM @great_hikes on Instagram.", fields };
  }

  const { error } = await supabaseAdmin().from("contact_messages").insert(parsed.data);
  if (error) return { status: "error", message: "Something went wrong — please try again.", fields };
  return { status: "sent" };
}
