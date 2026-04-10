import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { fetchPetsPage, type Pet, type FetchPetsOptions } from "../lib/petsService";
import { fetchProfilesByIds, type Profile } from "../lib/profileService";
import UserAvatar from "../components/UserAvatar";

type Status  = "lost" | "found" | undefined;
type Species = "dog" | "cat" | undefined;

const timeAgo = (iso: string) => {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (diff < 1) return "ahora";
  if (diff < 60) return `${diff}m`;
  if (diff < 1440) return `${Math.floor(diff / 60)}h`;
  return `${Math.floor(diff / 1440)}d`;
};

export default function AllReportsScreen() {
  const navigate = useNavigate();

  const [status,  setStatus]  = useState<Status>(undefined);
  const [species, setSpecies] = useState<Species>(undefined);
  const [days,    setDays]    = useState<1 | 3 | 7 | 30 | undefined>(undefined);
  const [search,  setSearch]  = useState("");

  const [pets,    setPets]    = useState<Pet[]>([]);
  const [page,    setPage]    = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [reporterProfiles, setReporterProfiles] = useState<Record<string, Profile>>({});

  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // Debounce search input
  useEffect(() => {
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => setDebouncedSearch(search), 400);
    return () => { if (searchTimer.current) clearTimeout(searchTimer.current); };
  }, [search]);

  // Reset and reload when filters change
  useEffect(() => {
    setPets([]);
    setPage(0);
    setHasMore(true);
    load(0, true);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, species, days, debouncedSearch]);

  const load = async (pageNum: number, reset = false) => {
    if (reset) setLoading(true);
    else setLoadingMore(true);

    try {
      const opts: FetchPetsOptions = { page: pageNum, status, species, days, search: debouncedSearch };
      const { pets: newPets, hasMore: more } = await fetchPetsPage(opts);
      setPets(prev => reset ? newPets : [...prev, ...newPets]);
      setHasMore(more);

      const ids = [...new Set(newPets.map(p => p.reporter_id).filter(Boolean))] as string[];
      if (ids.length) {
        fetchProfilesByIds(ids).then(profiles =>
          setReporterProfiles(prev => ({ ...prev, ...profiles }))
        );
      }
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const loadMore = () => {
    const next = page + 1;
    setPage(next);
    load(next);
  };

  const FilterBtn = ({
    active, onClick, children,
  }: { active: boolean; onClick: () => void; children: React.ReactNode }) => (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
        active
          ? "bg-[#2b9dee] text-white"
          : "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300"
      }`}
    >
      {children}
    </button>
  );

  return (
    <div className="flex flex-col min-h-screen max-w-[430px] lg:max-w-3xl mx-auto bg-[#f6f7f8] dark:bg-slate-900 font-display text-slate-900 dark:text-white pb-8">

      {/* Header */}
      <div className="sticky top-0 z-10 bg-white dark:bg-slate-800 border-b border-slate-100 dark:border-slate-700">
        <div className="flex items-center px-4 py-3 gap-3">
          <button onClick={() => navigate(-1)} className="flex size-9 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-700 shrink-0">
            <span className="material-symbols-outlined text-[20px]">arrow_back</span>
          </button>
          {/* Search */}
          <div className="flex flex-1 items-center bg-slate-100 dark:bg-slate-700 rounded-xl h-9 px-3 gap-2">
            <span className="material-symbols-outlined text-[18px] text-slate-400">search</span>
            <input
              className="flex-1 bg-transparent text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none"
              placeholder="Raza, color, ubicación..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            {search && (
              <button onClick={() => setSearch("")}>
                <span className="material-symbols-outlined text-[16px] text-slate-400">close</span>
              </button>
            )}
          </div>
        </div>

        {/* Filtros — fila 1: estado + especie */}
        <div className="flex gap-2 px-4 pb-2 overflow-x-auto [&::-webkit-scrollbar]:hidden">
          <FilterBtn active={!status} onClick={() => setStatus(undefined)}>Todos</FilterBtn>
          <FilterBtn active={status === "lost"} onClick={() => setStatus(s => s === "lost" ? undefined : "lost")}>
            🔴 Perdidos
          </FilterBtn>
          <FilterBtn active={status === "found"} onClick={() => setStatus(s => s === "found" ? undefined : "found")}>
            🟢 Encontrados
          </FilterBtn>
          <div className="w-px bg-slate-200 dark:bg-slate-600 shrink-0" />
          <FilterBtn active={!species} onClick={() => setSpecies(undefined)}>🐾 Todos</FilterBtn>
          <FilterBtn active={species === "dog"} onClick={() => setSpecies(s => s === "dog" ? undefined : "dog")}>
            🐶 Perros
          </FilterBtn>
          <FilterBtn active={species === "cat"} onClick={() => setSpecies(s => s === "cat" ? undefined : "cat")}>
            🐱 Gatos
          </FilterBtn>
        </div>
        {/* Filtros — fila 2: fecha */}
        <div className="flex gap-2 px-4 pb-3 overflow-x-auto [&::-webkit-scrollbar]:hidden">
          <FilterBtn active={!days} onClick={() => setDays(undefined)}>
            📅 Cualquier fecha
          </FilterBtn>
          <FilterBtn active={days === 1} onClick={() => setDays(d => d === 1 ? undefined : 1)}>Último día</FilterBtn>
          <FilterBtn active={days === 3} onClick={() => setDays(d => d === 3 ? undefined : 3)}>Últimos 3 días</FilterBtn>
          <FilterBtn active={days === 7} onClick={() => setDays(d => d === 7 ? undefined : 7)}>Últimos 7 días</FilterBtn>
          <FilterBtn active={days === 30} onClick={() => setDays(d => d === 30 ? undefined : 30)}>Último mes</FilterBtn>
        </div>
      </div>

      {/* Contador */}
      <div className="px-4 pt-4 pb-2">
        <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">
          {loading ? "Buscando..." : `${pets.length} reporte${pets.length !== 1 ? "s" : ""}${hasMore ? "+" : ""}`}
        </p>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 px-4">
        {loading && (
          <div className="col-span-2 flex justify-center py-16">
            <svg className="animate-spin h-8 w-8 text-[#2b9dee]" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
            </svg>
          </div>
        )}

        {!loading && pets.length === 0 && (
          <div className="col-span-2 flex flex-col items-center py-16 gap-3 text-slate-400 dark:text-slate-500">
            <span className="material-symbols-outlined text-[52px]">pets</span>
            <p className="text-sm font-medium">No hay reportes con esos filtros</p>
          </div>
        )}

        {pets.map(pet => (
          <div
            key={pet.id}
            className="bg-white dark:bg-slate-800 rounded-xl overflow-hidden border border-slate-100 dark:border-slate-700 shadow-sm cursor-pointer"
            onClick={() => navigate(`/pet/${pet.id}`)}
          >
            <div className="relative h-32 bg-slate-200 dark:bg-slate-600">
              {pet.image_url
                ? <img src={pet.image_url} alt={pet.name ?? ""} className="w-full h-full object-cover" />
                : <div className="w-full h-full flex items-center justify-center">
                    <span className="material-symbols-outlined text-[40px] text-slate-300 dark:text-slate-500">pets</span>
                  </div>
              }
              <div className={`absolute top-2 left-2 ${pet.status === "lost" ? "bg-red-600" : "bg-emerald-600"} text-white px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider`}>
                {pet.status === "lost" ? "Perdido" : "Encontrado"}
              </div>
              <div className="absolute bottom-0 inset-x-0 h-10 bg-gradient-to-t from-black/40 to-transparent" />
              <span className="absolute bottom-1.5 right-2 text-[10px] text-white/80 font-medium">{timeAgo(pet.created_at)}</span>
            </div>
            <div className="p-2.5">
              <h3 className="text-sm font-bold leading-tight truncate">
                {pet.status === "lost" ? (pet.name ?? "Sin nombre") : (pet.breed ?? "Sin raza")}
              </h3>
              <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 mt-0.5">
                <span className="material-symbols-outlined shrink-0" style={{ fontSize: 18, width: 18, height: 18, lineHeight: 1 }}>location_on</span>
                <span className="text-[11px] truncate">{pet.location}</span>
              </div>
              <div className="flex items-center gap-1.5 mt-1.5">
                <UserAvatar
                  name={pet.reporter_name ?? "Anónimo"}
                  avatarData={pet.reporter_id ? reporterProfiles[pet.reporter_id]?.avatar_data : null}
                  avatarUrl={pet.reporter_id ? reporterProfiles[pet.reporter_id]?.avatar_url : null}
                  size={18}
                />
                <span className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{pet.reporter_name ?? "Anónimo"}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Load more */}
      {!loading && hasMore && (
        <div className="flex justify-center px-4 mt-4">
          <button
            onClick={loadMore}
            disabled={loadingMore}
            className="w-full h-11 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-semibold text-slate-600 dark:text-slate-300 flex items-center justify-center gap-2 disabled:opacity-50 bg-white dark:bg-slate-800"
          >
            {loadingMore ? (
              <svg className="animate-spin h-4 w-4 text-[#2b9dee]" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
              </svg>
            ) : (
              <span className="material-symbols-outlined text-[18px]">expand_more</span>
            )}
            {loadingMore ? "Cargando..." : "Ver más reportes"}
          </button>
        </div>
      )}

      {!loading && !hasMore && pets.length > 0 && (
        <p className="text-center text-xs text-slate-400 dark:text-slate-500 mt-6">
          No hay más reportes
        </p>
      )}
    </div>
  );
}
