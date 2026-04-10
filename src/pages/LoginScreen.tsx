import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import OAuthButtons from "../components/OAuthButtons";

function validate(email: string, password: string) {
  if (!email) return "Ingresa tu correo electrónico";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return "El correo no es válido";
  if (!password) return "Ingresa tu contraseña";
  if (password.length < 6) return "La contraseña debe tener al menos 6 caracteres";
  return null;
}

export default function LoginScreen() {
  const navigate = useNavigate();
  const { login, isLoading, error, clearError, user, pendingEmail } = useAuth();

  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [touched, setTouched] = useState(false);

  useEffect(() => {
    if (user) navigate("/home");
  }, [user, navigate]);

  useEffect(() => {
    if (pendingEmail) navigate("/register");
  }, [pendingEmail, navigate]);

  const handleLogin = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    setTouched(true);
    clearError();

    const validationError = validate(email, password);
    if (validationError) {
      setFieldError(validationError);
      return;
    }

    setFieldError(null);
    await login(email, password);
  };

  const displayError = fieldError || error;

  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden max-w-[430px] mx-auto bg-white dark:bg-slate-800 font-display text-slate-900 dark:text-white">
      <div className="flex items-center p-4 pb-2 justify-between">
        <div className="flex size-12 shrink-0 items-center justify-center cursor-pointer">
          <span className="material-symbols-outlined text-[24px]">arrow_back_ios</span>
        </div>
        <h2 className="text-lg font-bold leading-tight tracking-[-0.015em] flex-1 text-center pr-12">Bienvenido</h2>
      </div>

      <div className="py-6 flex justify-center">
        <div className="relative">
          <div className="absolute inset-0 scale-125 bg-sky-400/10 blur-3xl rounded-full"></div>
          <div className="relative flex h-36 w-36 items-center justify-center rounded-full bg-white shadow-xl shadow-sky-200/50 border border-sky-100">
            <span className="material-symbols-outlined text-[#38bdf8] text-[80px] leading-none select-none">pets</span>
            <div className="absolute -bottom-1 -right-1 flex h-10 w-10 items-center justify-center rounded-full bg-sky-500 text-white shadow-lg border-4 border-white">
              <span className="material-symbols-outlined text-[18px] leading-none">search</span>
            </div>
          </div>
        </div>
      </div>

      <div className="px-6 pb-6 text-center">
        <h1 className="tracking-tight text-3xl font-extrabold leading-tight">Log In</h1>
        <p className="text-slate-600 dark:text-slate-400 text-base font-normal leading-normal pt-2">
          Únete a nuestra comunidad y ayuda a las mascotas a volver a casa.
        </p>
      </div>

      <form onSubmit={handleLogin} className="flex flex-col gap-4 px-6" noValidate>
        <label className="flex flex-col w-full">
          <p className="text-sm font-semibold leading-normal pb-2 px-1">Correo electrónico</p>
          <div className="relative">
            <div className="absolute inset-y-0 left-4 flex items-center text-slate-400">
              <span className="material-symbols-outlined text-[20px]">mail</span>
            </div>
            <input
              className={`flex w-full rounded-xl text-slate-900 dark:text-white border bg-slate-50 dark:bg-slate-700 dark:placeholder:text-slate-400 focus:outline-none h-14 pl-12 placeholder:text-slate-400 text-base font-normal transition-colors
                ${touched && !email ? "border-red-400 focus:border-red-400 focus:ring-2 focus:ring-red-400/20" : "border-slate-200 dark:border-slate-600 focus:border-[#2b9dee] focus:ring-2 focus:ring-[#2b9dee]/20"}`}
              placeholder="tu@correo.com"
              type="email"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setFieldError(null); clearError(); }}
              autoComplete="email"
              inputMode="email"
            />
          </div>
        </label>

        <label className="flex flex-col w-full">
          <p className="text-sm font-semibold leading-normal pb-2 px-1">Contraseña</p>
          <div className="relative">
            <div className="absolute inset-y-0 left-4 flex items-center text-slate-400">
              <span className="material-symbols-outlined text-[20px]">lock</span>
            </div>
            <input
              className={`flex w-full rounded-xl text-slate-900 dark:text-white border bg-slate-50 dark:bg-slate-700 dark:placeholder:text-slate-400 focus:outline-none h-14 pl-12 pr-12 placeholder:text-slate-400 text-base font-normal transition-colors
                ${touched && !password ? "border-red-400 focus:border-red-400 focus:ring-2 focus:ring-red-400/20" : "border-slate-200 dark:border-slate-600 focus:border-[#2b9dee] focus:ring-2 focus:ring-[#2b9dee]/20"}`}
              placeholder="Ingresa tu contraseña"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => { setPassword(e.target.value); setFieldError(null); clearError(); }}
              autoComplete="current-password"
            />
            <button
              type="button"
              className="absolute inset-y-0 right-4 flex items-center text-slate-400 cursor-pointer"
              onClick={() => setShowPassword(!showPassword)}
              tabIndex={-1}
            >
              <span className="material-symbols-outlined text-[20px]">
                {showPassword ? "visibility_off" : "visibility"}
              </span>
            </button>
          </div>
        </label>

        {displayError && (
          <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
            <span className="material-symbols-outlined text-red-500 text-[18px]">error</span>
            <p className="text-red-600 text-sm font-medium">{displayError}</p>
          </div>
        )}

        <div className="flex justify-end">
          <button type="button" className="text-[#2b9dee] text-sm font-bold hover:underline">
            ¿Olvidaste tu contraseña?
          </button>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-[#2b9dee] hover:bg-[#1a7bbf] disabled:opacity-70 disabled:cursor-not-allowed text-white h-14 rounded-xl text-base font-bold transition-all shadow-lg shadow-[#2b9dee]/20 mt-2 flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
              </svg>
              Iniciando sesión...
            </>
          ) : (
            "Iniciar Sesión"
          )}
        </button>
      </form>

      <OAuthButtons label="O continúa con" />

      <div className="mt-auto px-6 py-8 text-center">
        <p className="text-slate-600 dark:text-slate-400 text-sm">
          ¿No tienes una cuenta?{" "}
          <button className="text-[#2b9dee] font-bold" onClick={() => navigate("/register")}>Regístrate</button>
        </p>
      </div>

      <div className="h-8 flex justify-center items-end pb-2">
        <div className="w-32 h-1.5 bg-slate-200 dark:bg-slate-600 rounded-full"></div>
      </div>
    </div>
  );
}
