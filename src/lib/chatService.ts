import { supabase } from "./supabase";

export interface Conversation {
  id: string;
  pet_id: string | null;
  pet_name: string | null;
  initiator_id: string;
  initiator_name: string;
  reporter_id: string;
  reporter_name: string;
  last_message: string | null;
  last_message_at: string;
  created_at: string;
  deleted_at_initiator: string | null; // corte de mensajes, nunca se borra
  deleted_at_reporter: string | null;  // corte de mensajes, nunca se borra
  hidden_initiator: boolean;           // si está oculta en el inbox
  hidden_reporter: boolean;            // si está oculta en el inbox
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  created_at: string;
  read_at: string | null;
}

export async function getOrCreateConversation(
  petId: string,
  petName: string | null,
  initiatorId: string,
  initiatorName: string,
  reporterId: string,
  reporterName: string,
): Promise<Conversation> {
  const { data: existing } = await supabase
    .from("conversations")
    .select("*")
    .eq("pet_id", petId)
    .or(
      `and(initiator_id.eq.${initiatorId},reporter_id.eq.${reporterId}),` +
      `and(initiator_id.eq.${reporterId},reporter_id.eq.${initiatorId})`
    )
    .maybeSingle();

  if (existing) return existing as Conversation;

  const { data, error } = await supabase
    .from("conversations")
    .insert({ pet_id: petId, pet_name: petName, initiator_id: initiatorId, initiator_name: initiatorName, reporter_id: reporterId, reporter_name: reporterName })
    .select()
    .single();

  if (error) throw error;
  return data as Conversation;
}

export async function fetchConversations(userId: string): Promise<Conversation[]> {
  const { data, error } = await supabase
    .from("conversations")
    .select("*")
    .or(`initiator_id.eq.${userId},reporter_id.eq.${userId}`)
    .order("last_message_at", { ascending: false });

  if (error) throw error;

  // Filtrar por hidden (inbox), no por deleted_at (eso es solo el corte de mensajes)
  return ((data ?? []) as Conversation[]).filter((conv) =>
    conv.initiator_id === userId ? !conv.hidden_initiator : !conv.hidden_reporter
  );
}

/** Trae mensajes a partir del momento en que el usuario "eliminó" la conversación (como Instagram) */
export async function fetchMessages(conversationId: string, userId: string): Promise<Message[]> {
  // Obtener timestamps de eliminación
  const { data: conv } = await supabase
    .from("conversations")
    .select("initiator_id, deleted_at_initiator, deleted_at_reporter")
    .eq("id", conversationId)
    .single();

  let query = supabase
    .from("messages")
    .select("*")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true });

  if (conv) {
    const deletedAt = conv.initiator_id === userId ? conv.deleted_at_initiator : conv.deleted_at_reporter;
    // Si el usuario había eliminado la conversación y luego volvió a aparecer,
    // solo mostrar mensajes desde esa eliminación en adelante
    if (deletedAt) query = query.gte("created_at", deletedAt);
  }

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as Message[];
}

export async function sendMessage(
  conversationId: string,
  senderId: string,
  content: string,
): Promise<Message> {
  const { data: msg, error } = await supabase
    .from("messages")
    .insert({ conversation_id: conversationId, sender_id: senderId, content })
    .select()
    .single();

  if (error) throw error;

  // Obtener la conversación para saber roles
  const { data: conv } = await supabase
    .from("conversations")
    .select("initiator_id")
    .eq("id", conversationId)
    .single();

  // Resetear hidden del destinatario (reaparece en su inbox)
  // deleted_at NO se toca — es el corte de mensajes y permanece para siempre
  const recipientHidden = conv?.initiator_id === senderId ? "hidden_reporter" : "hidden_initiator";
  const senderHidden    = conv?.initiator_id === senderId ? "hidden_initiator" : "hidden_reporter";

  await supabase
    .from("conversations")
    .update({
      last_message: content,
      last_message_at: new Date().toISOString(),
      [recipientHidden]: false, // Reaparece en el inbox del destinatario
      [senderHidden]: false,    // Reaparece en el inbox del remitente si había eliminado
    })
    .eq("id", conversationId);

  return msg as Message;
}

/** Soft delete: oculta la conversación solo para este usuario */
export async function deleteConversation(conversationId: string, userId: string): Promise<void> {
  const { data: conv } = await supabase
    .from("conversations")
    .select("initiator_id")
    .eq("id", conversationId)
    .single();

  const deletedAtField = conv?.initiator_id === userId ? "deleted_at_initiator" : "deleted_at_reporter";
  const hiddenField    = conv?.initiator_id === userId ? "hidden_initiator"    : "hidden_reporter";

  const { error } = await supabase
    .from("conversations")
    .update({
      [deletedAtField]: new Date().toISOString(), // corte de mensajes (permanente)
      [hiddenField]: true,                        // ocultar en inbox
    })
    .eq("id", conversationId);

  if (error) throw error;
}

export async function deleteMessage(messageId: string): Promise<void> {
  const { error } = await supabase.from("messages").delete().eq("id", messageId);
  if (error) throw error;
}

export async function markMessagesAsRead(conversationId: string, userId: string): Promise<void> {
  await supabase
    .from("messages")
    .update({ read_at: new Date().toISOString() })
    .eq("conversation_id", conversationId)
    .neq("sender_id", userId)
    .is("read_at", null);
}

export async function fetchUnreadCounts(
  userId: string,
  conversationIds: string[],
): Promise<Record<string, number>> {
  if (conversationIds.length === 0) return {};

  const { data } = await supabase
    .from("messages")
    .select("conversation_id")
    .in("conversation_id", conversationIds)
    .neq("sender_id", userId)
    .is("read_at", null);

  const counts: Record<string, number> = {};
  for (const row of data ?? []) {
    counts[row.conversation_id] = (counts[row.conversation_id] ?? 0) + 1;
  }
  return counts;
}

export function subscribeToConversation(
  conversationId: string,
  onNewMessage: (msg: Message) => void,
  onMessageUpdated: (msg: Message) => void,
  onMessageDeleted: (id: string) => void,
) {
  return supabase
    .channel(`conversation:${conversationId}`)
    .on(
      "postgres_changes",
      { event: "INSERT", schema: "public", table: "messages", filter: `conversation_id=eq.${conversationId}` },
      (payload) => onNewMessage(payload.new as Message),
    )
    .on(
      "postgres_changes",
      { event: "UPDATE", schema: "public", table: "messages", filter: `conversation_id=eq.${conversationId}` },
      (payload) => onMessageUpdated(payload.new as Message),
    )
    .on(
      "postgres_changes",
      { event: "DELETE", schema: "public", table: "messages", filter: `conversation_id=eq.${conversationId}` },
      (payload) => onMessageDeleted(payload.old.id),
    )
    .subscribe();
}
