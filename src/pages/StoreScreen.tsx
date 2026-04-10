import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import BottomNav from "../components/BottomNav";
import { fetchStoreItems, type StoreItem } from "../lib/adminService";

export default function StoreScreen() {
  const navigate = useNavigate();
  const [allItems, setAllItems] = useState<StoreItem[]>([]);
  const [activeCategory, setActiveCategory] = useState("Todos");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchStoreItems()
      .then((data) => setAllItems(data.filter((i) => i.is_active)))
      .finally(() => setIsLoading(false));
  }, []);

  const categories = ["Todos", ...Array.from(new Set(allItems.map((i) => i.category).filter(Boolean) as string[]))];
  const filtered = activeCategory === "Todos" ? allItems : allItems.filter((i) => i.category === activeCategory);

  return (
    <div className="relative flex min-h-screen w-full max-w-[430px] lg:max-w-3xl mx-auto flex-col bg-[#f6f7f8] dark:bg-slate-900 font-display text-slate-900 dark:text-white pb-24 lg:pb-8">
      {/* Header */}
      <div className="flex items-center p-4 pb-2 justify-between bg-white dark:bg-slate-800 border-b border-slate-100 dark:border-slate-700 sticky top-0 z-10">
        <button onClick={() => navigate(-1)} className="flex size-10 items-center justify-center">
          <span className="material-symbols-outlined text-[24px]">arrow_back_ios</span>
        </button>
        <h2 className="text-lg font-bold flex-1 text-center pr-10">Tienda Firulais</h2>
      </div>

      <div className="sticky top-[57px] z-10 bg-white dark:bg-slate-800 border-b border-slate-100 dark:border-slate-700">

        {/* Category pills */}
        {!isLoading && categories.length > 1 && (
          <div className="flex gap-2 px-4 pb-4 overflow-x-auto [&::-webkit-scrollbar]:hidden">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`flex h-9 shrink-0 items-center justify-center rounded-full px-5 text-sm font-semibold transition-colors ${
                  activeCategory === cat
                    ? "bg-[#2b9dee] text-white"
                    : "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="px-4 pt-4 flex flex-col gap-5 pb-4">
        {/* Impact banner */}
        <div className="p-5 rounded-2xl bg-[#2b9dee]/10 dark:bg-[#2b9dee]/20 border border-[#2b9dee]/20">
          <div className="flex items-center gap-2 text-[#2b9dee] font-bold uppercase text-[10px] tracking-widest mb-2">
            <span className="material-symbols-outlined text-sm">volunteer_activism</span>
            Impacto Social
          </div>
          <p className="text-slate-900 dark:text-white text-base font-bold leading-tight">Tu compra ayuda</p>
          <p className="text-slate-600 dark:text-slate-400 text-sm mt-1 leading-relaxed">
            Donamos el <span className="text-[#2b9dee] font-bold">5% de cada venta</span> a refugios locales de animales sin hogar.
          </p>
        </div>

        {isLoading && (
          <div className="flex justify-center py-10">
            <svg className="animate-spin h-8 w-8 text-[#2b9dee]" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
            </svg>
          </div>
        )}

        {!isLoading && filtered.length === 0 && (
          <div className="flex flex-col items-center py-12 text-slate-400 dark:text-slate-500 gap-3">
            <span className="material-symbols-outlined text-[52px]">storefront</span>
            <p className="text-sm font-medium">No hay productos disponibles por ahora</p>
          </div>
        )}

        {/* Product grid */}
        {filtered.length > 0 && (
          <div className="grid grid-cols-2 gap-4">
            {filtered.map((product) => (
              <div key={product.id} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 overflow-hidden shadow-sm dark:shadow-slate-900/50">
                <div className="aspect-square w-full bg-slate-200 dark:bg-slate-600 relative overflow-hidden">
                  {product.image_url
                    ? <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
                    : <div className="w-full h-full flex items-center justify-center">
                        <span className="material-symbols-outlined text-[40px] text-slate-300 dark:text-slate-500">storefront</span>
                      </div>
                  }
                </div>
                <div className="p-3">
                  {product.category && (
                    <p className="text-[10px] font-bold text-[#2b9dee] uppercase">{product.category}</p>
                  )}
                  <h3 className="font-bold text-slate-900 dark:text-white text-sm mt-0.5 line-clamp-1">{product.name}</h3>
                  <div className="flex items-center justify-between mt-2">
                    <span className="font-extrabold text-[#2b9dee]">{product.price_label ?? ""}</span>
                    {product.link_url ? (
                      <a
                        href={product.link_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 rounded-xl bg-[#2b9dee] text-white flex items-center justify-center"
                      >
                        <span className="material-symbols-outlined text-[18px]">open_in_new</span>
                      </a>
                    ) : (
                      <button className="p-1.5 rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                        <span className="material-symbols-outlined text-[18px]">add_shopping_cart</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
}
