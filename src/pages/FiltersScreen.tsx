import { useState } from "react";
import { useNavigate } from "react-router-dom";

const species = ["Todos", "Perro", "Gato", "Otro"];
const statuses = ["Todos", "Perdido", "Encontrado", "Adoptado"];
const distances = ["1 km", "5 km", "10 km", "25 km", "50 km"];

export default function FiltersScreen() {
  const navigate = useNavigate();
  const [selectedSpecies, setSelectedSpecies] = useState("Todos");
  const [selectedStatus, setSelectedStatus] = useState("Todos");
  const [selectedDistance, setSelectedDistance] = useState("10 km");
  const [withReward, setWithReward] = useState(false);

  return (
    <div className="relative flex h-auto min-h-screen w-full max-w-[430px] lg:max-w-3xl mx-auto flex-col bg-[#f6f7f8] dark:bg-slate-900 font-display text-slate-900 dark:text-white pb-10">
      <div className="flex items-center p-4 pb-2 justify-between bg-white dark:bg-slate-800 border-b border-slate-100 dark:border-slate-700 sticky top-0 z-10">
        <button onClick={() => navigate(-1)} className="flex size-10 items-center justify-center">
          <span className="material-symbols-outlined text-[24px]">arrow_back_ios</span>
        </button>
        <h2 className="text-lg font-bold flex-1 text-center pr-10">Filtros de Búsqueda</h2>
      </div>

      <div className="px-4 py-5 flex flex-col gap-6">
        <div>
          <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-3">Tipo de mascota</h3>
          <div className="flex gap-2 flex-wrap">
            {species.map((s) => (
              <button
                key={s}
                onClick={() => setSelectedSpecies(s)}
                className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors ${selectedSpecies === s ? "bg-[#2b9dee] text-white" : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-600"}`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-3">Estado</h3>
          <div className="flex gap-2 flex-wrap">
            {statuses.map((s) => (
              <button
                key={s}
                onClick={() => setSelectedStatus(s)}
                className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors ${selectedStatus === s ? "bg-[#2b9dee] text-white" : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-600"}`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-3">Distancia máxima</h3>
          <div className="flex gap-2 flex-wrap">
            {distances.map((d) => (
              <button
                key={d}
                onClick={() => setSelectedDistance(d)}
                className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors ${selectedDistance === d ? "bg-[#2b9dee] text-white" : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-600"}`}
              >
                {d}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-100 dark:border-slate-700 flex items-center justify-between">
          <div>
            <p className="text-sm font-bold">Solo con recompensa</p>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">Mostrar reportes con recompensa activa</p>
          </div>
          <button
            onClick={() => setWithReward(!withReward)}
            className={`w-12 h-6 rounded-full transition-colors relative ${withReward ? "bg-[#2b9dee]" : "bg-slate-200 dark:bg-slate-600"}`}
          >
            <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${withReward ? "translate-x-6" : "translate-x-0.5"}`}></span>
          </button>
        </div>
      </div>

      <div className="px-4 pb-6 mt-auto">
        <button
          onClick={() => navigate(-1)}
          className="w-full h-14 bg-[#2b9dee] text-white rounded-xl font-bold text-base shadow-lg shadow-[#2b9dee]/20"
        >
          Aplicar Filtros
        </button>
        <button
          onClick={() => { setSelectedSpecies("Todos"); setSelectedStatus("Todos"); setSelectedDistance("10 km"); setWithReward(false); }}
          className="w-full h-12 mt-3 text-slate-500 dark:text-slate-400 font-semibold text-sm"
        >
          Limpiar Filtros
        </button>
      </div>
    </div>
  );
}
