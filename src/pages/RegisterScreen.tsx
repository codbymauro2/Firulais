import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import OAuthButtons from "../components/OAuthButtons";

function validate(name: string, email: string, password: string, confirm: string) {
  if (!name.trim()) return "Ingresa tu nombre completo";
  if (!email) return "Ingresa tu correo electrónico";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return "El correo no es válido";
  if (!password) return "Ingresa una contraseña";
  if (password.length < 6) return "La contraseña debe tener al menos 6 caracteres";
  if (!confirm) return "Confirma tu contraseña";
  if (password !== confirm) return "Las contraseñas no coinciden";
  return null;
}

export default function RegisterScreen() {
  const navigate = useNavigate();
  const { register, resendConfirmation, isLoading, error, clearError, clearPendingEmail, user, pendingEmail } = useAuth();
  const [resent, setResent] = useState(false);
  const resendTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [touched, setTouched] = useState(false);

  useEffect(() => {
    if (user) navigate("/home");
  }, [user, navigate]);

  useEffect(() => () => { if (resendTimer.current) clearTimeout(resendTimer.current); }, []);

  const handleResend = async () => {
    await resendConfirmation();
    setResent(true);
    resendTimer.current = setTimeout(() => setResent(false), 30000);
  };

  const handleRegister = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    setTouched(true);
    clearError();

    const validationError = validate(name, email, password, confirm);
    if (validationError) {
      setFieldError(validationError);
      return;
    }

    setFieldError(null);
    await register(name, email, password);
  };

  const clearFieldError = () => { setFieldError(null); clearError(); };
  const displayError = fieldError || error;

  const inputBase =
    "flex w-full rounded-xl text-slate-900 dark:text-white border bg-slate-50 dark:bg-slate-700 dark:placeholder:text-slate-400 focus:outline-none h-14 placeholder:text-slate-400 text-base font-normal transition-colors";
  const inputNormal = "border-slate-200 dark:border-slate-600 focus:border-[#2b9dee] focus:ring-2 focus:ring-[#2b9dee]/20";
  const inputError  = "border-red-400 focus:border-red-400 focus:ring-2 focus:ring-red-400/20";

  // Pantalla de confirmación de email
  if (pendingEmail) {
    return (
      <div className="relative flex min-h-screen w-full flex-col items-center justify-center max-w-[430px] mx-auto bg-white dark:bg-slate-800 font-display text-slate-900 dark:text-white px-8">
        <div className="w-24 h-24 rounded-full bg-[#2b9dee]/10 dark:bg-[#2b9dee]/20 flex items-center justify-center mb-8">
          <span className="material-symbols-outlined text-[#2b9dee] text-[52px]">mark_email_unread</span>
        </div>
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white text-center mb-3">Revisá tu correo</h1>
        <p className="text-slate-600 dark:text-slate-400 text-sm text-center leading-relaxed mb-2">
          Enviamos un enlace de confirmación a
        </p>
        <p className="text-[#2b9dee] font-bold text-sm text-center mb-8 break-all">{pendingEmail}</p>
        <p className="text-slate-500 dark:text-slate-400 text-xs text-center leading-relaxed mb-8">
          Hacé clic en el enlace del correo para activar tu cuenta. Si no lo ves, revisá la carpeta de spam.
        </p>

        <button
          type="button"
          onClick={handleResend}
          disabled={resent || isLoading}
          className="w-full border border-[#2b9dee] text-[#2b9dee] h-12 rounded-xl text-sm font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed mb-4"
        >
          {resent ? "Correo reenviado ✓" : "Reenviar correo"}
        </button>

        <button
          type="button"
          onClick={() => { clearPendingEmail(); navigate("/login"); }}
          className="w-full text-slate-500 dark:text-slate-400 text-sm font-medium hover:text-slate-700 dark:hover:text-slate-300"
        >
          Volver al inicio de sesión
        </button>

        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-32 h-1.5 bg-slate-200 dark:bg-slate-600 rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden max-w-[430px] mx-auto bg-white dark:bg-slate-800 font-display text-slate-900 dark:text-white">
      {/* Header */}
      <div className="flex items-center p-4 pb-2 justify-between">
        <button
          type="button"
          className="flex size-12 shrink-0 items-center justify-center cursor-pointer"
          onClick={() => navigate("/login")}
        >
          <span className="material-symbols-outlined text-[24px]">arrow_back_ios</span>
        </button>
        <h2 className="text-lg font-bold leading-tight tracking-[-0.015em] flex-1 text-center pr-12">
          Crear cuenta
        </h2>
      </div>

      {/* Logo */}
      <div className="pt-4 pb-2 flex justify-center">
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

      {/* Title */}
      <div className="px-6 pb-5 text-center">
        <h1 className="tracking-tight text-3xl font-extrabold leading-tight">Regístrate</h1>
        <p className="text-slate-600 dark:text-slate-400 text-sm font-normal leading-normal pt-2">
          Crea tu cuenta y ayuda a las mascotas a volver a casa.
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleRegister} className="flex flex-col gap-4 px-6" noValidate>
        {/* Nombre */}
        <label className="flex flex-col w-full">
          <p className="text-sm font-semibold leading-normal pb-2 px-1">Nombre completo</p>
          <div className="relative">
            <div className="absolute inset-y-0 left-4 flex items-center text-slate-400">
              <span className="material-symbols-outlined text-[20px]">person</span>
            </div>
            <input
              className={`${inputBase} pl-12 ${touched && !name.trim() ? inputError : inputNormal}`}
              placeholder="Tu nombre completo"
              type="text"
              value={name}
              onChange={(e) => { setName(e.target.value); clearFieldError(); }}
              autoComplete="name"
            />
          </div>
        </label>

        {/* Email */}
        <label className="flex flex-col w-full">
          <p className="text-sm font-semibold leading-normal pb-2 px-1">Correo electrónico</p>
          <div className="relative">
            <div className="absolute inset-y-0 left-4 flex items-center text-slate-400">
              <span className="material-symbols-outlined text-[20px]">mail</span>
            </div>
            <input
              className={`${inputBase} pl-12 ${touched && !email ? inputError : inputNormal}`}
              placeholder="tu@correo.com"
              type="email"
              value={email}
              onChange={(e) => { setEmail(e.target.value); clearFieldError(); }}
              autoComplete="email"
              inputMode="email"
            />
          </div>
        </label>

        {/* Contraseña */}
        <label className="flex flex-col w-full">
          <p className="text-sm font-semibold leading-normal pb-2 px-1">Contraseña</p>
          <div className="relative">
            <div className="absolute inset-y-0 left-4 flex items-center text-slate-400">
              <span className="material-symbols-outlined text-[20px]">lock</span>
            </div>
            <input
              className={`${inputBase} pl-12 pr-12 ${touched && !password ? inputError : inputNormal}`}
              placeholder="Mínimo 6 caracteres"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => { setPassword(e.target.value); clearFieldError(); }}
              autoComplete="new-password"
            />
            <button
              type="button"
              tabIndex={-1}
              className="absolute inset-y-0 right-4 flex items-center text-slate-400 cursor-pointer"
              onClick={() => setShowPassword(!showPassword)}
            >
              <span className="material-symbols-outlined text-[20px]">
                {showPassword ? "visibility_off" : "visibility"}
              </span>
            </button>
          </div>
        </label>

        {/* Confirmar contraseña */}
        <label className="flex flex-col w-full">
          <p className="text-sm font-semibold leading-normal pb-2 px-1">Confirmar contraseña</p>
          <div className="relative">
            <div className="absolute inset-y-0 left-4 flex items-center text-slate-400">
              <span className="material-symbols-outlined text-[20px]">lock_reset</span>
            </div>
            <input
              className={`${inputBase} pl-12 pr-12 ${touched && (!confirm || confirm !== password) ? inputError : inputNormal}`}
              placeholder="Repite tu contraseña"
              type={showConfirm ? "text" : "password"}
              value={confirm}
              onChange={(e) => { setConfirm(e.target.value); clearFieldError(); }}
              autoComplete="new-password"
            />
            <button
              type="button"
              tabIndex={-1}
              className="absolute inset-y-0 right-4 flex items-center text-slate-400 cursor-pointer"
              onClick={() => setShowConfirm(!showConfirm)}
            >
              <span className="material-symbols-outlined text-[20px]">
                {showConfirm ? "visibility_off" : "visibility"}
              </span>
            </button>
          </div>
        </label>

        {/* Error */}
        {displayError && (
          <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
            <span className="material-symbols-outlined text-red-500 text-[18px]">error</span>
            <p className="text-red-600 text-sm font-medium">{displayError}</p>
          </div>
        )}

        {/* Botón registrar */}
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
              Creando cuenta...
            </>
          ) : (
            "Registrarse"
          )}
        </button>
      </form>

      <OAuthButtons label="O regístrate con" />

      {/* Footer */}
      <div className="mt-auto px-6 py-6 text-center">
        <p className="text-slate-600 dark:text-slate-400 text-sm">
          ¿Ya tienes una cuenta?{" "}
          <button className="text-[#2b9dee] font-bold" onClick={() => navigate("/login")}>
            Inicia sesión
          </button>
        </p>
      </div>

      <div className="h-8 flex justify-center items-end pb-2">
        <div className="w-32 h-1.5 bg-slate-200 dark:bg-slate-600 rounded-full"></div>
      </div>
    </div>
  );
}
