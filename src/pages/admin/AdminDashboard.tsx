import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../../lib/supabase";

interface Counts {
  pets: number;
  adoptions: number;
  services: number;
  store_items: number;
  happy_endings: number;
  help_centers: number;
  profiles: number;
}

export default function AdminDashboard() {
  const [counts, setCounts] = useState<Counts | null>(null);

  useEffect(() => {
    const fetchCounts = async () => {
      const [pets, adoptions, services, store, happy, helpCenters, profiles] = await Promise.all([
        supabase.from("pets").select("id", { count: "exact", head: true }),
        supabase.from("adoptions").select("id", { count: "exact", head: true }),
        supabase.from("services").select("id", { count: "exact", head: true }),
        supabase.from("store_items").select("id", { count: "exact", head: true }),
        supabase.from("happy_endings").select("id", { count: "exact", head: true }),
        supabase.from("help_centers").select("id", { count: "exact", head: true }),
        supabase.from("profiles").select("id", { count: "exact", head: true }),
      ]);
      setCounts({
        pets: pets.count ?? 0,
        adoptions: adoptions.count ?? 0,
        services: services.count ?? 0,
        store_items: store.count ?? 0,
        happy_endings: happy.count ?? 0,
        help_centers: helpCenters.count ?? 0,
        profiles: profiles.count ?? 0,
      });
    };
    fetchCounts();
  }, []);

  const cards = [
    { label: "Reportes de mascotas", value: counts?.pets, icon: "pets", color: "text-[#2b9dee]", bg: "bg-[#2b9dee]/10", link: "/all-reports" },
    { label: "Usuarios registrados", value: counts?.profiles, icon: "group", color: "text-violet-600", bg: "bg-violet-100", link: null },
    { label: "Adopciones activas", value: counts?.adoptions, icon: "favorite", color: "text-pink-600", bg: "bg-pink-100", link: "/admin/adoptions" },
    { label: "Servicios", value: counts?.services, icon: "directions_walk", color: "text-emerald-600", bg: "bg-emerald-100", link: "/admin/services" },
    { label: "Productos en tienda", value: counts?.store_items, icon: "storefront", color: "text-amber-600", bg: "bg-amber-100", link: "/admin/store" },
    { label: "Finales felices", value: counts?.happy_endings, icon: "celebration", color: "text-rose-600", bg: "bg-rose-100", link: "/admin/happy-endings" },
    { label: "Centros de ayuda", value: counts?.help_centers, icon: "local_hospital", color: "text-[#2b9dee]", bg: "bg-[#2b9dee]/10", link: "/admin/help-centers" },
  ];

  const sections = [
    { label: "Adopciones", icon: "favorite", path: "/admin/adoptions", description: "Gestioná las mascotas disponibles para adoptar" },
    { label: "Servicios", icon: "directions_walk", path: "/admin/services", description: "Paseadores, guarderías y adiestradores" },
    { label: "Tienda", icon: "storefront", path: "/admin/store", description: "Productos disponibles en la tienda" },
    { label: "Finales Felices", icon: "celebration", path: "/admin/happy-endings", description: "Historias de mascotas reunidas con sus dueños" },
    { label: "Centros de Ayuda", icon: "local_hospital", path: "/admin/help-centers", description: "Refugios, veterinarias y centros de rescate" },
  ];

  return (
    <div className="flex flex-col gap-8 max-w-5xl">
      {/* Stats */}
      <div>
        <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4">Resumen</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {cards.map((c) => {
            const inner = (
              <div className={`bg-white rounded-2xl p-5 border border-slate-200 shadow-sm ${c.link ? "hover:shadow-md transition-shadow cursor-pointer" : ""}`}>
                <div className={`w-10 h-10 rounded-xl ${c.bg} flex items-center justify-center mb-3`}>
                  <span className={`material-symbols-outlined text-[22px] ${c.color}`}>{c.icon}</span>
                </div>
                <p className="text-2xl font-extrabold">
                  {counts === null ? "—" : c.value}
                </p>
                <p className="text-sm text-slate-500 font-medium mt-0.5">{c.label}</p>
              </div>
            );
            return c.link
              ? <Link key={c.label} to={c.link}>{inner}</Link>
              : <div key={c.label}>{inner}</div>;
          })}
        </div>
      </div>

      {/* Quick access */}
      <div>
        <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4">Gestionar contenido</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {sections.map((s) => (
            <Link
              key={s.path}
              to={s.path}
              className="flex items-center gap-4 bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[26px] text-slate-600">{s.icon}</span>
              </div>
              <div>
                <p className="font-bold text-base">{s.label}</p>
                <p className="text-sm text-slate-500">{s.description}</p>
              </div>
              <span className="material-symbols-outlined text-slate-300 ml-auto">chevron_right</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
