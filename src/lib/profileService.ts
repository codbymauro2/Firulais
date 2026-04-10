import { supabase } from "./supabase";

export interface Profile {
  id: string;
  full_name: string | null;
  phone: string | null;
  city: string | null;
  avatar_url: string | null;
  avatar_data: string | null; // base64 data URL
  updated_at: string;
}

export async function fetchProfile(userId: string): Promise<Profile | null> {
  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .maybeSingle();
  return data as Profile | null;
}

export async function upsertProfile(
  userId: string,
  updates: Partial<Omit<Profile, "id" | "updated_at">>,
): Promise<Profile> {
  const { data, error } = await supabase
    .from("profiles")
    .upsert({ id: userId, ...updates, updated_at: new Date().toISOString() })
    .select()
    .single();
  if (error) throw error;
  return data as Profile;
}

export async function fetchProfilesByIds(ids: string[]): Promise<Record<string, Profile>> {
  if (ids.length === 0) return {};
  const { data } = await supabase
    .from("profiles")
    .select("id, full_name, avatar_data, avatar_url")
    .in("id", ids);
  const map: Record<string, Profile> = {};
  for (const p of data ?? []) map[p.id] = p as Profile;
  return map;
}

/** Convierte un File a base64 data URL para guardarlo directo en la DB */
export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
