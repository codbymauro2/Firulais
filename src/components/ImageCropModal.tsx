import { useRef, useState } from "react";

const FRAME = 320;

export default function ImageCropModal({
  src,
  onConfirm,
  onCancel,
}: {
  src: string;
  onConfirm: (dataUrl: string, file: File) => void;
  onCancel: () => void;
}) {
  const imgRef = useRef<HTMLImageElement>(null);
  const [size, setSize] = useState({ w: 0, h: 0 });
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const drag = useRef({ active: false, startX: 0, startY: 0, ox: 0, oy: 0 });

  const clamp = (o: { x: number; y: number }, s: number) => ({
    x: Math.min(0, Math.max(FRAME - size.w * s, o.x)),
    y: Math.min(0, Math.max(FRAME - size.h * s, o.y)),
  });

  const onLoad = () => {
    const { naturalWidth: w, naturalHeight: h } = imgRef.current!;
    const minScale = Math.max(FRAME / w, FRAME / h);
    setSize({ w, h });
    setScale(minScale);
    setOffset({
      x: (FRAME - w * minScale) / 2,
      y: (FRAME - h * minScale) / 2,
    });
  };

  const onTouchStart = (e: React.TouchEvent) => {
    drag.current = { active: true, startX: e.touches[0].clientX, startY: e.touches[0].clientY, ox: offset.x, oy: offset.y };
  };
  const onTouchMove = (e: React.TouchEvent) => {
    if (!drag.current.active) return;
    setOffset(clamp({ x: drag.current.ox + (e.touches[0].clientX - drag.current.startX), y: drag.current.oy + (e.touches[0].clientY - drag.current.startY) }, scale));
  };
  const onTouchEnd = () => { drag.current.active = false; };

  const onMouseDown = (e: React.MouseEvent) => {
    drag.current = { active: true, startX: e.clientX, startY: e.clientY, ox: offset.x, oy: offset.y };
  };
  const onMouseMove = (e: React.MouseEvent) => {
    if (!drag.current.active) return;
    setOffset(clamp({ x: drag.current.ox + (e.clientX - drag.current.startX), y: drag.current.oy + (e.clientY - drag.current.startY) }, scale));
  };
  const onMouseUp = () => { drag.current.active = false; };

  const handleConfirm = () => {
    const canvas = document.createElement("canvas");
    canvas.width = 800;
    canvas.height = 800;
    const ctx = canvas.getContext("2d")!;
    ctx.drawImage(imgRef.current!, -offset.x / scale, -offset.y / scale, FRAME / scale, FRAME / scale, 0, 0, 800, 800);
    canvas.toBlob((blob) => {
      if (!blob) return;
      onConfirm(canvas.toDataURL("image/jpeg", 0.9), new File([blob], "photo.jpg", { type: "image/jpeg" }));
    }, "image/jpeg", 0.9);
  };

  return (
    <div className="fixed inset-0 z-[9999] flex flex-col bg-black">
      <div className="flex items-center justify-between px-5 pt-10 pb-4">
        <button onClick={onCancel} className="text-sm text-white/70 font-semibold px-2 py-1">Cancelar</button>
        <p className="text-sm font-bold text-white">Ajustar foto</p>
        <button onClick={handleConfirm} className="text-sm text-[#2b9dee] font-bold px-2 py-1">Listo</button>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center gap-4">
        <div
          style={{ width: FRAME, height: FRAME, overflow: "hidden", cursor: drag.current.active ? "grabbing" : "grab", touchAction: "none" }}
          className="rounded-2xl select-none relative"
          onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onTouchEnd}
          onMouseDown={onMouseDown} onMouseMove={onMouseMove} onMouseUp={onMouseUp} onMouseLeave={onMouseUp}
        >
          <img
            ref={imgRef} src={src} onLoad={onLoad} draggable={false}
            style={{ display: "block", width: size.w * scale, height: size.h * scale, maxWidth: "none", maxHeight: "none", transform: `translate(${offset.x}px, ${offset.y}px)`, pointerEvents: "none", userSelect: "none" }}
          />
          <div className="absolute inset-0 pointer-events-none" style={{ border: "2px solid rgba(255,255,255,0.6)", borderRadius: "inherit" }}>
            {[1, 2].map(i => <div key={`v${i}`} className="absolute top-0 bottom-0" style={{ left: `${(i / 3) * 100}%`, borderLeft: "1px solid rgba(255,255,255,0.25)" }} />)}
            {[1, 2].map(i => <div key={`h${i}`} className="absolute left-0 right-0" style={{ top: `${(i / 3) * 100}%`, borderTop: "1px solid rgba(255,255,255,0.25)" }} />)}
          </div>
        </div>
        <p className="text-xs text-white/50">Arrastrá para encuadrar</p>
      </div>

      {size.w > 0 && (
        <div className="px-8 pb-12 flex flex-col gap-2">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-white/50 text-[18px]">zoom_out</span>
            <input
              type="range" className="flex-1 accent-[#2b9dee]"
              min={Math.max(FRAME / size.w, FRAME / size.h) * 100}
              max={Math.max(FRAME / size.w, FRAME / size.h) * 300}
              value={scale * 100}
              onChange={(e) => {
                const s = Number(e.target.value) / 100;
                setScale(s);
                setOffset(prev => clamp(prev, s));
              }}
            />
            <span className="material-symbols-outlined text-white/50 text-[18px]">zoom_in</span>
          </div>
        </div>
      )}
    </div>
  );
}
