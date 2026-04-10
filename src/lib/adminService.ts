import { supabase } from "./supabase";

// ─── Adoptions ────────────────────────────────────────────────────────────────

export interface Adoption {
  id: string;
  name: string;
  age: string | null;
  gender: string | null;
  description: string | null;
  shelter: string | null;
  location: string | null;
  image_url: string | null;
  contact_url: string | null;
  is_active: boolean;
  created_at: string;
}

export type AdoptionInput = Omit<Adoption, "id" | "created_at">;

export async function fetchAdoptions(): Promise<Adoption[]> {
  const { data, error } = await supabase
    .from("adoptions")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data as Adoption[];
}

export async function createAdoption(input: AdoptionInput): Promise<Adoption> {
  const { data, error } = await supabase.from("adoptions").insert(input).select().single();
  if (error) throw error;
  return data as Adoption;
}

export async function updateAdoption(id: string, input: Partial<AdoptionInput>): Promise<void> {
  const { error } = await supabase.from("adoptions").update(input).eq("id", id);
  if (error) throw error;
}

export async function deleteAdoption(id: string): Promise<void> {
  const { error } = await supabase.from("adoptions").delete().eq("id", id);
  if (error) throw error;
}

// ─── Services ─────────────────────────────────────────────────────────────────

export interface Service {
  id: string;
  name: string;
  category: "Paseadores" | "Guarderías" | "Adiestradores";
  zone: string | null;
  rating: number | null;
  tags: string[] | null;
  price_label: string | null;
  image_url: string | null;
  contact_url: string | null;
  verified: boolean;
  available: boolean;
  is_active: boolean;
  created_at: string;
}

export type ServiceInput = Omit<Service, "id" | "created_at">;

export async function fetchServices(): Promise<Service[]> {
  const { data, error } = await supabase
    .from("services")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data as Service[];
}

export async function createService(input: ServiceInput): Promise<Service> {
  const { data, error } = await supabase.from("services").insert(input).select().single();
  if (error) throw error;
  return data as Service;
}

export async function updateService(id: string, input: Partial<ServiceInput>): Promise<void> {
  const { error } = await supabase.from("services").update(input).eq("id", id);
  if (error) throw error;
}

export async function deleteService(id: string): Promise<void> {
  const { error } = await supabase.from("services").delete().eq("id", id);
  if (error) throw error;
}

// ─── Store Items ───────────────────────────────────────────────────────────────

export interface StoreItem {
  id: string;
  name: string;
  category: string | null;
  price_label: string | null;
  description: string | null;
  image_url: string | null;
  link_url: string | null;
  is_active: boolean;
  created_at: string;
}

export type StoreItemInput = Omit<StoreItem, "id" | "created_at">;

export async function fetchStoreItems(): Promise<StoreItem[]> {
  const { data, error } = await supabase
    .from("store_items")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data as StoreItem[];
}

export async function createStoreItem(input: StoreItemInput): Promise<StoreItem> {
  const { data, error } = await supabase.from("store_items").insert(input).select().single();
  if (error) throw error;
  return data as StoreItem;
}

export async function updateStoreItem(id: string, input: Partial<StoreItemInput>): Promise<void> {
  const { error } = await supabase.from("store_items").update(input).eq("id", id);
  if (error) throw error;
}

export async function deleteStoreItem(id: string): Promise<void> {
  const { error } = await supabase.from("store_items").delete().eq("id", id);
  if (error) throw error;
}

// ─── Happy Endings ─────────────────────────────────────────────────────────────

export interface HappyEnding {
  id: string;
  pet_name: string;
  breed: string | null;
  days_lost: number | null;
  story: string | null;
  image_url: string | null;
  is_active: boolean;
  created_at: string;
}

export type HappyEndingInput = Omit<HappyEnding, "id" | "created_at">;

export async function fetchHappyEndings(): Promise<HappyEnding[]> {
  const { data, error } = await supabase
    .from("happy_endings")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data as HappyEnding[];
}

export async function createHappyEnding(input: HappyEndingInput): Promise<HappyEnding> {
  const { data, error } = await supabase.from("happy_endings").insert(input).select().single();
  if (error) throw error;
  return data as HappyEnding;
}

export async function updateHappyEnding(id: string, input: Partial<HappyEndingInput>): Promise<void> {
  const { error } = await supabase.from("happy_endings").update(input).eq("id", id);
  if (error) throw error;
}

export async function deleteHappyEnding(id: string): Promise<void> {
  const { error } = await supabase.from("happy_endings").delete().eq("id", id);
  if (error) throw error;
}

// ─── Admin image upload ────────────────────────────────────────────────────────

export async function uploadAdminImage(file: File, bucket: string, folder: string): Promise<string> {
  const ext = file.name.split(".").pop() ?? "jpg";
  const path = `${folder}/${Date.now()}.${ext}`;
  const { error } = await supabase.storage.from(bucket).upload(path, file, { contentType: file.type });
  if (error) throw error;
  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}

// ─── Help Centers ─────────────────────────────────────────────────────────────

export interface HelpCenter {
  id: string;
  name: string;
  address: string | null;
  phone: string | null;
  hours: string | null;
  maps_url: string | null;
  lat: number | null;
  lng: number | null;
  is_active: boolean;
  created_at: string;
}

export type HelpCenterInput = Omit<HelpCenter, "id" | "created_at">;

export async function fetchHelpCenters(): Promise<HelpCenter[]> {
  const { data, error } = await supabase
    .from("help_centers")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data as HelpCenter[];
}

export async function createHelpCenter(input: HelpCenterInput): Promise<HelpCenter> {
  const { data, error } = await supabase.from("help_centers").insert(input).select().single();
  if (error) throw error;
  return data as HelpCenter;
}

export async function updateHelpCenter(id: string, input: Partial<HelpCenterInput>): Promise<void> {
  const { error } = await supabase.from("help_centers").update(input).eq("id", id);
  if (error) throw error;
}

export async function deleteHelpCenter(id: string): Promise<void> {
  const { error } = await supabase.from("help_centers").delete().eq("id", id);
  if (error) throw error;
}

// ─── Check admin role ─────────────────────────────────────────────────────────

export async function checkIsAdmin(userId: string): Promise<boolean> {
  const { data } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", userId)
    .single();
  return data?.role === "admin";
}
