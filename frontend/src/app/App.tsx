import { useState, useEffect, useRef } from "react";
import { Home, Car, BookOpen, LayoutDashboard, Menu, X, Shield, Download } from "lucide-react";
import { HeroScreen } from "./components/HeroScreen";
import { FleetScreen } from "./components/FleetScreen";
import { BookingScreen } from "./components/BookingScreen";
import { DashboardScreen } from "./components/DashboardScreen";
import { LoginScreen } from "./components/LoginScreen";
import { CompanyScreen } from "./components/CompanyScreen";
import { AboutScreen } from "./components/AboutScreen";
import { DestinationsScreen } from "./components/DestinationsScreen";
import { MyReservationsScreen } from "./components/MyReservationsScreen";
import { loadFromStorage, saveToStorage, removeFromStorage } from "./utils/storage";
import { reservationCancelledTrigger, bookingConfirmedTrigger } from "./utils/trigger";
import { generateInvoice, generateConsolidatedInvoice, downloadInvoicePDF, cancelInvoiceItem, type Invoice } from "./utils/invoiceGenerator";
import { createBranchInventory, inventoryTotals, type BranchCity, type BranchInventory } from "./utils/branches";
import { loadVehicleExtras } from "./utils/vehicleExtras";

const API_BASE_URL = (import.meta.env.VITE_API_URL || "http://localhost:5000").replace(/\/$/, "");

type Screen = "hero" | "fleet" | "bookingCatalog" | "booking" | "myReservations" | "dashboard" | "confirmed" | "login" | "company" | "destinations" | "about";

export type Vehicle = {
  id: number;
  name: string;
  brand: string;
  category: string;
  price: number;
  rating: number;
  reviews: number;
  seats: number;
  fuel: string;
  transmission: string;
  img: string;
  tags: string[];
  available: boolean;
  stock: number;
  occupied: number;
  branches?: BranchInventory;
  selectedCity?: BranchCity;
  isNew?: boolean;
  addedAt?: string;
  disabled?: boolean;
};

export type ActivityLogEntry = {
  id: string;
  timestamp: string;
  actorName: string;
  actorRole: "admin" | "secretary" | "client";
  action: string;
  detail: string;
  category: "reservas" | "usuarios" | "flota" | "sistema";
};

type VehicleInventory = Record<number, Pick<Vehicle, "available" | "stock" | "occupied" | "branches" | "disabled">>;

const BASE_VEHICLES: Vehicle[] = [
  {
    id: 1,
    name: "Mercedes-Benz S-Class",
    brand: "Mercedes-Benz",
    category: "Premium",
    price: 189,
    rating: 4.9,
    reviews: 247,
    seats: 5,
    fuel: "Híbrido",
    transmission: "Automático",
    img: "https://images.unsplash.com/photo-1780147264753-f77944703eb3?w=600&h=400&fit=crop&auto=format",
    tags: ["Climatización", "Masajes", "Pantallas 4K"],
    available: true,
    stock: 5,
    occupied: 0,
  },
  {
    id: 2,
    name: "BMW X7 xDrive",
    brand: "BMW",
    category: "SUV",
    price: 145,
    rating: 4.8,
    reviews: 189,
    seats: 7,
    fuel: "Diésel",
    transmission: "Automático",
    img: "https://images.unsplash.com/photo-1654159866298-e3c8ee93e43b?w=600&h=400&fit=crop&auto=format",
    tags: ["7 plazas", "4x4", "Techo panorámico"],
    available: true,
    stock: 5,
    occupied: 0,
  },
  {
    id: 3,
    name: "Porsche 911 Carrera",
    brand: "Porsche",
    category: "Deportivo",
    price: 320,
    rating: 5.0,
    reviews: 93,
    seats: 2,
    fuel: "Gasolina",
    transmission: "Manual",
    img: "https://images.unsplash.com/photo-1614026480738-d548967fba2b?w=600&h=400&fit=crop&auto=format",
    tags: ["Sport Chrono", "PASM", "520 CV"],
    available: true,
    stock: 5,
    occupied: 0,
  },
  {
    id: 4,
    name: "Tesla Model S Plaid",
    brand: "Tesla",
    category: "Eléctrico",
    price: 210,
    rating: 4.9,
    reviews: 156,
    seats: 5,
    fuel: "Eléctrico",
    transmission: "Automático",
    img: "https://images.unsplash.com/photo-1687992659743-69a6a730ea5b?w=600&h=400&fit=crop&auto=format",
    tags: ["1020 CV", "0-100 en 2.1s", "Autopilot"],
    available: false,
    stock: 5,
    occupied: 0,
  },
  {
    id: 5,
    name: "Range Rover Autobiography",
    brand: "Land Rover",
    category: "SUV",
    price: 275,
    rating: 4.7,
    reviews: 134,
    seats: 5,
    fuel: "Híbrido",
    transmission: "Automático",
    img: "https://images.unsplash.com/photo-1722379528832-fe32d86ec433?w=600&h=400&fit=crop&auto=format",
    tags: ["Techo panorámico", "Meridian", "Piel Nappa"],
    available: true,
    stock: 5,
    occupied: 0,
  },
  {
    id: 6,
    name: "Audi RS e-tron GT",
    brand: "Audi",
    category: "Eléctrico",
    price: 248,
    rating: 4.8,
    reviews: 78,
    seats: 4,
    fuel: "Eléctrico",
    transmission: "Automático",
    img: "https://images.unsplash.com/photo-1687992659809-db04dbcaee2e?w=600&h=400&fit=crop&auto=format",
    tags: ["630 CV", "Matrix LED", "Bang & Olufsen"],
    available: true,
    stock: 5,
    occupied: 0,
  },
];

const navItems = [
  { id: "hero", icon: Home, label: "Inicio" },
  { id: "fleet", icon: Car, label: "Vehiculos" },
  { id: "booking", icon: BookOpen, label: "Reserva" },
  { id: "dashboard", icon: LayoutDashboard, label: "Mi cuenta" },
] as const;

const marketingNavItems = [
  { id: "fleet", label: "Vehículos" },
  { id: "destinations", label: "Destinos" },
  { id: "company", label: "Empresas" },
  { id: "about", label: "Nosotros" },
] as const;

const parseDisplayDate = (value?: string) => {
  const match = value?.toLowerCase().replace(".", "").match(/(\d{1,2})\s+([a-záéíóúñ]+)\s+(\d{4})/i);
  if (!match) return null;

  const months: Record<string, number> = {
    ene: 0,
    feb: 1,
    mar: 2,
    abr: 3,
    may: 4,
    jun: 5,
    jul: 6,
    ago: 7,
    sep: 8,
    sept: 8,
    oct: 9,
    nov: 10,
    dic: 11,
  };
  const month = months[match[2].slice(0, 4)] ?? months[match[2].slice(0, 3)];
  if (month === undefined) return null;

  return new Date(Number(match[3]), month, Number(match[1]));
};

const getReservationStatus = (reservation: any) => {
  if (reservation.status !== "activa") return reservation.status;

  const dropoffDate = parseDisplayDate(reservation.dropoff);
  if (!dropoffDate) return reservation.status;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  dropoffDate.setHours(0, 0, 0, 0);

  return dropoffDate < today ? "finalizada" : "activa";
};

const applyReservationOccupancy = (vehicles: Vehicle[], reservations: any[]) => {
  const occupiedByVehicle = reservations.reduce<Record<number, number>>((counts, reservation) => {
    const status = getReservationStatus(reservation);
    if (typeof reservation.vehicleId === "number" && (status === "activa" || status === "finalizada")) {
      counts[reservation.vehicleId] = (counts[reservation.vehicleId] || 0) + 1;
    }
    return counts;
  }, {});

  return vehicles.map((vehicle) => ({
    ...vehicle,
    occupied: occupiedByVehicle[vehicle.id] || 0,
  }));
};

const normalizeBranches = (vehicle: Vehicle): Vehicle => {
  const branches = vehicle.branches || createBranchInventory(vehicle.stock || 0, vehicle.occupied || 0);
  const totals = inventoryTotals(branches);
  return { ...vehicle, branches, stock: totals.stock, occupied: totals.occupied };
};

const applySavedInventory = (vehicles: Vehicle[], inventory: VehicleInventory) =>
  vehicles.map((vehicle) => {
    const saved = inventory[vehicle.id];
    return normalizeBranches(saved ? { ...vehicle, ...saved } : vehicle);
  });

const getVehicleInventory = (vehicles: Vehicle[]): VehicleInventory =>
  vehicles.reduce<VehicleInventory>((inventory, vehicle) => {
    inventory[vehicle.id] = {
      available: vehicle.available,
      stock: vehicle.stock,
      occupied: vehicle.occupied || 0,
      branches: vehicle.branches,
      disabled: vehicle.disabled,
    };
    return inventory;
  }, {});

const addIvaToLegacyReservation = (reservation: any) => {
  if (typeof reservation.subtotal === "number" && typeof reservation.iva === "number") return reservation;

  const subtotal = Number(reservation.total || 0);
  const iva = Number((subtotal * 0.15).toFixed(2));
  const total = Number((subtotal + iva).toFixed(2));
  const invoice = reservation.invoice
    ? {
        ...reservation.invoice,
        total: Number((Number(reservation.invoice.subtotal || 0) * 1.15).toFixed(2)),
        items: reservation.invoice.items?.map((item: any) => ({
          ...item,
          total: Number((Number(item.subtotal || 0) * 1.15).toFixed(2)),
        })),
      }
    : reservation.invoice;

  return { ...reservation, subtotal, iva, total, invoice };
};

export default function App() {
  const [screen, setScreen] = useState<Screen>("hero");
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle>(BASE_VEHICLES[0]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userName, setUserName] = useState(() => loadFromStorage<string>("renta_userName", ""));
  const [userEmail, setUserEmail] = useState(() => loadFromStorage<string>("renta_userEmail", ""));
  const [userPhone, setUserPhone] = useState(() => loadFromStorage<string>("renta_userPhone", ""));
  const [isAdmin, setIsAdmin] = useState(() => loadFromStorage<boolean>("renta_isAdmin", false));
  const [userRole, setUserRole] = useState<"admin" | "secretary" | "client">(
    () => loadFromStorage<"admin" | "secretary" | "client">("renta_userRole", "client")
  );
  const hasSyncedInitialReservations = useRef(false);

  // Vehicles state — persist custom vehicles in localStorage, merge with base
  const [vehicles, setVehicles] = useState<Vehicle[]>(() => {
    const saved = loadFromStorage<Vehicle[]>("renta_vehicles", []);
    const savedInventory = loadFromStorage<VehicleInventory>("renta_vehicle_inventory", {});
    const adminVehicles = saved.filter((v) => v.id >= 100);
    const savedReservations = loadFromStorage<any[]>("renta_reservations", []);
    const vehiclesWithSavedInventory = applySavedInventory([...BASE_VEHICLES, ...adminVehicles], savedInventory);
    return savedReservations.length > 0
      ? applyReservationOccupancy(vehiclesWithSavedInventory, savedReservations)
      : vehiclesWithSavedInventory;
  });

  const [reservations, setReservations] = useState<any[]>(() =>
    loadFromStorage<any[]>("renta_reservations", []).map(addIvaToLegacyReservation)
  );
  const [bookingCart, setBookingCart] = useState<Array<{ data: any; vehicle: Vehicle }>>([]);
  const [lastBookingId, setLastBookingId] = useState("");
  const [lastBookingDuration, setLastBookingDuration] = useState("");
  const [lastBookingPickup, setLastBookingPickup] = useState("");
  const [lastBookingInvoice, setLastBookingInvoice] = useState<Invoice | null>(null);
  const [lastBookingVehicleCount, setLastBookingVehicleCount] = useState(1);
  const [activityLog, setActivityLog] = useState<ActivityLogEntry[]>(() => loadFromStorage<ActivityLogEntry[]>("renta_activity_log", []));
  const isAuthenticated = userName.trim().length > 0;
  const currentStoredUser = userEmail
    ? loadFromStorage<Record<string, any>>("renta_users", {})[userEmail]
    : null;
  const canManageVehicles =
    isAdmin || (userRole === "secretary" && Boolean(currentStoredUser?.canManageVehicles));
  const requiresAuth = (target: Screen) =>
    target === "booking" || target === "myReservations" || target === "dashboard" || target === "confirmed";

  const goToScreen = (target: Screen) => {
    setMobileMenuOpen(false);
    if (!isAuthenticated && requiresAuth(target)) {
      setScreen("login");
      return;
    }
    setScreen(target);
  };

  const goToNavItem = (target: typeof navItems[number]["id"]) => {
    goToScreen(target === "booking" ? "myReservations" : target);
  };

  const logActivity = (entry: Omit<ActivityLogEntry, "id" | "timestamp" | "actorName" | "actorRole"> & { actorName?: string; actorRole?: ActivityLogEntry["actorRole"] }) => {
    const nextEntry: ActivityLogEntry = {
      id: `ACT-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString(),
      actorName: entry.actorName || userName || "Sistema",
      actorRole: entry.actorRole || userRole,
      action: entry.action,
      detail: entry.detail,
      category: entry.category,
    };
    setActivityLog((prev) => [nextEntry, ...prev].slice(0, 80));
  };

  // Sync to localStorage
  useEffect(() => {
    saveToStorage("renta_userName", userName);
  }, [userName]);

  useEffect(() => {
    saveToStorage("renta_isAdmin", isAdmin);
  }, [isAdmin]);

  useEffect(() => {
    saveToStorage("renta_userRole", userRole);
  }, [userRole]);

  useEffect(() => {
    saveToStorage("renta_userEmail", userEmail);
  }, [userEmail]);

  useEffect(() => {
    saveToStorage("renta_userPhone", userPhone);
  }, [userPhone]);

  useEffect(() => {
    saveToStorage("renta_activity_log", activityLog);
  }, [activityLog]);

  useEffect(() => {
    // Only persist admin-added vehicles (id >= 100)
    const adminVehicles = vehicles.filter((v) => v.id >= 100);
    saveToStorage("renta_vehicles", adminVehicles);
    saveToStorage("renta_vehicle_inventory", getVehicleInventory(vehicles));
  }, [vehicles]);

  useEffect(() => {
    saveToStorage("renta_reservations", reservations);
    if (!hasSyncedInitialReservations.current) {
      hasSyncedInitialReservations.current = true;
      return;
    }
    setVehicles((prev) => applyReservationOccupancy(prev, reservations));
  }, [reservations]);

  useEffect(() => {
    if (!isAuthenticated && requiresAuth(screen)) {
      setScreen("login");
    }
  }, [isAuthenticated, screen]);

  useEffect(() => {
    const unsubscribe = reservationCancelledTrigger.subscribe((id) => {
      console.info("[Trigger] Reserva cancelada:", id);
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    const unsubscribe = bookingConfirmedTrigger.subscribe((info) => {
      console.info("[Trigger] Reserva confirmada:", info);
    });
    return unsubscribe;
  }, []);

  const handleSelectVehicle = (v: Vehicle) => {
    if (!isAuthenticated) {
      setScreen("login");
      return;
    }
    if (isAdmin) return;
    setSelectedVehicle(v);
    setScreen("booking");
  };

  const handleAddVehicle = (v: Vehicle) => {
    setVehicles((prev) => [...prev, v]);
    logActivity({
      action: "Vehículo agregado",
      detail: `${userName || "Administrador"} agregó el vehículo ${v.name} al catálogo.`,
      category: "flota",
    });
  };

  const handleUpdateVehicle = (updated: Vehicle) => {
    setVehicles((prev) => prev.map((v) => (v.id === updated.id ? updated : v)));
    logActivity({
      action: "Vehículo actualizado",
      detail: `${userName || "Administrador"} actualizó la información de ${updated.name}.`,
      category: "flota",
    });
  };

  const handleDeleteVehicle = (id: number) => {
    const deletingVehicle = vehicles.find((v) => v.id === id);
    setVehicles((prev) => prev.filter((v) => v.id !== id));
    logActivity({
      action: "Vehículo eliminado",
      detail: `${userName || "Administrador"} eliminó ${deletingVehicle?.name || "un vehículo"} del catálogo.`,
      category: "flota",
    });
  };

  const handleDeactivateVehicle = (id: number) => {
    const targetVehicle = vehicles.find((v) => v.id === id);
    if (!targetVehicle) return;
    setVehicles((prev) => prev.map((v) => (v.id === id ? { ...v, disabled: true } : v)));
    logActivity({
      action: "Vehículo desactivado",
      detail: `${userName || "Administrador"} desactivó ${targetVehicle.name}; ya no aparece para reservas.`,
      category: "flota",
    });
  };

  const handleActivateVehicle = (id: number) => {
    const targetVehicle = vehicles.find((v) => v.id === id);
    if (!targetVehicle) return;
    setVehicles((prev) => prev.map((v) => (v.id === id ? { ...v, disabled: false } : v)));
    logActivity({
      action: "Vehículo reactivado",
      detail: `${userName || "Administrador"} reactivó ${targetVehicle.name} en el catálogo.`,
      category: "flota",
    });
  };

  const handleCancelReservation = (id: string) => {
    const cancellingRes = reservations.find((r) => r.id === id);
    if (cancellingRes && cancellingRes.vehicleId !== undefined && cancellingRes.status === "activa") {
      setVehicles((prev) =>
        prev.map((v) =>
          v.id === cancellingRes.vehicleId
            ? (() => {
                const city = cancellingRes.city as BranchCity | undefined;
                if (!city) return { ...v, occupied: Math.max(0, (v.occupied || 0) - 1) };
                const current = v.branches || createBranchInventory(v.stock, v.occupied);
                const branches = { ...current, [city]: { ...current[city], occupied: Math.max(0, current[city].occupied - 1) } };
                return { ...v, branches, ...inventoryTotals(branches) };
              })()
            : v
        )
      );
    }
    setReservations((prev) => {
      const target = prev.find((res) => res.id === id);
      if (!target) return prev;
      const groupReservations = prev.filter((res) => target.groupId ? res.groupId === target.groupId : res.id === target.id);
      const fallbackIndex = groupReservations.findIndex((res) => res.id === id);
      const updatedInvoice = target.invoice ? cancelInvoiceItem(target.invoice, id, fallbackIndex) : undefined;

      return prev.map((res) => {
        const belongsToGroup = target.groupId ? res.groupId === target.groupId : res.id === target.id;
        if (!belongsToGroup) return res;
        return { ...res, ...(res.id === id ? { status: "cancelada" } : {}), ...(updatedInvoice ? { invoice: updatedInvoice } : {}) };
      });
    });
    if (cancellingRes) {
      logActivity({
        action: "Reserva cancelada",
        detail: `${userName || "Usuario"} canceló la reserva ${id} del vehículo ${cancellingRes.vehicle}.`,
        category: "reservas",
      });
    }
    reservationCancelledTrigger.emit(id);
  };

  const handleReturnReservation = (id: string) => {
    const returnedRes = reservations.find((r) => r.id === id);
    setReservations((prev) =>
      prev.map((res) =>
        res.id === id
          ? { ...res, status: "completada", returnedAt: new Date().toISOString() }
          : res
      )
    );
    if (returnedRes) {
      logActivity({
        action: "Devolución confirmada",
        detail: `${userName || "Secretario/a"} confirmó la devolución de ${returnedRes.vehicle} del cliente ${returnedRes.clientName || "sin nombre"}.`,
        category: "reservas",
      });
    }
  };

  const activeVehicles = vehicles.filter((vehicle) => !vehicle.disabled);
  const bookingVehicles = activeVehicles.map((vehicle) => {
    const pending = bookingCart.filter((item) => item.vehicle.id === vehicle.id);
    if (!pending.length) return vehicle;
    let branches = vehicle.branches || createBranchInventory(vehicle.stock, vehicle.occupied);
    pending.forEach(({ data }) => {
      const city = data.city as BranchCity;
      branches = { ...branches, [city]: { ...branches[city], occupied: branches[city].occupied + 1 } };
    });
    return { ...vehicle, branches, ...inventoryTotals(branches) };
  });

  return (
    <div
      className="min-h-screen bg-[#0a0a0f] overflow-x-hidden"
      style={{ fontFamily: "'Outfit', sans-serif" }}
    >
      {/* Top nav (hidden on hero) */}
      {screen !== "hero" && (
        <header className="sticky top-0 z-50 bg-[#0a0a0f]/95 backdrop-blur-md border-b border-[#c9a84c]/10">
          <div className="max-w-7xl mx-auto px-6 py-4 grid grid-cols-[1fr_auto_1fr] items-center gap-4">
            <button onClick={() => goToScreen("hero")} className="flex items-center gap-2">
              <div className="w-8 h-8 bg-[#c9a84c] rounded flex items-center justify-center">
                <span style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 700, fontSize: 14, color: "#0a0a0f" }}>R</span>
              </div>
              <span style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 600, fontSize: 18, color: "#f0ede8", letterSpacing: "0.05em" }}>
                RENTA
              </span>
              {isAdmin && (
                <span className="flex items-center gap-1 bg-[#c9a84c]/15 border border-[#c9a84c]/40 px-2 py-0.5 rounded-full ml-1">
                  <Shield size={10} color="#c9a84c" />
                  <span style={{ fontSize: 10, color: "#c9a84c", fontWeight: 700, letterSpacing: "0.1em" }}>ADMIN</span>
                </span>
              )}
            </button>

            {(["fleet", "destinations", "company", "about"] as Screen[]).includes(screen) && (
              <nav className="hidden lg:flex items-center justify-center gap-1">
                {marketingNavItems
                  .filter(({ id }) => !(screen === "fleet" && id === "fleet"))
                  .map(({ id, label }) => (
                    <button
                      key={id}
                      onClick={() => goToScreen(id)}
                      className={`px-3 py-2 rounded-lg transition-colors ${screen === id ? "text-[#c9a84c] bg-[#c9a84c]/10" : "text-[#7a7890] hover:text-[#f0ede8]"}`}
                      style={{ fontSize: 13, fontWeight: 500 }}
                    >
                      {label}
                    </button>
                  ))}
              </nav>
            )}

            <nav className="hidden md:flex items-center justify-end gap-2 col-start-3">
              {navItems
                .filter(({ id }) => !(isAdmin && id === "booking"))
                .map(({ id, icon: Icon, label }) => (
                  <button
                    key={id}
                    onClick={() => {
                      goToNavItem(id);
                    }}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${
                      screen === id || (id === "booking" && (screen === "bookingCatalog" || screen === "booking" || screen === "myReservations"))
                        ? "bg-[#c9a84c]/15 text-[#c9a84c]"
                        : "text-[#7a7890] hover:text-[#f0ede8] hover:bg-[#1a1a24]"
                    }`}
                    style={{ fontSize: 14 }}
                  >
                    <Icon size={15} />
                    {id === "booking" ? (userRole === "secretary" ? "Reservas realizadas" : "Mis reservas") : label}
                  </button>
                ))}
            </nav>

            <button
              className="md:hidden w-9 h-9 rounded-xl border border-[#c9a84c]/20 flex items-center justify-center"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X size={16} color="#f0ede8" /> : <Menu size={16} color="#f0ede8" />}
            </button>
          </div>

          {mobileMenuOpen && (
            <div className="md:hidden border-t border-[#c9a84c]/10 bg-[#0a0a0f] px-6 py-4 flex flex-col gap-2">
              {(["fleet", "destinations", "company", "about"] as Screen[]).includes(screen) && (
                <div className="grid grid-cols-2 gap-2 pb-3 mb-2 border-b border-[#c9a84c]/10">
                  {marketingNavItems
                    .filter(({ id }) => !(screen === "fleet" && id === "fleet"))
                    .map(({ id, label }) => (
                      <button key={id} onClick={() => goToScreen(id)} className={`px-4 py-3 rounded-xl text-left ${screen === id ? "bg-[#c9a84c]/15 text-[#c9a84c]" : "text-[#7a7890]"}`}>
                        {label}
                      </button>
                    ))}
                </div>
              )}
              {navItems
                .filter(({ id }) => !(isAdmin && id === "booking"))
                .map(({ id, icon: Icon, label }) => (
                  <button
                    key={id}
                    onClick={() => {
                      goToNavItem(id);
                    }}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-left ${
                      screen === id || (id === "booking" && (screen === "bookingCatalog" || screen === "booking" || screen === "myReservations"))
                        ? "bg-[#c9a84c]/15 text-[#c9a84c]"
                        : "text-[#7a7890] hover:text-[#f0ede8]"
                    }`}
                    style={{ fontSize: 15 }}
                  >
                    <Icon size={16} />
                    {id === "booking" ? (userRole === "secretary" ? "Reservas realizadas" : "Mis reservas") : label}
                  </button>
                ))}
            </div>
          )}
        </header>
      )}

      {/* Screens */}
      {screen === "login" && (
        <LoginScreen
          allowBack={true}
          onBack={() => goToScreen("hero")}
          onLogin={(name, isSignup, role, email, phone) => {
            if (name) setUserName(name);
            const normalizedRole = role === "admin" || role === "secretary" ? role : "client";
            setUserRole(normalizedRole);
            setIsAdmin(normalizedRole === "admin");
            setUserEmail(email ?? "");
            setUserPhone(phone ?? "");
            if (isSignup) {
              setReservations([]);
              setLastBookingId("");
              setLastBookingPickup("");
              setLastBookingInvoice(null);
            }
            setScreen("dashboard");
          }}
        />
      )}
      {screen === "hero" && (
        <HeroScreen
          userName={userName}
          onExplore={() => goToScreen("fleet")}
          onLogin={() => setScreen("login")}
          onDashboard={() => goToScreen("dashboard")}
          onCompany={() => setScreen("company")}
          onDestinations={() => setScreen("destinations")}
          onAbout={() => setScreen("about")}
        />
      )}
      {screen === "company" && (
        <CompanyScreen
          onBack={() => setScreen("hero")}
        />
      )}
      {screen === "about" && (
        <AboutScreen
          onBack={() => setScreen("hero")}
          onExplore={() => goToScreen("fleet")}
        />
      )}
      {screen === "destinations" && (
        <DestinationsScreen
          onBack={() => setScreen("hero")}
          onExplore={() => goToScreen("fleet")}
        />
      )}
      {screen === "fleet" && (
        <FleetScreen
          vehicles={activeVehicles}
          isAdmin={isAdmin}
          canManageVehicles={canManageVehicles}
          onSelect={handleSelectVehicle}
          onAddVehicle={handleAddVehicle}
          onUpdateVehicle={handleUpdateVehicle}
          onDeleteVehicle={handleDeleteVehicle}
          onDeactivateVehicle={handleDeactivateVehicle}
        />
      )}
      {screen === "bookingCatalog" && (
        <FleetScreen
          vehicles={bookingVehicles}
          isAdmin={false}
          canManageVehicles={false}
          onSelect={handleSelectVehicle}
          onAddVehicle={handleAddVehicle}
          onUpdateVehicle={handleUpdateVehicle}
          onDeleteVehicle={handleDeleteVehicle}
          onDeactivateVehicle={handleDeactivateVehicle}
          eyebrow="RESERVA"
          title="Elige un vehiculo"
          description="Selecciona el carro que quieres reservar para continuar con fechas, datos y pago."
        />
      )}
      {screen === "myReservations" && isAuthenticated && (userRole === "client" || userRole === "secretary") && (
        <MyReservationsScreen reservations={reservations} userEmail={userEmail} userRole={userRole} onExplore={() => setScreen("fleet")} />
      )}
      {screen === "booking" && isAuthenticated && !isAdmin && (
        <BookingScreen
          vehicle={selectedVehicle}
          userRole={userRole}
          userName={userName}
          userEmail={userEmail}
          userPhone={userPhone}
          onBack={() => setScreen("bookingCatalog")}
          cartCount={bookingCart.length}
          onAddAnother={(data) => {
            setBookingCart((current) => [...current, { data, vehicle: selectedVehicle }]);
            setScreen("bookingCatalog");
          }}
          onConfirm={async (resData) => {
            if (!isAuthenticated) {
              setScreen("login");
              return;
            }
            const groupId = `#VLC-2026-${Math.floor(1000 + Math.random() * 9000)}`;
            const checkoutItems = [...bookingCart, { data: resData, vehicle: selectedVehicle }];
            const extrasList = loadVehicleExtras();
            const newReservations = checkoutItems.map(({ data, vehicle }, index) => {
              const id = checkoutItems.length > 1 ? `${groupId}-${index + 1}` : groupId;
              const invoice = generateInvoice(id, data.clientName || "Cliente", data.clientEmail || "", data.clientPhone || "", data.vehicle, data.category, data.location, data.pickup, data.dropoff, data.durationValue, vehicle.price, data.selectedExtras?.map((extraId: string) => {
                const extra = extrasList.find((entry) => entry.id === extraId);
                return { name: extra?.name || extraId, price: extra?.price || 0, quantity: data.durationValue };
              }) || [], data.total);
              return { ...data, id, groupId, groupSize: checkoutItems.length, status: "activa", vehicleId: vehicle.id, clientName: data.clientName || "Cliente", clientEmail: data.clientEmail || "", clientPhone: data.clientPhone || "", createdByEmail: userEmail, createdByName: userName, createdByRole: userRole, invoice };
            });
            const consolidatedInvoice = checkoutItems.length > 1
              ? generateConsolidatedInvoice(groupId, newReservations.map((reservation) => reservation.invoice))
              : newReservations[0].invoice;
            newReservations.forEach((reservation) => { reservation.invoice = consolidatedInvoice; });
            const newRes = newReservations[0];
            const invoice = consolidatedInvoice;
            setSelectedVehicle((current) => ({ ...current, selectedCity: resData.city }));
            setReservations([...newReservations, ...reservations]);
            setVehicles((prev) =>
              prev.map((v) => {
                const items = checkoutItems.filter((item) => item.vehicle.id === v.id);
                if (!items.length) return v;
                let branches = v.branches || createBranchInventory(v.stock, v.occupied);
                items.forEach(({ data }) => { const city = data.city as BranchCity; branches = { ...branches, [city]: { ...branches[city], occupied: branches[city].occupied + 1 } }; });
                return { ...v, branches, ...inventoryTotals(branches) };
              })
            );
            logActivity({
              action: userRole === "secretary" ? "Reserva registrada por secretario/a" : "Reserva creada",
              detail:
                userRole === "secretary"
                  ? `${userName || "Secretario/a"} registró una reserva para ${newRes.clientName} del vehículo ${newRes.vehicle}.`
                  : `${newRes.clientName || userName || "Cliente"} reservó ${checkoutItems.length} vehículo${checkoutItems.length === 1 ? "" : "s"}.`,
              category: "reservas",
            });
            setLastBookingId(groupId);
            setLastBookingDuration(resData.durationSummary || "");
            setLastBookingPickup(resData.pickup || "");
            setLastBookingInvoice(invoice);
            setLastBookingVehicleCount(checkoutItems.length);
            bookingConfirmedTrigger.emit({ id: groupId, total: checkoutItems.reduce((sum, item) => sum + item.data.total, 0), vehicle: checkoutItems.map((item) => item.data.vehicle).join(", ") });
            setBookingCart([]);
            setScreen("confirmed");

            // Connect to Backend API
            try {
              // 1. Map client name to database user ID
              const lowerName = userName.toLowerCase();
              let id_cliente = 1; // Default to Juan
              if (lowerName.includes("mar")) id_cliente = 2; // María
              else if (lowerName.includes("carl")) id_cliente = 3; // Carlos
              else if (lowerName.includes("ana")) id_cliente = 4; // Ana

              for (const { data, vehicle } of checkoutItems) {
              const id_vehiculo = vehicle.id <= 4 ? vehicle.id : 4;
              const resResponse = await fetch(`${API_BASE_URL}/api/reservas`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  id_cliente,
                  id_vehiculo,
                  id_sucursal_entrega: ({ Manta: 1, Quito: 2, Guayaquil: 3, Cuenca: 4 } as Record<string, number>)[data.city] || 1,
                  id_sucursal_devolucion: ({ Manta: 1, Quito: 2, Guayaquil: 3, Cuenca: 4 } as Record<string, number>)[data.city] || 1,
                  fecha_inicio: "2026-06-15",
                  fecha_fin: "2026-06-20",
                  total: data.total,
                  observaciones: `${groupId}: ${data.vehicle}, ${data.durationSummary || "duración no especificada"}, extras: ${(data.selectedExtras || []).join(", ") || "ninguno"}`
                })
              });
              const resResult = await resResponse.json();
              console.log("Reservation DB Response:", resResult);

              if (resResult.id_reserva) {
                // 4. POST /api/pagos
                const payResponse = await fetch(`${API_BASE_URL}/api/pagos`, {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    id_reserva: resResult.id_reserva,
                    monto: data.total,
                    metodo_pago: "Tarjeta",
                    referencia: data.cardNumber || groupId,
                    estado: "Completado"
                  })
                });
                const payResult = await payResponse.json();
                console.log("Payment DB Response:", payResult);
              }
              }
            } catch (err) {
              console.error("Error connecting with backend database:", err);
            }
          }}
        />
      )}
      {screen === "dashboard" && isAuthenticated && (
        <DashboardScreen
          userName={userName}
          userEmail={userEmail}
          userRole={userRole}
          isAdmin={isAdmin}
          reservations={reservations}
          vehicles={vehicles}
          activityLog={activityLog}
          onLogActivity={logActivity}
          onLogout={() => {
            setScreen("hero");
            setUserName("");
            setUserEmail("");
            setUserPhone("");
            setUserRole("client");
            setIsAdmin(false);
            removeFromStorage("renta_isAdmin");
            removeFromStorage("renta_userName");
            removeFromStorage("renta_userEmail");
            removeFromStorage("renta_userPhone");
            removeFromStorage("renta_userRole");
          }}
          onCancelReservation={handleCancelReservation}
          onReturnReservation={handleReturnReservation}
          onEditVehicle={(v) => goToScreen("fleet")}
          onGoToFleet={() => goToScreen("fleet")}
          onDeleteVehicle={handleDeleteVehicle}
          onDeactivateVehicle={handleDeactivateVehicle}
          onActivateVehicle={handleActivateVehicle}
          onAddVehicle={handleAddVehicle}
          onUpdateVehicle={handleUpdateVehicle}
        />
      )}
      {screen === "confirmed" && isAuthenticated && (
        <div className="min-h-screen flex items-center justify-center px-6">
          <div className="text-center max-w-md">
            <div className="w-24 h-24 bg-[#c9a84c]/15 border-2 border-[#c9a84c]/40 rounded-full flex items-center justify-center mx-auto mb-8">
              <span style={{ fontSize: 40, color: "#c9a84c" }}>✓</span>
            </div>
            <h2
              style={{ fontFamily: "'Playfair Display', serif", fontSize: 32, fontWeight: 700, color: "#f0ede8" }}
              className="mb-4"
            >
              ¡Reserva confirmada!
            </h2>
            <p style={{ fontSize: 15, color: "#7a7890", lineHeight: 1.7 }} className="mb-4">
              {lastBookingVehicleCount > 1
                ? `Tus ${lastBookingVehicleCount} vehículos han sido reservados correctamente bajo una misma operación. Puedes revisar el detalle individual de cada uno en Mis reservas.`
                : `Tu ${selectedVehicle.name} te espera el ${lastBookingPickup} en el Centro de ${selectedVehicle.selectedCity || "Manta"}${lastBookingDuration ? ` por ${lastBookingDuration}` : ""}. Recibirás todos los detalles por correo.`}
            </p>
            <div
              className="bg-[#12121a] border border-[#c9a84c]/20 rounded-2xl p-4 mb-8"
              style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 20, color: "#c9a84c", letterSpacing: "0.2em" }}
            >
              {lastBookingId || "#VLC-2026-4891"}
            </div>
            <div className="flex gap-3 justify-center flex-col sm:flex-row">
              <button
                onClick={() => {
                  if (lastBookingInvoice) {
                    downloadInvoicePDF(lastBookingInvoice);
                  }
                }}
                className="px-6 py-3 bg-[#c9a84c] rounded-xl hover:bg-[#d4b860] transition-colors flex items-center justify-center gap-2"
                style={{ fontSize: 13, fontWeight: 600, color: "#0a0a0f", letterSpacing: "0.05em" }}
              >
                <Download size={16} />
                DESCARGAR FACTURA
              </button>
              <button
                onClick={() => goToScreen(userRole === "admin" ? "dashboard" : "myReservations")}
                className="px-6 py-3 border border-[#c9a84c]/30 rounded-xl hover:bg-[#c9a84c]/5 transition-colors"
                style={{ fontSize: 13, fontWeight: 600, color: "#c9a84c", letterSpacing: "0.05em" }}
              >
                VER MIS RESERVAS
              </button>
              <button
                onClick={() => goToScreen("fleet")}
                className="px-6 py-3 border border-[#c9a84c]/25 rounded-xl hover:bg-[#c9a84c]/5 transition-colors"
                style={{ fontSize: 13, color: "#c9a84c" }}
              >
                Explorar más
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bottom mobile tab bar */}
      {screen !== "hero" && (
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-[#0d0d14]/95 backdrop-blur-md border-t border-[#c9a84c]/10 flex pb-safe">
          {navItems
            .filter(({ id }) => !(isAdmin && id === "booking"))
            .map(({ id, icon: Icon, label }) => (
              <button
                key={id}
                onClick={() => goToNavItem(id)}
                className="flex-1 flex flex-col items-center gap-1 py-3 transition-colors"
                style={{
                  color:
                    screen === id || (id === "booking" && (screen === "bookingCatalog" || screen === "booking" || screen === "myReservations"))
                      ? "#c9a84c"
                      : "#7a7890",
                }}
              >
                <Icon size={20} />
                <span style={{ fontSize: 10 }}>{id === "booking" ? (userRole === "secretary" ? "Reservas" : "Mis reservas") : label}</span>
              </button>
            ))}
        </div>
      )}
    </div>
  );
}
