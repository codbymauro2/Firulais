-- ─── 1. Tabla user_tokens ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS user_tokens (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  token       text NOT NULL,
  platform    text NOT NULL DEFAULT 'web',  -- 'web' | 'android' | 'ios'
  updated_at  timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, token)
);

ALTER TABLE user_tokens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users manage own tokens"
  ON user_tokens FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);


-- ─── 2. Función que llama a la Edge Function ──────────────────────────────────
CREATE OR REPLACE FUNCTION notify_new_message()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_conversation  record;
  v_sender_name   text;
  v_recipient_id  uuid;
BEGIN
  -- Obtener datos de la conversación
  SELECT * INTO v_conversation
  FROM conversations
  WHERE id = NEW.conversation_id;

  IF NOT FOUND THEN RETURN NEW; END IF;

  -- El destinatario es el otro participante
  IF NEW.sender_id = v_conversation.initiator_id THEN
    v_recipient_id := v_conversation.reporter_id;
  ELSE
    v_recipient_id := v_conversation.initiator_id;
  END IF;

  -- Nombre del sender desde profiles
  SELECT full_name INTO v_sender_name
  FROM profiles
  WHERE id = NEW.sender_id;

  -- Llamar a la Edge Function de forma asíncrona (no bloquea el INSERT)
  PERFORM net.http_post(
    url     := current_setting('app.supabase_url') || '/functions/v1/send-notification',
    headers := jsonb_build_object(
      'Content-Type',  'application/json',
      'Authorization', 'Bearer ' || current_setting('app.service_role_key')
    ),
    body    := jsonb_build_object(
      'type',            'new_message',
      'recipient_id',    v_recipient_id,
      'sender_name',     v_sender_name,
      'message_preview', left(NEW.content, 100),
      'conversation_id', NEW.conversation_id
    )
  );

  RETURN NEW;
END;
$$;

-- ─── 3. Trigger en messages ────────────────────────────────────────────────────
DROP TRIGGER IF EXISTS trigger_notify_new_message ON messages;

CREATE TRIGGER trigger_notify_new_message
  AFTER INSERT ON messages
  FOR EACH ROW
  EXECUTE FUNCTION notify_new_message();


-- ─── 4. Configurar las variables que usa la función PG ────────────────────────
-- Ejecutar esto una sola vez con tus valores reales:
-- ALTER DATABASE postgres SET app.supabase_url = 'https://XXXXX.supabase.co';
-- ALTER DATABASE postgres SET app.service_role_key = 'eyJh...tu_service_role_key';
