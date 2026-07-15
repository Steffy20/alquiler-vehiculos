import { useState } from "react";
import { ArrowLeft, Eye, EyeOff, Mail, Lock, User, MapPin, Phone, AlertCircle } from "lucide-react";
import { loadFromStorage, saveToStorage } from "../utils/storage";
import { ECUADOR_CITIES, findEcuadorCity } from "../utils/ecuadorCities";
import { RentEcLogo } from "./RentEcLogo";

const ADMIN_EMAIL = "admin@renta.com";
const ADMIN_PASSWORD = "admin123";

interface LoginScreenProps {
  allowBack?: boolean;
  onBack: () => void;
  onLogin: (name?: string, isSignup?: boolean, role?: "admin" | "secretary" | "client", email?: string, phone?: string) => void;
}

export function LoginScreen({ allowBack = true, onBack, onLogin }: LoginScreenProps) {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [signupStep, setSignupStep] = useState(1);
  
  const [name, setName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const getUsers = () => {
    return loadFromStorage<Record<string, any>>("renta_users", {});
  };

  const saveUser = (userEmail: string, userData: any) => {
    const users = getUsers();
    users[userEmail] = userData;
    saveToStorage("renta_users", users);
  };

  const validateLogin = () => {
    const newErrors: Record<string, string> = {};
    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail || !/\S+@\S+\.\S+/.test(normalizedEmail)) {
      newErrors.email = "Correo electrónico inválido";
    } else {
      const users = getUsers();
      if (normalizedEmail === ADMIN_EMAIL) {
        if (password !== ADMIN_PASSWORD) {
          newErrors.password = "Contraseña incorrecta";
        }
      } else if (!users[normalizedEmail] || users[normalizedEmail].disabled) {
        newErrors.email = "Este correo no está registrado";
      } else if (users[normalizedEmail].password !== password) {
        newErrors.password = "Contraseña incorrecta";
      }
    }
    if (!password.trim() && !newErrors.password) {
      newErrors.password = "La contraseña es requerida";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateSignupStep1 = () => {
    const newErrors: Record<string, string> = {};
    if (!name.trim()) newErrors.name = "Requerido";
    if (!lastName.trim()) newErrors.lastName = "Requerido";
    if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Correo inválido";
    } else {
      const users = getUsers();
      if (users[email]) {
        newErrors.email = "Este correo ya está registrado";
      }
    }
    if (!phone.trim() || phone.length < 8) newErrors.phone = "Teléfono inválido";
    if (!city.trim()) newErrors.city = "Requerido";
    else if (!findEcuadorCity(city)) newErrors.city = "Selecciona una ciudad de la lista";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateSignupStep2 = () => {
    const newErrors: Record<string, string> = {};
    if (!password.trim() || password.length < 6) newErrors.password = "Mínimo 6 caracteres";
    if (password !== confirmPassword) newErrors.confirmPassword = "Las contraseñas no coinciden";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAction = () => {
    setErrors({});
    if (mode === "login") {
      const normalizedEmail = email.trim().toLowerCase();
      // Check admin credentials first
      if (normalizedEmail === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
        onLogin("Administrador", false, "admin");
        return;
      }
      if (validateLogin()) {
        const users = getUsers();
        const fullName = users[normalizedEmail].name;
        const role = users[normalizedEmail].role || "client";
        const phone = users[normalizedEmail].phone || "";
        onLogin(fullName, false, role, normalizedEmail, phone);
      }
    } else {
      if (signupStep === 1) {
        if (validateSignupStep1()) {
          setSignupStep(2);
        }
      } else {
        if (validateSignupStep2()) {
          const fullName = name.trim() !== "" ? `${name} ${lastName}`.trim() : email.split('@')[0] || "Usuario";
          saveUser(email, { firstName: name.trim(), lastName: lastName.trim(), name: fullName, password, phone, city: findEcuadorCity(city) || city, role: "client" });
          onLogin(fullName, true, "client", email, phone);
        }
      }
    }
  };

  const InputError = ({ msg }: { msg?: string }) => {
    if (!msg) return null;
    return (
      <div className="flex items-center gap-1 mt-1.5 text-[#d4183d]">
        <AlertCircle size={12} />
        <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: 11 }}>{msg}</span>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex flex-col">
      {/* Back button */}
      <div className="px-6 py-6">
        {(allowBack || (mode === "signup" && signupStep === 2)) && (
          <button
            onClick={() => {
              if (mode === "signup" && signupStep === 2) {
                setSignupStep(1);
              } else {
                onBack();
              }
            }}
            className="flex items-center gap-2 text-[#7a7890] hover:text-[#f0ede8] transition-colors"
          >
            <ArrowLeft size={16} />
            <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: 14 }}>Volver</span>
          </button>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center px-6 py-8">
        <div className="w-full max-w-md">
          
          {mode === "login" && (
            <>
              {/* Logo */}
              <RentEcLogo className="mb-10" />

              {/* Heading */}
              <div className="mb-8">
                <div className="flex items-center gap-2 mb-3">
                  <div className="h-px w-6 bg-[#c9a84c]" />
                  <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: 11, color: "#c9a84c", letterSpacing: "0.2em", fontWeight: 500 }}>
                    ACCESO
                  </span>
                </div>
                <h1 style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, fontSize: "clamp(1.8rem, 4vw, 2.5rem)", color: "#f0ede8", lineHeight: 1.15 }}>
                  Bienvenido de <span style={{ color: "#c9a84c", fontStyle: "italic" }}>nuevo</span>
                </h1>
                <p style={{ fontFamily: "'Outfit', sans-serif", fontSize: 15, color: "#7a7890", lineHeight: 1.6 }} className="mt-2">
                  Inicia sesión para acceder a tus reservas y beneficios exclusivos.
                </p>
              </div>

              {/* Form */}
              <div className="space-y-4 mb-2">
                <div>
                  <label style={{ fontFamily: "'Outfit', sans-serif", fontSize: 11, color: "#7a7890", letterSpacing: "0.1em", fontWeight: 500 }} className="block mb-1.5">
                    CORREO ELECTRÓNICO
                  </label>
                  <div className={`flex items-center gap-3 bg-[#1a1a24] border rounded-xl px-4 py-3.5 transition-colors ${errors.email ? "border-[#d4183d]" : "border-[#1a1a24] focus-within:border-[#c9a84c]/50"}`}>
                    <Mail size={15} color={errors.email ? "#d4183d" : "#7a7890"} />
                    <input type="email" value={email} onChange={(e) => { setEmail(e.target.value); setErrors({...errors, email: ""}); }} placeholder="tu@correo.com" className="bg-transparent flex-1 outline-none placeholder-[#3a3a50]" style={{ fontFamily: "'Outfit', sans-serif", fontSize: 14, color: "#f0ede8" }} />
                  </div>
                  <InputError msg={errors.email} />
                </div>
                <div>
                  <label style={{ fontFamily: "'Outfit', sans-serif", fontSize: 11, color: "#7a7890", letterSpacing: "0.1em", fontWeight: 500 }} className="block mb-1.5">
                    CONTRASEÑA
                  </label>
                  <div className={`flex items-center gap-3 bg-[#1a1a24] border rounded-xl px-4 py-3.5 transition-colors ${errors.password ? "border-[#d4183d]" : "border-[#1a1a24] focus-within:border-[#c9a84c]/50"}`}>
                    <Lock size={15} color={errors.password ? "#d4183d" : "#7a7890"} />
                    <input type={showPassword ? "text" : "password"} value={password} onChange={(e) => { setPassword(e.target.value); setErrors({...errors, password: ""}); }} placeholder="••••••••" className="bg-transparent flex-1 outline-none placeholder-[#3a3a50]" style={{ fontFamily: "'Outfit', sans-serif", fontSize: 14, color: "#f0ede8" }} />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="text-[#7a7890] hover:text-[#f0ede8] transition-colors">
                      {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                  <InputError msg={errors.password} />
                </div>
                <div className="flex justify-between items-center">
                  <button style={{ fontFamily: "'Outfit', sans-serif", fontSize: 13, color: "#c9a84c" }} className="hover:underline underline-offset-2 transition-all">
                    ¿Olvidaste tu contraseña?
                  </button>
                </div>
              </div>

              {/* Login button */}
              <button onClick={handleAction} className="w-full bg-[#c9a84c] hover:bg-[#d4b860] rounded-xl py-4 mt-4 transition-all hover:scale-[1.01] active:scale-[0.99]" style={{ fontFamily: "'Outfit', sans-serif", fontSize: 14, fontWeight: 600, color: "#0a0a0f", letterSpacing: "0.08em" }}>
                INICIAR SESIÓN
              </button>

              {/* Divider */}
              <div className="flex items-center gap-4 my-7">
                <div className="flex-1 h-px bg-[#c9a84c]/12" />
                <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: 12, color: "#7a7890" }}>o continúa con</span>
                <div className="flex-1 h-px bg-[#c9a84c]/12" />
              </div>

              {/* Social logins */}
              <div className="flex flex-col gap-3">
                <button className="w-full flex items-center gap-4 bg-[#12121a] border border-[#c9a84c]/12 hover:border-[#c9a84c]/40 hover:bg-[#1a1a24] rounded-xl px-5 py-3.5 transition-all group">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                  <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: 14, color: "#f0ede8" }}>Continuar con Google</span>
                </button>
              </div>

              {/* Sign up toggle */}
              <p style={{ fontFamily: "'Outfit', sans-serif", fontSize: 13, color: "#7a7890" }} className="text-center mt-8">
                ¿No tienes cuenta?{" "}
                <button onClick={() => { setMode("signup"); setSignupStep(1); setErrors({}); }} style={{ color: "#c9a84c" }} className="hover:underline underline-offset-2">
                  Regístrate gratis
                </button>
              </p>
            </>
          )}

          {mode === "signup" && (
            <>
              {/* Heading */}
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <div className="h-px w-6 bg-[#c9a84c]" />
                  <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: 11, color: "#c9a84c", letterSpacing: "0.2em", fontWeight: 500 }}>
                    PASO {signupStep} DE 2
                  </span>
                </div>
                <h1 style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, fontSize: "clamp(1.8rem, 4vw, 2.5rem)", color: "#f0ede8", lineHeight: 1.15 }}>
                  {signupStep === 1 ? "Crea tu cuenta" : "Seguridad de tu cuenta"}
                </h1>
                <p style={{ fontFamily: "'Outfit', sans-serif", fontSize: 15, color: "#7a7890", lineHeight: 1.6 }} className="mt-2">
                  {signupStep === 1 ? "Únete a más de 1.200 clientes satisfechos" : "Crea una contraseña segura"}
                </p>
                
                {/* Progress bar */}
                <div className="flex gap-2 mb-8 mt-6">
                  <div className={`flex-1 h-1 rounded-full transition-colors duration-300 ${signupStep >= 1 ? "bg-[#c9a84c]" : "bg-[#1a1a24]"}`} />
                  <div className={`flex-1 h-1 rounded-full transition-colors duration-300 ${signupStep >= 2 ? "bg-[#c9a84c]" : "bg-[#1a1a24]"}`} />
                </div>
              </div>

              {/* Form Step 1 */}
              {signupStep === 1 && (
                <div className="space-y-4 mb-2">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label style={{ fontFamily: "'Outfit', sans-serif", fontSize: 11, color: "#7a7890", letterSpacing: "0.1em", fontWeight: 500 }} className="block mb-1.5">
                        NOMBRE
                      </label>
                      <div className={`flex items-center gap-3 bg-[#1a1a24] border rounded-xl px-4 py-3.5 transition-colors ${errors.name ? "border-[#d4183d]" : "border-[#1a1a24] focus-within:border-[#c9a84c]/50"}`}>
                        <User size={15} color={errors.name ? "#d4183d" : "#7a7890"} />
                        <input type="text" value={name} onChange={(e) => { setName(e.target.value); setErrors({...errors, name: ""}); }} placeholder="Carlos" className="bg-transparent flex-1 outline-none placeholder-[#3a3a50] w-full" style={{ fontFamily: "'Outfit', sans-serif", fontSize: 14, color: "#f0ede8" }} />
                      </div>
                      <InputError msg={errors.name} />
                    </div>
                    <div>
                      <label style={{ fontFamily: "'Outfit', sans-serif", fontSize: 11, color: "#7a7890", letterSpacing: "0.1em", fontWeight: 500 }} className="block mb-1.5">
                        APELLIDO
                      </label>
                      <div className={`flex items-center gap-3 bg-[#1a1a24] border rounded-xl px-4 py-3.5 transition-colors ${errors.lastName ? "border-[#d4183d]" : "border-[#1a1a24] focus-within:border-[#c9a84c]/50"}`}>
                        <User size={15} color={errors.lastName ? "#d4183d" : "#7a7890"} />
                        <input type="text" value={lastName} onChange={(e) => { setLastName(e.target.value); setErrors({...errors, lastName: ""}); }} placeholder="García" className="bg-transparent flex-1 outline-none placeholder-[#3a3a50] w-full" style={{ fontFamily: "'Outfit', sans-serif", fontSize: 14, color: "#f0ede8" }} />
                      </div>
                      <InputError msg={errors.lastName} />
                    </div>
                  </div>

                  <div>
                    <label style={{ fontFamily: "'Outfit', sans-serif", fontSize: 11, color: "#7a7890", letterSpacing: "0.1em", fontWeight: 500 }} className="block mb-1.5">
                      CORREO ELECTRÓNICO
                    </label>
                    <div className={`flex items-center gap-3 bg-[#1a1a24] border rounded-xl px-4 py-3.5 transition-colors ${errors.email ? "border-[#d4183d]" : "border-[#1a1a24] focus-within:border-[#c9a84c]/50"}`}>
                      <Mail size={15} color={errors.email ? "#d4183d" : "#7a7890"} />
                      <input type="email" value={email} onChange={(e) => { setEmail(e.target.value); setErrors({...errors, email: ""}); }} placeholder="carlos@email.com" className="bg-transparent flex-1 outline-none placeholder-[#3a3a50]" style={{ fontFamily: "'Outfit', sans-serif", fontSize: 14, color: "#f0ede8" }} />
                    </div>
                    <InputError msg={errors.email} />
                  </div>

                  <div>
                    <label style={{ fontFamily: "'Outfit', sans-serif", fontSize: 11, color: "#7a7890", letterSpacing: "0.1em", fontWeight: 500 }} className="block mb-1.5">
                      TELÉFONO
                    </label>
                    <div className={`flex items-center gap-3 bg-[#1a1a24] border rounded-xl px-4 py-3.5 transition-colors ${errors.phone ? "border-[#d4183d]" : "border-[#1a1a24] focus-within:border-[#c9a84c]/50"}`}>
                      <Phone size={15} color={errors.phone ? "#d4183d" : "#7a7890"} />
                      <input type="tel" value={phone} onChange={(e) => { setPhone(e.target.value); setErrors({...errors, phone: ""}); }} placeholder="+593 99 123 4567" className="bg-transparent flex-1 outline-none placeholder-[#3a3a50]" style={{ fontFamily: "'Outfit', sans-serif", fontSize: 14, color: "#f0ede8" }} />
                    </div>
                    <InputError msg={errors.phone} />
                  </div>

                  <div>
                    <label style={{ fontFamily: "'Outfit', sans-serif", fontSize: 11, color: "#7a7890", letterSpacing: "0.1em", fontWeight: 500 }} className="block mb-1.5">
                      CIUDAD
                    </label>
                    <div className={`flex items-center gap-3 bg-[#1a1a24] border rounded-xl px-4 py-3.5 transition-colors ${errors.city ? "border-[#d4183d]" : "border-[#1a1a24] focus-within:border-[#c9a84c]/50"}`}>
                      <MapPin size={15} color={errors.city ? "#d4183d" : "#7a7890"} />
                      <input list="ecuador-cities-signup" type="text" value={city} onChange={(e) => { setCity(e.target.value); setErrors({...errors, city: ""}); }} placeholder="Escribe para buscar, ej. Manta" autoComplete="off" className="bg-transparent flex-1 outline-none placeholder-[#3a3a50]" style={{ fontFamily: "'Outfit', sans-serif", fontSize: 14, color: "#f0ede8" }} />
                      <datalist id="ecuador-cities-signup">
                        {ECUADOR_CITIES.map((ecuadorCity) => <option key={ecuadorCity} value={ecuadorCity} />)}
                      </datalist>
                    </div>
                    <InputError msg={errors.city} />
                  </div>
                </div>
              )}

              {/* Form Step 2 */}
              {signupStep === 2 && (
                <div className="space-y-4 mb-2">
                  <div>
                    <label style={{ fontFamily: "'Outfit', sans-serif", fontSize: 11, color: "#7a7890", letterSpacing: "0.1em", fontWeight: 500 }} className="block mb-1.5">
                      CONTRASEÑA
                    </label>
                    <div className={`flex items-center gap-3 bg-[#1a1a24] border rounded-xl px-4 py-3.5 transition-colors ${errors.password ? "border-[#d4183d]" : "border-[#1a1a24] focus-within:border-[#c9a84c]/50"}`}>
                      <Lock size={15} color={errors.password ? "#d4183d" : "#7a7890"} />
                      <input type={showPassword ? "text" : "password"} value={password} onChange={(e) => { setPassword(e.target.value); setErrors({...errors, password: ""}); }} placeholder="••••••••" className="bg-transparent flex-1 outline-none placeholder-[#3a3a50]" style={{ fontFamily: "'Outfit', sans-serif", fontSize: 14, color: "#f0ede8" }} />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="text-[#7a7890] hover:text-[#f0ede8] transition-colors">
                        {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                    </div>
                    <InputError msg={errors.password} />
                  </div>
                  <div>
                    <label style={{ fontFamily: "'Outfit', sans-serif", fontSize: 11, color: "#7a7890", letterSpacing: "0.1em", fontWeight: 500 }} className="block mb-1.5">
                      CONFIRMAR CONTRASEÑA
                    </label>
                    <div className={`flex items-center gap-3 bg-[#1a1a24] border rounded-xl px-4 py-3.5 transition-colors ${errors.confirmPassword ? "border-[#d4183d]" : "border-[#1a1a24] focus-within:border-[#c9a84c]/50"}`}>
                      <Lock size={15} color={errors.confirmPassword ? "#d4183d" : "#7a7890"} />
                      <input type={showPassword ? "text" : "password"} value={confirmPassword} onChange={(e) => { setConfirmPassword(e.target.value); setErrors({...errors, confirmPassword: ""}); }} placeholder="••••••••" className="bg-transparent flex-1 outline-none placeholder-[#3a3a50]" style={{ fontFamily: "'Outfit', sans-serif", fontSize: 14, color: "#f0ede8" }} />
                    </div>
                    <InputError msg={errors.confirmPassword} />
                  </div>
                </div>
              )}

              {/* Continue / Register button */}
              <button onClick={handleAction} className="w-full bg-[#c9a84c] hover:bg-[#d4b860] rounded-xl py-4 mt-6 transition-all hover:scale-[1.01] active:scale-[0.99]" style={{ fontFamily: "'Outfit', sans-serif", fontSize: 14, fontWeight: 600, color: "#0a0a0f", letterSpacing: "0.08em" }}>
                {signupStep === 1 ? "CONTINUAR" : "REGISTRARSE"}
              </button>

              {/* Login toggle */}
              <p style={{ fontFamily: "'Outfit', sans-serif", fontSize: 13, color: "#7a7890" }} className="text-center mt-8">
                ¿Ya tienes cuenta?{" "}
                <button onClick={() => { setMode("login"); setErrors({}); }} style={{ color: "#c9a84c" }} className="hover:underline underline-offset-2">
                  Inicia sesión
                </button>
              </p>
            </>
          )}

        </div>
      </div>
    </div>
  );
}
