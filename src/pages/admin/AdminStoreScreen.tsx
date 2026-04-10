import { useEffect, useState } from "react";
import {
  fetchStoreItems, createStoreItem, updateStoreItem, deleteStoreItem,
  uploadAdminImage, type StoreItem, type StoreItemInput,
} from "../../lib/adminService";
import ImageCropModal from "../../components/ImageCropModal";

const EMPTY: StoreItemInput = {
  name: "", category: "", price_label: "", description: "",
  image_url: null, link_url: "", is_active: true,
};

export default function AdminStoreScreen() {
  const [items, setItems] = useState<StoreItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<StoreItem | null>(null);
  const [form, setForm] = useState<StoreItemInput>(EMPTY);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);

  const load = () => {
    setLoading(true);
    fetchStoreItems().then(setItems).finally(() => setLoading(false));
  };

  useEffect(load, []);

  const openCreate = () => { setEditing(null); setForm(EMPTY); setImageFile(null); setModalOpen(true); };
  const openEdit = (item: StoreItem) => {
    setEditing(item);
    setForm({ name: item.name, category: item.category ?? "", price_label: item.price_label ?? "", description: item.description ?? "", image_url: item.image_url, link_url: item.link_url ?? "", is_active: item.is_active });
    setImageFile(null);
    setModalOpen(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      let image_url = form.image_url;
      if (imageFile) image_url = await uploadAdminImage(imageFile, "pet-images", "store");
      const payload = { ...form, image_url };
      if (editing) await updateStoreItem(editing.id, payload);
      else await createStoreItem(payload);
      setModalOpen(false);
      load();
    } catch (e) {
      alert(e instanceof Error ? e.message : "Error al guardar");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try { await deleteStoreItem(deleteId); load(); }
    catch (e) { alert(e instanceof Error ? e.message : "Error al eliminar"); }
    finally { setDeleteId(null); }
  };

  const set = (k: keyof StoreItemInput, v: string | boolean | null) =>
    setForm((f) => ({ ...f, [k]: v }));

  return (
    <div className="max-w-5xl">
      <div className="flex items-center justify-between mb-6">
        <p className="text-slate-500 text-sm">{items.length} registros</p>
        <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2.5 bg-[#2b9dee] text-white text-sm font-bold rounded-xl shadow-sm">
          <span className="material-symbols-outlined text-[18px]">add</span>
          Nuevo producto
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <svg className="animate-spin h-8 w-8 text-[#2b9dee]" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
          </svg>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                <th className="text-left px-4 py-3 font-semibold text-slate-500">Producto</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-500 hidden md:table-cell">Categoría</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-500 hidden sm:table-cell">Precio</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-500 hidden lg:table-cell">Estado</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-slate-100 overflow-hidden shrink-0">
                        {item.image_url
                          ? <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                          : <div className="w-full h-full flex items-center justify-center"><span className="material-symbols-outlined text-slate-300 text-[20px]">storefront</span></div>
                        }
                      </div>
                      <p className="font-semibold">{item.name}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-slate-600 hidden md:table-cell">{item.category ?? "—"}</td>
                  <td className="px-4 py-3 font-semibold text-[#2b9dee] hidden sm:table-cell">{item.price_label ?? "—"}</td>
                  <td className="px-4 py-3 hidden lg:table-cell">
                    <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${item.is_active ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>
                      {item.is_active ? "Activo" : "Inactivo"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1 justify-end">
                      <button onClick={() => openEdit(item)} className="p-2 rounded-lg hover:bg-slate-100 text-slate-500">
                        <span className="material-symbols-outlined text-[18px]">edit</span>
                      </button>
                      <button onClick={() => setDeleteId(item.id)} className="p-2 rounded-lg hover:bg-red-50 text-red-400">
                        <span className="material-symbols-outlined text-[18px]">delete</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr><td colSpan={5} className="text-center py-12 text-slate-400">No hay productos aún</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => !saving && setModalOpen(false)} />
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6">
            <h3 className="text-lg font-bold mb-5">{editing ? "Editar producto" : "Nuevo producto"}</h3>
            <div className="flex flex-col gap-4">
              <Field label="Nombre *" value={form.name} onChange={(v) => set("name", v)} />
              <div className="grid grid-cols-2 gap-3">
                <Field label="Categoría" value={form.category ?? ""} onChange={(v) => set("category", v)} placeholder="Collares, GPS..." />
                <Field label="Precio" value={form.price_label ?? ""} onChange={(v) => set("price_label", v)} placeholder="$24.99" />
              </div>
              <Field label="Link de compra" value={form.link_url ?? ""} onChange={(v) => set("link_url", v)} placeholder="https://..." />
              <Textarea label="Descripción" value={form.description ?? ""} onChange={(v) => set("description", v)} />
              <ImageField label="Imagen" currentUrl={form.image_url} onFile={setImageFile} />
              <Toggle label="Activo" value={form.is_active} onChange={(v) => set("is_active", v)} />
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setModalOpen(false)} disabled={saving} className="flex-1 h-11 rounded-xl border border-slate-200 text-sm font-bold text-slate-600 disabled:opacity-50">Cancelar</button>
              <button onClick={handleSave} disabled={saving || !form.name} className="flex-1 h-11 rounded-xl bg-[#2b9dee] text-white text-sm font-bold disabled:opacity-50 flex items-center justify-center gap-2">
                {saving && <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg>}
                {saving ? "Guardando..." : "Guardar"}
              </button>
            </div>
          </div>
        </div>
      )}

      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setDeleteId(null)} />
          <div className="relative bg-white rounded-2xl p-6 shadow-xl w-full max-w-sm text-center">
            <p className="font-bold mb-2">¿Eliminar este producto?</p>
            <p className="text-sm text-slate-500 mb-6">Esta acción no se puede deshacer.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteId(null)} className="flex-1 h-11 rounded-xl border border-slate-200 text-sm font-bold text-slate-600">Cancelar</button>
              <button onClick={handleDelete} className="flex-1 h-11 rounded-xl bg-red-500 text-white text-sm font-bold">Eliminar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Field({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <div>
      <label className="text-xs font-semibold text-slate-500 mb-1 block">{label}</label>
      <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
        className="w-full h-10 rounded-xl border border-slate-200 px-3 text-sm focus:outline-none focus:border-[#2b9dee]" />
    </div>
  );
}

function Textarea({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="text-xs font-semibold text-slate-500 mb-1 block">{label}</label>
      <textarea value={value} onChange={(e) => onChange(e.target.value)} rows={3}
        className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:border-[#2b9dee] resize-none" />
    </div>
  );
}

function Toggle({ label, value, onChange }: { label: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm font-semibold text-slate-700">{label}</span>
      <button type="button" onClick={() => onChange(!value)} className={`relative w-11 h-6 rounded-full transition-colors ${value ? "bg-[#2b9dee]" : "bg-slate-300"}`}>
        <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${value ? "translate-x-5" : ""}`} />
      </button>
    </div>
  );
}

function ImageField({ label, currentUrl, onFile }: { label: string; currentUrl: string | null; onFile: (f: File) => void }) {
  const [cropSrc, setCropSrc] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(currentUrl);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCropSrc(URL.createObjectURL(file));
    e.target.value = "";
  };

  const handleCropConfirm = (_dataUrl: string, file: File) => {
    setPreview(_dataUrl);
    onFile(file);
    setCropSrc(null);
  };

  return (
    <>
      <div>
        <label className="text-xs font-semibold text-slate-500 mb-1 block">{label}</label>
        <div className="flex items-center gap-3">
          <div className="w-14 h-14 rounded-xl bg-slate-100 overflow-hidden shrink-0">
            {preview ? <img src={preview} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center"><span className="material-symbols-outlined text-slate-300 text-[22px]">image</span></div>}
          </div>
          <label className="flex-1 flex items-center justify-center h-10 rounded-xl border-2 border-dashed border-slate-300 text-xs text-slate-500 cursor-pointer hover:border-[#2b9dee] hover:text-[#2b9dee] transition-colors">
            <span className="material-symbols-outlined text-[16px] mr-1.5">upload</span>
            {preview ? "Cambiar imagen" : "Subir imagen"}
            <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
          </label>
        </div>
      </div>
      {cropSrc && (
        <ImageCropModal src={cropSrc} onConfirm={handleCropConfirm} onCancel={() => setCropSrc(null)} />
      )}
    </>
  );
}
