import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";

export default function AuthCallbackScreen() {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let unsubscribed = false;

    // Suscribirse PRIMERO, antes de cualquier getSession(),
    // para no perder el evento SIGNED_IN que el cliente dispara
    // al procesar el #access_token del hash.
    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      if (unsubscribed) return;
      if ((event === "SIGNED_IN" || event === "INITIAL_SESSION") && session) {
        unsubscribed = true;
        listener.subscription.unsubscribe();
        navigate("/home", { replace: true });
      }
    });

    // También verificar si la sesión ya estaba lista antes de montar el componente
    supabase.auth.getSession().then(({ data }) => {
      if (unsubscribed) return;
      if (data.session) {
        unsubscribed = true;
        listener.subscription.unsubscribe();
        navigate("/home", { replace: true });
      }
    });

    const timeout = setTimeout(() => {
      if (!unsubscribed) {
        unsubscribed = true;
        listener.subscription.unsubscribe();
        setError("No se pudo completar el inicio de sesión. Intentá de nuevo.");
      }
    }, 8000);

    return () => {
      unsubscribed = true;
      listener.subscription.unsubscribe();
      clearTimeout(timeout);
    };
  }, [navigate]);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen max-w-[430px] mx-auto px-8 bg-white dark:bg-slate-800 font-display">
        <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mb-6">
          <span className="material-symbols-outlined text-red-500 text-[32px]">error</span>
        </div>
        <p className="text-slate-700 dark:text-slate-300 text-sm text-center mb-6">{error}</p>
        <button
          onClick={() => navigate("/login", { replace: true })}
          className="text-[#2b9dee] font-bold text-sm"
        >
          Volver al inicio de sesión
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen max-w-[430px] mx-auto bg-white dark:bg-slate-800 font-display">
      <div className="w-20 h-20 rounded-full bg-[#2b9dee]/10 dark:bg-[#2b9dee]/20 flex items-center justify-center mb-6">
        <svg className="animate-spin h-8 w-8 text-[#2b9dee]" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
        </svg>
      </div>
      <p className="text-slate-600 dark:text-slate-400 text-sm font-medium">Iniciando sesión...</p>
    </div>
  );
}
