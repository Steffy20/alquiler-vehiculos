import { useEffect, useState } from "react";
import { ArrowLeft, CheckCircle, MapPin, Calendar, Shield, CreditCard, User, ChevronRight, Star, Fuel, Users, Settings, Check, Plus } from "lucide-react";
import { loadFromStorage, saveToStorage, removeFromStorage } from "../utils/storage";
import { BRANCH_CITIES, createBranchInventory, type BranchCity, type BranchInventory } from "../utils/branches";

const BOOKING_DRAFT_KEY = "renta_booking_draft";
const IVA_RATE = 0.15;
const extras = [
  { id: "gps", name: "GPS Premium", desc: "Navegación offline y actualizaciones en tiempo real", price: 8 },
  { id: "child", name: "Silla infantil", desc: "Homologada, grupo 0-36 kg", price: 12 },
  { id: "insurance", name: "Seguro Full Cover", desc: "Sin franquicia, cobertura total", price: 25 },
  { id: "driver", name: "Conductor adicional", desc: "Añade un segundo conductor", price: 15 },
];

const steps = ["Vehículo", "Extras", "Datos", "Pago", "Confirmación"];

const toInputDate = (date: Date) => {
  const copy = new Date(date);
  copy.setMinutes(copy.getMinutes() - copy.getTimezoneOffset());
  return copy.toISOString().slice(0, 10);
};

const addDays = (date: Date, days: number) => {
  const copy = new Date(date);
  copy.setDate(copy.getDate() + days);
  return copy;
};

const todayInput = () => toInputDate(new Date());
const tomorrowInput = () => toInputDate(addDays(new Date(), 1));

const formatDisplayDate = (value: string) => {
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  return new Intl.DateTimeFormat("es-EC", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
};

const getPickupDate = () => {
  return formatDisplayDate(todayInput());
};

const getDropoffDate = (durationDays: number) => {
  const pickupDate = new Date();
  const dropoffDate = addDays(pickupDate, durationDays);
  return formatDisplayDate(toInputDate(dropoffDate));
};

interface Vehicle {
  id: number;
  name: string;
  category: string;
  price: number;
  rating: number;
  reviews: number;
  seats: number;
  fuel: string;
  transmission: string;
  img: string;
  selectedCity?: BranchCity;
  branches?: BranchInventory;
}

interface BookingScreenProps {
  vehicle: Vehicle;
  userRole: "admin" | "secretary" | "client";
  userName?: string;
  userEmail?: string;
  userPhone?: string;
  onBack: () => void;
  onConfirm: (data: any) => void;
  onAddAnother?: (data: any) => void;
  cartCount?: number;
}

export function BookingScreen({ vehicle, userRole, userName, userEmail, userPhone, onBack, onConfirm, onAddAnother, cartCount = 0 }: BookingScreenProps) {
  const branchInventory = vehicle.branches || createBranchInventory(0, 0);
  const draft = loadFromStorage<{
    selectedExtras: string[];
    durationValue: number;
    pickupDate: string;
    dropoffDate: string;
    name: string;
    email: string;
    phone: string;
    cardNumber: string;
    expiry: string;
    cvv: string;
    city?: BranchCity;
  }>(BOOKING_DRAFT_KEY, {
    selectedExtras: [],
    durationValue: 5,
    pickupDate: todayInput(),
    dropoffDate: tomorrowInput(),
    name: "",
    email: "",
    phone: "",
    cardNumber: "",
    expiry: "",
    cvv: "",
  });

  const [step, setStep] = useState(0);
  const [selectedClient, setSelectedClient] = useState<string>("");
  const [registeredClients, setRegisteredClients] = useState<{ email: string; name: string; phone: string; city: string }[]>([]);
  const [selectedExtras, setSelectedExtras] = useState<string[]>(draft.selectedExtras);
  const [durationValue, setDurationValue] = useState(Math.max(1, draft.durationValue || 5));
  const storedEmail = loadFromStorage<string>("renta_userEmail", "");
  const storedPhone = loadFromStorage<string>("renta_userPhone", "");
  const [name, setName] = useState(userName || draft.name);
  const [email, setEmail] = useState(userEmail || storedEmail || draft.email);
  const [phone, setPhone] = useState(userPhone || storedPhone || draft.phone);
  const [cardNumber, setCardNumber] = useState(draft.cardNumber);
  const [expiry, setExpiry] = useState(draft.expiry);
  const [cvv, setCvv] = useState(draft.cvv);
  const firstAvailableCity = BRANCH_CITIES.find((city) => branchInventory[city].stock - branchInventory[city].occupied > 0);
  const initialCity = draft.city && branchInventory[draft.city].stock - branchInventory[draft.city].occupied > 0
    ? draft.city
    : vehicle.selectedCity && branchInventory[vehicle.selectedCity].stock - branchInventory[vehicle.selectedCity].occupied > 0
      ? vehicle.selectedCity
      : firstAvailableCity || "Manta";
  const [branchCity, setBranchCity] = useState<BranchCity>(initialCity);

  useEffect(() => {
    const users = loadFromStorage<Record<string, any>>("renta_users", {});
    const clients = Object.entries(users)
      .filter(([, user]) => user.role === "client")
      .map(([email, user]) => ({ email, name: user.name, phone: user.phone, city: user.city }));
    setRegisteredClients(clients);
  }, []);

  useEffect(() => {
    if (userName) {
      setName(userName);
    }
    if (userEmail) {
      setEmail(userEmail);
    }
    if (userPhone) {
      setPhone(userPhone);
    } else if (userEmail) {
      const users = loadFromStorage<Record<string, any>>("renta_users", {});
      const currentUser = users[userEmail];
      if (currentUser?.phone) {
        setPhone(currentUser.phone);
      }
    }
  }, [userName, userEmail, userPhone]);

  useEffect(() => {
    saveToStorage(BOOKING_DRAFT_KEY, {
      selectedExtras,
      durationValue,
      name,
      email,
      phone,
      cardNumber,
      expiry,
      cvv,
      city: branchCity,
    });
  }, [selectedExtras, durationValue, name, email, phone, cardNumber, expiry, cvv, branchCity]);

  const rate = vehicle.price;
  const pickupDate = getPickupDate();
  const dropoffDate = getDropoffDate(durationValue);
  const extrasTotal = extras.filter((e) => selectedExtras.includes(e.id)).reduce((sum, e) => {
    return sum + e.price * durationValue;
  }, 0);
  const baseTotal = Number((rate * durationValue).toFixed(2));
  const subtotal = Number((baseTotal + extrasTotal).toFixed(2));
  const iva = Number((subtotal * IVA_RATE).toFixed(2));
  const total = Number((subtotal + iva).toFixed(2));
  const durationSummary = `${durationValue} ${durationValue === 1 ? "día" : "días"}`;
  const unitLabel = "día";

  const toggleExtra = (id: string) =>
    setSelectedExtras((prev) => (prev.includes(id) ? prev.filter((e) => e !== id) : [...prev, id]));

  const buildBookingItem = () => ({
    vehicle: vehicle.name,
    category: vehicle.category,
    subtotal,
    iva,
    total,
    days: durationValue,
    durationValue,
    durationSummary,
    img: vehicle.img,
    location: `Centro de ${branchCity}`,
    city: branchCity,
    pickup: pickupDate,
    dropoff: dropoffDate,
    cardNumber,
    selectedExtras,
    clientName: name,
    clientEmail: email,
    clientPhone: phone,
    selectedClient,
    userRole,
  });

  const nextStep = () => {
    if (step < steps.length - 1) setStep(step + 1);
    if (step === steps.length - 2) {
      onConfirm(buildBookingItem());
      removeFromStorage(BOOKING_DRAFT_KEY);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] px-6 py-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={onBack}
          className="w-10 h-10 rounded-full border border-[#c9a84c]/20 flex items-center justify-center hover:border-[#c9a84c]/60 hover:bg-[#c9a84c]/5 transition-colors"
        >
          <ArrowLeft size={16} color="#f0ede8" />
        </button>
        <div>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, fontSize: 28, color: "#f0ede8" }}>
            Reserva tu vehículo
          </h2>
          <p style={{ fontFamily: "'Outfit', sans-serif", fontSize: 14, color: "#7a7890" }}>
            {vehicle.name} · {durationSummary} · Manta
          </p>
        </div>
      </div>

      {/* Progress */}
      <div className="flex items-center gap-0 mb-10">
        {steps.map((s, i) => (
          <div key={s} className="flex items-center">
            <div className="flex flex-col items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                  i < step
                    ? "bg-[#c9a84c] text-[#0a0a0f]"
                    : i === step
                    ? "bg-[#c9a84c]/20 border border-[#c9a84c] text-[#c9a84c]"
                    : "bg-[#1a1a24] border border-[#c9a84c]/15 text-[#7a7890]"
                }`}
              >
                {i < step ? (
                  <Check size={14} />
                ) : (
                  <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12 }}>{i + 1}</span>
                )}
              </div>
              <span
                style={{ fontFamily: "'Outfit', sans-serif", fontSize: 11, color: i === step ? "#c9a84c" : "#7a7890", whiteSpace: "nowrap" }}
                className="mt-1 hidden md:block"
              >
                {s}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div className={`h-px w-12 md:w-20 mx-2 mb-4 ${i < step ? "bg-[#c9a84c]" : "bg-[#c9a84c]/15"}`} />
            )}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main form */}
        <div className="lg:col-span-2">
          {/* Step 0: Vehicle summary */}
          {step === 0 && (
            <div className="bg-[#12121a] border border-[#c9a84c]/15 rounded-2xl overflow-hidden">
              <div className="relative h-64">
                <img src={vehicle.img} alt={vehicle.name} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#12121a] to-transparent" />
                <div className="absolute bottom-4 left-5">
                  <span className="bg-[#c9a84c]/15 border border-[#c9a84c]/30 px-3 py-1 rounded-full" style={{ fontFamily: "'Outfit', sans-serif", fontSize: 11, color: "#c9a84c" }}>
                    {vehicle.category}
                  </span>
                </div>
              </div>
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 24, fontWeight: 600, color: "#f0ede8" }}>{vehicle.name}</h3>
                    <div className="flex items-center gap-1 mt-1">
                      <Star size={13} fill="#c9a84c" color="#c9a84c" />
                      <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 13, color: "#c9a84c" }}>{vehicle.rating}</span>
                      <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: 13, color: "#7a7890" }}>({vehicle.reviews} reseñas)</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, fontWeight: 700, color: "#c9a84c" }}>${vehicle.price}</div>
                    <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 12, color: "#7a7890" }}>/ día</div>
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-4 mb-6">
                  <div className="bg-[#111118] border border-[#c9a84c]/10 rounded-3xl p-5">
                    <div className="mb-4">
                      <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 12, color: "#7a7890", letterSpacing: "0.12em" }}>
                        DURACIÓN
                      </div>
                      <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 14, fontWeight: 600, color: "#f0ede8" }}>
                        {durationSummary}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <input
                        type="number"
                        min={1}
                        step={1}
                        value={durationValue}
                        onChange={(e) => setDurationValue(Math.max(1, Number(e.target.value) || 1))}
                        className="w-28 bg-[#1a1a24] border border-[#c9a84c]/15 rounded-2xl px-4 py-3 text-[#f0ede8] outline-none"
                        style={{ fontFamily: "'Outfit', sans-serif", fontSize: 14 }}
                      />
                      <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: 14, color: "#7a7890" }}>
                        Selecciona cuántos días necesitas el auto
                      </span>
                    </div>
                  </div>
                  <div className="bg-[#111118] border border-[#c9a84c]/10 rounded-3xl p-5">
                    <div className="mb-4">
                      <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 12, color: "#7a7890", letterSpacing: "0.12em" }}>SUCURSAL DE RETIRO</div>
                      <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 14, fontWeight: 600, color: "#f0ede8" }}>Selecciona la ciudad</div>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {BRANCH_CITIES.map((city) => {
                        const availableUnits = Math.max(0, branchInventory[city].stock - branchInventory[city].occupied);
                        const disabled = availableUnits === 0;
                        return (
                          <button key={city} type="button" disabled={disabled} onClick={() => setBranchCity(city)} className={`rounded-xl border px-3 py-3 text-left transition-all ${branchCity === city ? "bg-[#c9a84c]/15 border-[#c9a84c]" : disabled ? "bg-[#1a1a24]/40 border-[#2a2a35] opacity-45 cursor-not-allowed" : "bg-[#1a1a24] border-[#c9a84c]/15 hover:border-[#c9a84c]/50"}`}>
                            <div style={{ color: disabled ? "#7a7890" : "#f0ede8", fontSize: 13, fontWeight: 600 }}>{city}</div>
                            <div style={{ color: availableUnits > 0 ? "#22c55e" : "#d4183d", fontSize: 11, marginTop: 3 }}>Disponibles: {availableUnits}</div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
                <div className="flex gap-6 border-t border-[#c9a84c]/10 pt-4">
                  {[
                    { icon: Users, text: `${vehicle.seats} plazas` },
                    { icon: Fuel, text: vehicle.fuel },
                    { icon: Settings, text: vehicle.transmission },
                    { icon: MapPin, text: `Centro de ${branchCity}` },
                  ].map(({ icon: Icon, text }) => (
                    <div key={text} className="flex items-center gap-2">
                      <Icon size={14} color="#7a7890" />
                      <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: 13, color: "#7a7890" }}>{text}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 1: Extras */}
          {step === 1 && (
            <div>
              <h3 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 18, fontWeight: 600, color: "#f0ede8" }} className="mb-4">
                Personaliza tu viaje
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {extras.map((extra) => (
                  <button
                    key={extra.id}
                    onClick={() => toggleExtra(extra.id)}
                    className={`p-5 rounded-2xl border text-left transition-all ${
                      selectedExtras.includes(extra.id)
                        ? "bg-[#c9a84c]/10 border-[#c9a84c]/50"
                        : "bg-[#12121a] border-[#c9a84c]/15 hover:border-[#c9a84c]/35"
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: 15, fontWeight: 600, color: "#f0ede8" }}>
                        {extra.name}
                      </span>
                      <div
                        className={`w-5 h-5 rounded-full border flex items-center justify-center flex-shrink-0 ${
                          selectedExtras.includes(extra.id) ? "bg-[#c9a84c] border-[#c9a84c]" : "border-[#c9a84c]/30"
                        }`}
                      >
                        {selectedExtras.includes(extra.id) && <Check size={11} color="#0a0a0f" />}
                      </div>
                    </div>
                    <p style={{ fontFamily: "'Outfit', sans-serif", fontSize: 13, color: "#7a7890" }} className="mb-3">{extra.desc}</p>
                    <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 14, color: "#c9a84c" }}>
                      +${extra.price}/día
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Personal data */}
          {step === 2 && (
            <div>
              <h3 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 18, fontWeight: 600, color: "#f0ede8" }} className="mb-4">
                Tus datos personales
              </h3>
              <div className="bg-[#12121a] border border-[#c9a84c]/15 rounded-2xl p-6 space-y-5">
                {userRole === "secretary" && (
                  <div>
                    <label style={{ fontFamily: "'Outfit', sans-serif", fontSize: 11, color: "#7a7890", letterSpacing: "0.1em" }} className="block mb-1.5">
                      SELECCIONAR CLIENTE REGISTRADO
                    </label>
                    <div className="bg-[#1a1a24] border border-[#c9a84c]/15 rounded-xl px-4 py-3">
                      <select
                        value={selectedClient}
                        onChange={(e) => {
                          const selected = e.target.value;
                          setSelectedClient(selected);
                          const client = registeredClients.find((c) => c.email === selected);
                          if (client) {
                            setName(client.name);
                            setEmail(client.email);
                            setPhone(client.phone);
                          }
                        }}
                        className="w-full bg-[#1a1a24] outline-none text-[#f0ede8] cursor-pointer"
                        style={{ fontFamily: "'Outfit', sans-serif", fontSize: 14, colorScheme: "dark" }}
                      >
                        <option value="" style={{ backgroundColor: "#1a1a24", color: "#a09daf" }}>Selecciona un cliente</option>
                        {registeredClients.map((client) => (
                          <option key={client.email} value={client.email} style={{ backgroundColor: "#1a1a24", color: "#f0ede8" }}>
                            {client.name} · {client.email}
                          </option>
                        ))}
                      </select>
                    </div>
                    {selectedClient && (
                      <div className="mt-2 px-3 py-2 rounded-lg bg-[#c9a84c]/8 border border-[#c9a84c]/20">
                        <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: 12, color: "#7a7890" }}>Cliente seleccionado: </span>
                        <strong style={{ fontFamily: "'Outfit', sans-serif", fontSize: 13, color: "#f0ede8" }}>{name}</strong>
                      </div>
                    )}
                  </div>
                )}
                {[
                  { label: "NOMBRE COMPLETO", icon: User, value: name, set: setName, placeholder: "Carlos García López", type: "text" },
                  { label: "CORREO ELECTRÓNICO", icon: Shield, value: email, set: setEmail, placeholder: "carlos123@gmail.com", type: "email" },
                  { label: "TELÉFONO", icon: MapPin, value: phone, set: setPhone, placeholder: "+593 912 345 678", type: "tel" },
                ].map(({ label, icon: Icon, value, set, placeholder, type }) => (
                  <div key={label}>
                    <label style={{ fontFamily: "'Outfit', sans-serif", fontSize: 11, color: "#7a7890", letterSpacing: "0.1em" }} className="block mb-1.5">{label}</label>
                    <div className="flex items-center gap-3 bg-[#1a1a24] border border-[#c9a84c]/15 rounded-xl px-4 py-3 focus-within:border-[#c9a84c]/50 transition-colors">
                      <Icon size={15} color="#7a7890" />
                      <input
                        type={type}
                        value={value}
                        onChange={(e) => set(e.target.value)}
                        placeholder={placeholder}
                        className="bg-transparent flex-1 outline-none placeholder-[#3a3a50]"
                        style={{ fontFamily: "'Outfit', sans-serif", fontSize: 14, color: "#f0ede8" }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Step 3: Payment */}
          {step === 3 && (
            <div>
              <h3 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 18, fontWeight: 600, color: "#f0ede8" }} className="mb-4">
                Método de pago
              </h3>
              <div className="bg-[#12121a] border border-[#c9a84c]/15 rounded-2xl p-6 space-y-5">
                <div className="flex gap-3 mb-2">
                  {["Tarjeta", "PayPal", "Bizum"].map((m) => (
                    <button key={m} className={`px-4 py-2 rounded-xl border text-sm transition-colors ${m === "Tarjeta" ? "bg-[#c9a84c]/10 border-[#c9a84c]/50 text-[#c9a84c]" : "border-[#c9a84c]/15 text-[#7a7890] hover:border-[#c9a84c]/35"}`}
                      style={{ fontFamily: "'Outfit', sans-serif", fontSize: 13 }}>
                      {m}
                    </button>
                  ))}
                </div>
                {[
                  { label: "NÚMERO DE TARJETA", icon: CreditCard, value: cardNumber, set: setCardNumber, placeholder: "1234 5678 9012 3456" },
                ].map(({ label, icon: Icon, value, set, placeholder }) => (
                  <div key={label}>
                    <label style={{ fontFamily: "'Outfit', sans-serif", fontSize: 11, color: "#7a7890", letterSpacing: "0.1em" }} className="block mb-1.5">{label}</label>
                    <div className="flex items-center gap-3 bg-[#1a1a24] border border-[#c9a84c]/15 rounded-xl px-4 py-3 focus-within:border-[#c9a84c]/50 transition-colors">
                      <Icon size={15} color="#7a7890" />
                      <input type="text" value={value} onChange={(e) => set(e.target.value)} placeholder={placeholder}
                        className="bg-transparent flex-1 outline-none placeholder-[#3a3a50]"
                        style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 14, color: "#f0ede8" }} />
                    </div>
                  </div>
                ))}
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { label: "VENCIMIENTO", value: expiry, set: setExpiry, placeholder: "MM/AA" },
                    { label: "CVV", value: cvv, set: setCvv, placeholder: "•••" },
                  ].map(({ label, value, set, placeholder }) => (
                    <div key={label}>
                      <label style={{ fontFamily: "'Outfit', sans-serif", fontSize: 11, color: "#7a7890", letterSpacing: "0.1em" }} className="block mb-1.5">{label}</label>
                      <input type="text" value={value} onChange={(e) => set(e.target.value)} placeholder={placeholder}
                        className="w-full bg-[#1a1a24] border border-[#c9a84c]/15 rounded-xl px-4 py-3 outline-none focus:border-[#c9a84c]/50 placeholder-[#3a3a50] transition-colors"
                        style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 14, color: "#f0ede8" }} />
                    </div>
                  ))}
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <Shield size={14} color="#c9a84c" />
                  <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: 12, color: "#7a7890" }}>Pago seguro con cifrado SSL 256-bit</span>
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Confirmation */}
          {step === 4 && (
            <div className="text-center py-12">
              <div className="w-20 h-20 bg-[#c9a84c]/15 border border-[#c9a84c]/30 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle size={40} color="#c9a84c" />
              </div>
              <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, fontWeight: 700, color: "#f0ede8" }} className="mb-3">
                ¡Reserva confirmada!
              </h3>
              <p style={{ fontFamily: "'Outfit', sans-serif", fontSize: 15, color: "#7a7890" }} className="mb-2">
                Tu {vehicle.name} te espera el {pickupDate} en el Centro de {branchCity}
              </p>
              <div className="bg-[#12121a] border border-[#c9a84c]/20 rounded-2xl p-5 mt-8 inline-block">
                <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 24, color: "#c9a84c", letterSpacing: "0.2em" }}>
                  #VLC-2026-4891
                </div>
                <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 13, color: "#7a7890" }} className="mt-1">Número de reserva</div>
              </div>
            </div>
          )}

          {/* Next button */}
          {step < 4 && (
            <div className="mt-6 flex flex-col sm:flex-row gap-3">
            {step === 3 && onAddAnother && (
              <button onClick={() => { onAddAnother(buildBookingItem()); removeFromStorage(BOOKING_DRAFT_KEY); }} className="flex-1 flex items-center justify-center gap-2 border border-[#c9a84c]/40 text-[#c9a84c] hover:bg-[#c9a84c]/10 rounded-xl py-4 transition-all" style={{ fontSize: 13, fontWeight: 600 }}>
                <Plus size={16} /> AGREGAR OTRO VEHÍCULO {cartCount > 0 ? `(${cartCount} EN CARRITO)` : ""}
              </button>
            )}
            <button
              onClick={nextStep}
              className="flex-1 flex items-center justify-center gap-2 bg-[#c9a84c] hover:bg-[#d4b860] rounded-xl py-4 transition-all hover:scale-[1.01] active:scale-[0.99]"
              style={{ fontFamily: "'Outfit', sans-serif", fontSize: 14, fontWeight: 600, color: "#0a0a0f", letterSpacing: "0.08em" }}
            >
              {step === 3 ? "CONFIRMAR Y PAGAR" : "CONTINUAR"}
              <ChevronRight size={16} />
            </button>
            </div>
          )}
        </div>

        {/* Summary sidebar */}
        <div>
          <div className="bg-[#12121a] border border-[#c9a84c]/15 rounded-2xl p-5 sticky top-6">
            <h4 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 14, fontWeight: 600, color: "#f0ede8", letterSpacing: "0.05em" }} className="mb-4">
              RESUMEN DE RESERVA
            </h4>
            <div className="space-y-3 mb-5">
              <div className="flex items-center gap-3">
                <Calendar size={14} color="#c9a84c" />
                <div>
                  <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 13, color: "#f0ede8" }}>{pickupDate}</div>
                  <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 12, color: "#7a7890" }}>{durationSummary}</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <MapPin size={14} color="#c9a84c" />
                <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 13, color: "#f0ede8" }}>Centro de {branchCity}</div>
              </div>
            </div>

            <div className="border-t border-[#c9a84c]/10 pt-4 space-y-2">
              <div className="flex justify-between">
                <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: 13, color: "#7a7890" }}>${rate} × {durationValue} {unitLabel}</span>
                <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 13, color: "#f0ede8" }}>${baseTotal}</span>
              </div>
              {extras.filter((e) => selectedExtras.includes(e.id)).map((e) => (
                <div key={e.id} className="flex justify-between">
                  <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: 13, color: "#7a7890" }}>{e.name}</span>
                  <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 13, color: "#f0ede8" }}>+${Number((e.price * durationValue).toFixed(2))}</span>
                </div>
              ))}
              <div className="border-t border-[#c9a84c]/10 pt-3 space-y-2">
                <div className="flex justify-between">
                  <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: 13, color: "#7a7890" }}>Subtotal</span>
                  <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 13, color: "#f0ede8" }}>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: 13, color: "#7a7890" }}>IVA (15%)</span>
                  <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 13, color: "#f0ede8" }}>${iva.toFixed(2)}</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-[#c9a84c]/10">
                <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: 15, fontWeight: 600, color: "#f0ede8" }}>Total</span>
                <span style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 700, color: "#c9a84c" }}>${total.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div className="mt-4 flex items-center gap-2 bg-[#c9a84c]/5 border border-[#c9a84c]/15 rounded-xl p-3">
              <Shield size={14} color="#c9a84c" />
              <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: 12, color: "#7a7890" }}>Cancelación gratuita hasta 24h antes</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
