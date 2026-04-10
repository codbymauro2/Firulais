import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const styles = `
  @keyframes fadeInScale {
    0%   { opacity: 0; transform: scale(0.6); }
    60%  { opacity: 1; transform: scale(1.08); }
    100% { opacity: 1; transform: scale(1); }
  }
  @keyframes bounceIn {
    0%   { opacity: 0; transform: scale(0.3) rotate(-20deg); }
    50%  { opacity: 1; transform: scale(1.15) rotate(5deg); }
    75%  { transform: scale(0.95) rotate(-3deg); }
    100% { opacity: 1; transform: scale(1) rotate(0deg); }
  }
  @keyframes slideUp {
    0%   { opacity: 0; transform: translateY(24px); }
    100% { opacity: 1; transform: translateY(0); }
  }
  @keyframes fillBar {
    0%   { width: 0%; }
    20%  { width: 15%; }
    50%  { width: 55%; }
    80%  { width: 80%; }
    100% { width: 95%; }
  }
  @keyframes glowPulse {
    0%, 100% { opacity: 0.15; transform: scale(1.25); }
    50%       { opacity: 0.35; transform: scale(1.45); }
  }
  @keyframes badgePop {
    0%   { opacity: 0; transform: scale(0) rotate(-30deg); }
    70%  { transform: scale(1.2) rotate(5deg); }
    100% { opacity: 1; transform: scale(1) rotate(0deg); }
  }

  .anim-logo       { animation: fadeInScale 0.7s cubic-bezier(0.34,1.56,0.64,1) 0.2s both; }
  .anim-icon       { animation: bounceIn 0.8s cubic-bezier(0.34,1.56,0.64,1) 0.5s both; }
  .anim-badge      { animation: badgePop  0.6s cubic-bezier(0.34,1.56,0.64,1) 1.0s both; }
  .anim-glow       { animation: glowPulse 2.5s ease-in-out 0.8s infinite; }
  .anim-title      { animation: slideUp 0.6s ease-out 0.85s both; }
  .anim-subtitle   { animation: slideUp 0.6s ease-out 1.05s both; }
  .anim-bar        { animation: fillBar 2.2s ease-out 1.2s both; }
  .anim-label      { animation: slideUp 0.5s ease-out 1.3s both; }
`;

export default function SplashScreen() {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => navigate("/login"), 3000);
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <>
      <style>{styles}</style>
      <div className="relative flex h-screen w-full flex-col bg-[#f0f9ff] font-display antialiased overflow-hidden max-w-[430px] mx-auto">
        <div className="flex flex-1 flex-col items-center justify-center px-8">
          <div className="w-full max-w-sm flex flex-col items-center">
            <div className="relative mb-10 anim-logo">
              <div className="absolute inset-0 scale-125 bg-sky-400/10 blur-3xl rounded-full anim-glow"></div>
              <div className="relative flex h-52 w-52 items-center justify-center rounded-full bg-white shadow-xl shadow-sky-200/50 border border-sky-100">
                <div className="flex items-center justify-center">
                  <span className="material-symbols-outlined text-[#38bdf8] text-[110px] leading-none select-none anim-icon">pets</span>
                  <div className="absolute -bottom-1 -right-1 flex h-14 w-14 items-center justify-center rounded-full bg-sky-500 text-white shadow-lg border-4 border-white p-2 anim-badge">
                    <span className="material-symbols-outlined text-2xl leading-none">search</span>
                  </div>
                </div>
              </div>
            </div>

            <h1 className="text-sky-900 tracking-tight text-[48px] font-extrabold leading-tight text-center anim-title">
              Firulais
            </h1>
            <p className="text-sky-600 text-xl font-medium leading-relaxed mt-4 text-center max-w-[280px] anim-subtitle">
              Reconectando mascotas con sus familias
            </p>
          </div>
        </div>

        <div className="w-full px-12 pb-24">
          <div className="flex flex-col gap-5 items-center">
            <div className="w-full max-w-[200px] h-1.5 rounded-full bg-sky-200/50 overflow-hidden">
              <div className="anim-bar h-full bg-sky-500 rounded-full shadow-[0_0_15px_rgba(56,189,248,0.5)]"></div>
            </div>
            <span className="text-sky-400 text-[11px] font-bold uppercase tracking-[0.2em] anim-label">
              Iniciando...
            </span>
          </div>
        </div>

        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-36 h-1.5 bg-sky-900/10 rounded-full"></div>
      </div>
    </>
  );
}
