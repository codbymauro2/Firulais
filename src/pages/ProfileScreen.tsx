import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import BottomNav from "../components/BottomNav";
import { useMenu } from "../context/MenuContext";
import { useAuth } from "../context/AuthContext";
import { fetchProfile, upsertProfile, type Profile } from "../lib/profileService";
import { supabase } from "../lib/supabase";

export default function ProfileScreen() {
  const navigate = useNavigate();
  const { openMenu } = useMenu();
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [reportCount, setReportCount] = useState<number | null>(null);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("pets")
      .select("*", { count: "exact", head: true })
      .eq("reporter_id", user.id)
      .then(({ count }) => setReportCount(count ?? 0));
    fetchProfile(user.id).then((p) => {
      if (p) {
        setProfile(p);
      } else {
        // Crear perfil si no existe (usuarios anteriores al trigger)
        const fallbackName =
          (user as { user_metadata?: { full_name?: string; name?: string } })
            .user_metadata?.full_name ??
          (user as { user_metadata?: { full_name?: string; name?: string } })
            .user_metadata?.name ??
          user.email?.split("@")[0] ??
          "";
        upsertProfile(user.id, { full_name: fallbackName }).then(setProfile);
      }
    });
  }, [user]);

  const displayName = profile?.full_name ?? user?.email?.split("@")[0] ?? "Usuario";
  const email = user?.email ?? "";
  const initials = displayName
    .split(" ").map((w: string) => w[0]).slice(0, 2).join("").toUpperCase();

  const menuItems = [
    { icon: "history",       label: "Mis Reportes",    action: () => navigate("/my-reports") },
    { icon: "notifications", label: "Notificaciones",   action: () => navigate("/notifications") },
  ];

  return (
    <div className="relative flex h-auto min-h-screen w-full max-w-[430px] lg:max-w-3xl mx-auto flex-col bg-[#f6f7f8] dark:bg-slate-900 font-display text-slate-900 dark:text-white pb-24 lg:pb-8">
      <div className="bg-white dark:bg-slate-800 px-4 pt-6 pb-6">
        <div className="flex items-center gap-4">
          {/* Avatar */}
          <div className="w-20 h-20 rounded-full bg-[#2b9dee]/20 flex items-center justify-center overflow-hidden border-2 border-[#2b9dee]/30 shrink-0">
            {(profile?.avatar_data ?? profile?.avatar_url) ? (
              <img src={profile.avatar_data ?? profile.avatar_url!} alt="avatar" className="w-full h-full object-cover" />
            ) : (
              <span className="text-2xl font-bold text-[#2b9dee]">{initials}</span>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <h2 className="text-xl font-bold truncate">{displayName}</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 truncate">{email}</p>
            {profile?.city && (
              <div className="flex items-center gap-1 mt-1">
                <span className="material-symbols-outlined text-[13px] text-slate-400">location_on</span>
                <span className="text-xs text-slate-500 dark:text-slate-400">{profile.city}</span>
              </div>
            )}
          </div>

          {/* Botones */}
          <div className="flex gap-2 shrink-0">
            <button
              onClick={() => navigate("/edit-profile")}
              className="flex size-10 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-700"
            >
              <span className="material-symbols-outlined text-[20px] text-slate-600 dark:text-slate-300">edit</span>
            </button>
            <button
              onClick={openMenu}
              className="flex size-10 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-700"
            >
              <span className="material-symbols-outlined text-[20px] text-slate-600 dark:text-slate-300">menu</span>
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mt-5">
          <div className="bg-[#2b9dee]/10 dark:bg-[#2b9dee]/20 rounded-xl p-3 text-center">
            <p className="text-xl font-bold text-[#2b9dee]">{reportCount ?? "—"}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Reportes</p>
          </div>
          <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-xl p-3 text-center">
            <p className="text-xl font-bold text-emerald-600">—</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Rescatados</p>
          </div>
          <div className="bg-amber-50 dark:bg-amber-900/20 rounded-xl p-3 text-center">
            <p className="text-xl font-bold text-amber-600">—</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Ayudas</p>
          </div>
        </div>
      </div>

      <div className="mt-3 bg-white dark:bg-slate-800 rounded-2xl mx-3 overflow-hidden">
        {menuItems.map((item, idx) => (
          <button
            key={idx}
            onClick={item.action}
            className="flex items-center gap-4 px-4 py-4 w-full text-left hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors border-b border-slate-50 dark:border-slate-700 last:border-0"
          >
            <div className="w-10 h-10 bg-[#2b9dee]/10 dark:bg-[#2b9dee]/20 rounded-xl flex items-center justify-center">
              <span className="material-symbols-outlined text-[20px] text-[#2b9dee]">{item.icon}</span>
            </div>
            <span className="flex-1 text-sm font-semibold">{item.label}</span>
            <span className="material-symbols-outlined text-[18px] text-slate-400 dark:text-slate-500">chevron_right</span>
          </button>
        ))}
      </div>

      <BottomNav />
    </div>
  );
}
