import { useEffect, useState } from "react";
import {
  Calendar, MapPin, Clock, ChevronRight, Star, BarChart2, Car,
  TrendingUp, Award, LogOut, X, Search, Shield, Fuel, Users, Edit2,
  Trash2, Plus, Package, CheckCircle, AlertTriangle, LayoutGrid, Download
} from "lucide-react";
import type { ActivityLogEntry, Vehicle } from "../App";
import { AdminPanel } from "./AdminPanel";
import { loadFromStorage, saveToStorage } from "../utils/storage";
import { downloadInvoicePDF } from "../utils/invoiceGenerator";
import { PieChart, BarChart, LineChart } from "./Charts";
import { ECUADOR_CITIES, findEcuadorCity } from "../utils/ecuadorCities";

const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
  activa: { label: "ACTIVA", color: "#c9a84c", bg: "rgba(201,168,76,0.12)" },
  finalizada: { label: "FINALIZADO", color: "#f59e0b", bg: "rgba(245,158,11,0.13)" },
  completada: { label: "COMPLETADO", color: "#4caf84", bg: "rgba(76,175,132,0.12)" },
  cancelada: { label: "CANCELADA", color: "#d4183d", bg: "rgba(212,24,61,0.12)" },
};

export function DashboardScreen({
  userName = "Usuario",
  userRole = "client",
  userEmail = "",
  isAdmin = false,
  reservations = [],
  vehicles = [],
  activityLog = [],
  onLogout,
  onCancelReservation,
  onReturnReservation,
  onLogActivity,
  onGoToFleet,
  onDeleteVehicle,
  onAddVehicle,
  onUpdateVehicle,
}: {
  userName?: string;
  userRole?: "admin" | "secretary" | "client";
  userEmail?: string;
  isAdmin?: boolean;
  reservations?: any[];
  vehicles?: Vehicle[];
  activityLog?: ActivityLogEntry[];
  onLogout?: () => void;
  onCancelReservation?: (id: string) => void;
  onReturnReservation?: (id: string) => void;
  onLogActivity?: (entry: Omit<ActivityLogEntry, "id" | "timestamp" | "actorName" | "actorRole"> & { actorName?: string; actorRole?: ActivityLogEntry["actorRole"] }) => void;
  onEditVehicle?: (v: Vehicle) => void;
  onGoToFleet?: () => void;
  onDeleteVehicle?: (id: number) => void;
  onAddVehicle?: (v: Vehicle) => void;
  onUpdateVehicle?: (v: Vehicle) => void;
}) {
  const [activeTab, setActiveTab] = useState("todas");
  const [adminTab, setAdminTab] = useState<"stats" | "fleet" | "users" | "activity">("stats");
  const [selectedReservation, setSelectedReservation] = useState<any>(null);
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
  const [users, setUsers] = useState<Record<string, any>>(() => loadFromStorage<Record<string, any>>("renta_users", {}));
  const [userSearch, setUserSearch] = useState("");
  const [newUserRole, setNewUserRole] = useState<"client" | "secretary">("client");
  const [newUserName, setNewUserName] = useState("");
  const [newUserLastName, setNewUserLastName] = useState("");
  const [newUserEmail, setNewUserEmail] = useState("");
  const [newUserPhone, setNewUserPhone] = useState("");
  const [newUserCity, setNewUserCity] = useState("");
  const [newUserPassword, setNewUserPassword] = useState("");
  const [showUserModal, setShowUserModal] = useState(false);
  const [userCreateError, setUserCreateError] = useState("");
  const [editingUserEmail, setEditingUserEmail] = useState<string | null>(null);
  const [userDeleteConfirm, setUserDeleteConfirm] = useState<string | null>(null);
  const hiddenReservationsKey = `renta_hidden_reservations_${userEmail || "client"}`;
  const [hiddenReservationIds, setHiddenReservationIds] = useState<string[]>(() =>
    loadFromStorage<string[]>(`renta_hidden_reservations_${userEmail || "client"}`, [])
  );

  useEffect(() => {
    setHiddenReservationIds(loadFromStorage<string[]>(hiddenReservationsKey, []));
  }, [hiddenReservationsKey]);

  const hideCancelledReservation = (id: string) => {
    if (userRole !== "client" || isAdmin) return;
    const next = Array.from(new Set([...hiddenReservationIds, id]));
    setHiddenReservationIds(next);
    saveToStorage(hiddenReservationsKey, next);
    if (selectedReservation?.id === id) setSelectedReservation(null);
  };

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

  const monthlySpending = { Ene: 0, Feb: 0, Mar: 0, Abr: 0, May: 0, Jun: 0, Jul: 0 };
  const weeklySpending = { Lun: 0, Mar: 0, Mie: 0, Jue: 0, Vie: 0, Sab: 0, Dom: 0 };
  reservations.forEach((r) => {
    const parts = r.pickup?.split(" ") || [];
    if (parts.length > 1) {
      const rawMonth = parts[1].replace(".", "").toLowerCase();
      const month = (rawMonth.charAt(0).toUpperCase() + rawMonth.slice(1, 3)) as keyof typeof monthlySpending;
      if (monthlySpending[month as keyof typeof monthlySpending] !== undefined) {
        monthlySpending[month as keyof typeof monthlySpending] += r.total;
      }
    }

    const pickupDate = parseDisplayDate(r.pickup);
    if (pickupDate) {
      const dayNames = ["Dom", "Lun", "Mar", "Mie", "Jue", "Vie", "Sab"];
      const dayName = dayNames[pickupDate.getDay()] as keyof typeof weeklySpending;
      weeklySpending[dayName] += r.total || 0;
    }
  });

  const monthData = [
    { month: "Ene", spent: monthlySpending.Ene },
    { month: "Feb", spent: monthlySpending.Feb },
    { month: "Mar", spent: monthlySpending.Mar },
    { month: "Abr", spent: monthlySpending.Abr },
    { month: "May", spent: monthlySpending.May },
    { month: "Jun", spent: monthlySpending.Jun },
    { month: "Jul", spent: monthlySpending.Jul },
  ];
  const weekData = [
    { day: "Lun", spent: weeklySpending.Lun },
    { day: "Mar", spent: weeklySpending.Mar },
    { day: "Mie", spent: weeklySpending.Mie },
    { day: "Jue", spent: weeklySpending.Jue },
    { day: "Vie", spent: weeklySpending.Vie },
    { day: "Sab", spent: weeklySpending.Sab },
    { day: "Dom", spent: weeklySpending.Dom },
  ];
  const maxSpent = Math.max(...monthData.map((d) => d.spent), 1);
  const getDurationSummary = (reservation: any) => {
    if (reservation.durationSummary) return reservation.durationSummary;
    const days = reservation.durationValue || reservation.days || 0;
    return `${days} ${days === 1 ? "día" : "días"}`;
  };
  const getRateSummary = (reservation: any) => {
    const durationValue = reservation.durationValue || reservation.days || 1;
    return `${getDurationSummary(reservation)} · $${Math.round((reservation.total || 0) / durationValue)}/día`;
  };
  const isPastReservation = (reservation: any) => {
    const dropoffDate = parseDisplayDate(reservation.dropoff);
    if (!dropoffDate) return false;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    dropoffDate.setHours(0, 0, 0, 0);

    return dropoffDate < today;
  };
  const getEffectiveStatus = (reservation: any) => {
    if (reservation.status === "activa" && isPastReservation(reservation)) {
      return "finalizada";
    }
    return reservation.status;
  };

  const activeReservation = reservations.find((r) => getEffectiveStatus(r) === "activa");
  const clientSpending: Record<string, number> = {};
  reservations.forEach((r) => {
    const client = r.clientName || "Cliente anónimo";
    clientSpending[client] = (clientSpending[client] || 0) + (r.total || 0);
  });
  const clientSpendingData = Object.entries(clientSpending)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  const filtered = reservations.filter((r) => {
    // Clients can only see their own reservations
    if (userRole === "client" && !isAdmin) {
      const isClientReservation = r.clientEmail === userEmail;
      if (!isClientReservation) return false;
      if (hiddenReservationIds.includes(r.id)) return false;
    }

    if (activeTab === "todas") return true;
    const status = getEffectiveStatus(r);
    if (activeTab === "activas") return status === "activa";
    if (activeTab === "historial") return status === "finalizada" || status === "completada" || status === "cancelada";
    return true;
  });

  const reservationTitle = isAdmin
    ? "Reservas del sistema"
    : userRole === "secretary"
    ? "Reservas registradas"
    : "Mis Reservas";

  const availableCount = vehicles.filter((v) => v.available).length;
  const unavailableCount = vehicles.filter((v) => !v.available).length;
  const categories = Array.from(new Set(vehicles.map((v) => v.category)));
  const brands = Array.from(new Set(vehicles.map((v) => v.brand)));
  const totalBilling = reservations.reduce((sum, r) => sum + (r.total || 0), 0);
  const activeReservationsCount = reservations.filter((r) => getEffectiveStatus(r) === "activa").length;
  const finishedReservationsCount = reservations.filter((r) => getEffectiveStatus(r) === "finalizada").length;
  const completedReservationsCount = reservations.filter((r) => {
    const status = getEffectiveStatus(r);
    return status === "finalizada" || status === "completada" || status === "cancelada";
  }).length;
  const vehiclePopularity: Record<string, number> = {};
  reservations.forEach((r) => {
    if (r.vehicle) vehiclePopularity[r.vehicle] = (vehiclePopularity[r.vehicle] || 0) + 1;
  });
  const popularVehicle = Object.entries(vehiclePopularity).sort((a, b) => b[1] - a[1])[0]?.[0] || "N/A";

  const adminStats = [
    { icon: Car, label: "Total vehículos", value: vehicles.length.toString(), sub: "en catálogo" },
    { icon: Users, label: "Usuarios", value: Object.keys(users).length.toString(), sub: "registrados" },
    { icon: TrendingUp, label: "Total facturado", value: `$${totalBilling.toLocaleString()}`, sub: "ingresos totales" },
    { icon: Clock, label: "Reservas totales", value: reservations.length.toString(), sub: "en el sistema" },
  ];

  const secretaryStats = [
    { icon: TrendingUp, label: "Facturación total", value: `$${totalBilling.toLocaleString()}`, sub: "gastos de clientes" },
    { icon: Clock, label: "Reservas activas", value: activeReservationsCount.toString(), sub: "en curso" },
    { icon: CheckCircle, label: "Reservas cerradas", value: completedReservationsCount.toString(), sub: "finalizadas, completadas o canceladas" },
    { icon: Car, label: "Vehículo más popular", value: popularVehicle, sub: "por reservas" },
  ];

  const clientStats = [
    { icon: Car, label: "Total reservas", value: reservations.length.toString(), sub: "totales" },
    { icon: Clock, label: "Días alquilados", value: reservations.reduce((s, r) => s + (r.durationValue || r.days || 0), 0).toString(), sub: "días totales" },
    { icon: TrendingUp, label: "Total gastado", value: "$" + reservations.reduce((s, r) => s + (r.total || 0), 0).toLocaleString(), sub: "histórico" },
    { icon: Star, label: "Puntos acumulados", value: Math.floor(reservations.reduce((s, r) => s + (r.total || 0), 0) * 0.5).toLocaleString(), sub: "canjear recompensas" },
  ];

  const statsCards = isAdmin ? adminStats : userRole === "secretary" ? secretaryStats : clientStats;

  const handleSaveVehicle = (v: Vehicle) => {
    if (editingVehicle) {
      onUpdateVehicle?.(v);
    } else {
      onAddVehicle?.(v);
    }
    setShowAdminPanel(false);
    setEditingVehicle(null);
  };

  useEffect(() => {
    saveToStorage("renta_users", users);
  }, [users]);

  const resetUserForm = () => {
    setNewUserName("");
    setNewUserLastName("");
    setNewUserEmail("");
    setNewUserPhone("");
    setNewUserCity("");
    setNewUserPassword("");
    setNewUserRole("client");
    setEditingUserEmail(null);
    setUserCreateError("");
  };

  const openCreateUserModal = () => {
    resetUserForm();
    setShowUserModal(true);
  };

  const openEditUserModal = (email: string, user: any) => {
    const legacyNameParts = String(user.name || "").trim().split(/\s+/).filter(Boolean);
    const legacyLastName = legacyNameParts.length > 1 ? legacyNameParts.pop() || "" : "";
    setEditingUserEmail(email);
    setNewUserName(user.firstName || legacyNameParts.join(" "));
    setNewUserLastName(user.lastName || legacyLastName);
    setNewUserEmail(email);
    setNewUserPhone(user.phone || "");
    setNewUserCity(user.city || "");
    setNewUserPassword("");
    setNewUserRole(user.role === "secretary" ? "secretary" : "client");
    setUserCreateError("");
    setShowUserModal(true);
  };

  const handleCreateUser = () => {
    setUserCreateError("");
    const isEditingUser = Boolean(editingUserEmail);
    const firstName = newUserName.trim();
    const lastName = newUserLastName.trim();
    const fullName = `${firstName} ${lastName}`.trim();
    
    // Validar que todos los campos estén completos
    if (!firstName || !lastName || !newUserEmail.trim() || !newUserPhone.trim() || !newUserCity.trim() || (!isEditingUser && !newUserPassword)) {
      setUserCreateError("Todos los campos son obligatorios");
      return;
    }
    const selectedCity = findEcuadorCity(newUserCity);
    if (!selectedCity) {
      setUserCreateError("Selecciona una ciudad del Ecuador de la lista");
      return;
    }
    
    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newUserEmail)) {
      setUserCreateError("Por favor ingresa un correo electrónico válido");
      return;
    }
    
    // Validar que el email no esté duplicado
    if (users[newUserEmail] && newUserEmail !== editingUserEmail) {
      setUserCreateError("Ya existe un usuario con ese correo");
      return;
    }
    
    // Validar que la contraseña tenga al menos 6 caracteres
    if (newUserPassword && newUserPassword.length < 6) {
      setUserCreateError("La contraseña debe tener al menos 6 caracteres");
      return;
    }
    
    setUsers((prev) => {
      const next = { ...prev };
      const currentUser = editingUserEmail ? prev[editingUserEmail] : {};
      if (editingUserEmail && editingUserEmail !== newUserEmail) {
        delete next[editingUserEmail];
      }

      next[newUserEmail] = {
        ...currentUser,
        firstName,
        lastName,
        name: fullName,
        email: newUserEmail,
        phone: newUserPhone,
        city: selectedCity,
        password: newUserPassword || currentUser?.password || "",
        role: newUserRole,
      };

      return next;
    });
    onLogActivity?.({
      action: isEditingUser ? "Usuario actualizado" : "Usuario creado",
      detail: `${userName || "Administrador"} ${isEditingUser ? "actualizó la información de" : "creó la cuenta de"} ${fullName} (${newUserEmail}) con rol ${newUserRole}.`,
      category: "usuarios",
    });
    
    // Limpiar campos y cerrar modal
    resetUserForm();
    setShowUserModal(false);
  };

  const confirmDelete = () => {
    if (deleteConfirm !== null) {
      onDeleteVehicle?.(deleteConfirm);
      setDeleteConfirm(null);
    }
  };

  const confirmDeleteUser = () => {
    if (!userDeleteConfirm) return;
    const deletedUser = users[userDeleteConfirm];
    setUsers((prev) => {
      const next = { ...prev };
      delete next[userDeleteConfirm];
      return next;
    });
    onLogActivity?.({
      action: "Usuario eliminado",
      detail: `${userName || "Administrador"} eliminó la cuenta de ${deletedUser?.name || "Usuario"} (${userDeleteConfirm}).`,
      category: "usuarios",
    });
    if (editingUserEmail === userDeleteConfirm) {
      resetUserForm();
      setShowUserModal(false);
    }
    setUserDeleteConfirm(null);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] px-6 py-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-end justify-between mb-8 flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="h-px w-6 bg-[#c9a84c]" />
            <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: 11, color: "#c9a84c", letterSpacing: "0.2em" }}>MI CUENTA</span>
          </div>
          <div className="flex items-center gap-3">
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, fontSize: 32, color: "#f0ede8" }}>
              {isAdmin ? "Panel de Control" : userRole === "secretary" ? "Panel de Reportes" : `Bienvenido, ${userName}`}
            </h2>
            {isAdmin && (
              <span className="flex items-center gap-1.5 bg-[#c9a84c]/15 border border-[#c9a84c]/40 px-3 py-1 rounded-full">
                <Shield size={13} color="#c9a84c" />
                <span style={{ fontSize: 11, color: "#c9a84c", fontWeight: 700, letterSpacing: "0.1em" }}>ADMINISTRADOR</span>
              </span>
            )}
          </div>
          <p style={{ fontFamily: "'Outfit', sans-serif", fontSize: 14, color: "#7a7890" }}>
            {isAdmin
              ? `Hola, ${userName} · Gestión completa del catálogo`
              : userRole === "secretary"
              ? "Panel de reportes para supervisar reservas y gastos"
              : "Miembro Premium desde Junio del 2026"}
          </p>
        </div>
        <div className="flex flex-col items-end gap-3">
          <div className="flex items-center gap-3 bg-[#12121a] border border-[#c9a84c]/20 rounded-2xl px-5 py-3">
            <Award size={20} color="#c9a84c" />
            <div>
              <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 12, color: "#7a7890" }}>Nivel</div>
              <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 14, fontWeight: 600, color: "#c9a84c" }}>
                {isAdmin ? "Administrador" : userRole === "secretary" ? "Secretario/a" : "Gold Member"}
              </div>
            </div>
          </div>
          <button
            onClick={onLogout}
            className="flex items-center gap-2 text-[#7a7890] hover:text-[#d4183d] transition-colors"
            style={{ fontFamily: "'Outfit', sans-serif", fontSize: 13, fontWeight: 500 }}
          >
            <LogOut size={15} />
            Cerrar sesión
          </button>
        </div>
      </div>

      {/* ===== ADMIN SECTION ===== */}
      {isAdmin && (
        <div className="mb-8">
          <div className="bg-gradient-to-br from-[#c9a84c]/8 to-[#c9a84c]/3 border border-[#c9a84c]/20 rounded-3xl p-6">
            {/* Admin tabs */}
            <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
              <div className="flex items-center gap-3">
                <Shield size={18} color="#c9a84c" />
                <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: 16, fontWeight: 700, color: "#f0ede8" }}>
                  Panel de Administración
                </span>
              </div>
              <div className="flex gap-2 flex-wrap">
                <button
                  onClick={() => setAdminTab("stats")}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-xl transition-all ${adminTab === "stats" ? "bg-[#c9a84c]/20 text-[#c9a84c]" : "text-[#7a7890] hover:text-[#f0ede8]"}`}
                  style={{ fontFamily: "'Outfit', sans-serif", fontSize: 13, fontWeight: 500 }}
                >
                  <BarChart2 size={14} />
                  Estadísticas
                </button>
                <button
                  onClick={() => setAdminTab("users")}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-xl transition-all ${adminTab === "users" ? "bg-[#c9a84c]/20 text-[#c9a84c]" : "text-[#7a7890] hover:text-[#f0ede8]"}`}
                  style={{ fontFamily: "'Outfit', sans-serif", fontSize: 13, fontWeight: 500 }}
                >
                  <Users size={14} />
                  Usuarios
                </button>
                <button
                  onClick={() => setAdminTab("activity")}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-xl transition-all ${adminTab === "activity" ? "bg-[#c9a84c]/20 text-[#c9a84c]" : "text-[#7a7890] hover:text-[#f0ede8]"}`}
                  style={{ fontFamily: "'Outfit', sans-serif", fontSize: 13, fontWeight: 500 }}
                >
                  <Clock size={14} />
                  Actividades
                </button>
                <button
                  onClick={() => setAdminTab("fleet")}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-xl transition-all ${adminTab === "fleet" ? "bg-[#c9a84c]/20 text-[#c9a84c]" : "text-[#7a7890] hover:text-[#f0ede8]"}`}
                  style={{ fontFamily: "'Outfit', sans-serif", fontSize: 13, fontWeight: 500 }}
                >
                  <LayoutGrid size={14} />
                  Flota ({vehicles.length})
                </button>
                <button
                  onClick={() => { setEditingVehicle(null); setShowAdminPanel(true); }}
                  className="flex items-center gap-1.5 px-4 py-2 bg-[#c9a84c] hover:bg-[#d4b860] rounded-xl transition-all hover:scale-[1.02]"
                  style={{ fontFamily: "'Outfit', sans-serif", fontSize: 13, fontWeight: 700, color: "#0a0a0f", letterSpacing: "0.05em" }}
                >
                  <Plus size={14} />
                  AGREGAR
                </button>
              </div>
            </div>

            {adminTab === "stats" && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { icon: Car, label: "Total vehículos", value: vehicles.length.toString(), color: "#c9a84c", sub: "en catálogo" },
                  { icon: CheckCircle, label: "Disponibles", value: availableCount.toString(), color: "#4caf84", sub: "para reservar" },
                  { icon: AlertTriangle, label: "No disponibles", value: unavailableCount.toString(), color: "#d4183d", sub: "fuera de servicio" },
                  { icon: Package, label: "Categorías", value: categories.length.toString(), color: "#7a7890", sub: `${brands.length} marcas` },
                ].map(({ icon: Icon, label, value, color, sub }) => (
                  <div key={label} className="bg-[#12121a] border border-[#c9a84c]/10 rounded-2xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Icon size={15} color={color} />
                      <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: 12, color: "#7a7890" }}>{label}</span>
                    </div>
                    <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 26, fontWeight: 700, color }} className="mb-0.5">{value}</div>
                    <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 11, color: "#7a7890" }}>{sub}</div>
                  </div>
                ))}
              </div>
            )}

            {adminTab === "fleet" && (
              <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                {vehicles.map((v) => (
                  <div key={v.id} className="flex items-center gap-3 bg-[#12121a] border border-[#c9a84c]/10 rounded-xl px-4 py-3 hover:border-[#c9a84c]/30 transition-colors group">
                    <div className="w-14 h-10 rounded-lg overflow-hidden flex-shrink-0 bg-[#1a1a24]">
                      <img src={v.img} alt={v.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: 13, fontWeight: 600, color: "#f0ede8" }} className="truncate">{v.name}</span>
                        {v.isNew && (
                          <span className="flex-shrink-0 bg-[#c9a84c] px-1.5 py-0.5 rounded-full"
                            style={{ fontSize: 9, color: "#0a0a0f", fontWeight: 700, letterSpacing: "0.05em" }}>NUEVO</span>
                        )}
                      </div>
                      <div className="flex items-center gap-3">
                        <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: 11, color: "#7a7890" }}>{v.brand} · {v.category}</span>
                        <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "#c9a84c" }}>${v.price}/día</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <div className={`w-2 h-2 rounded-full ${v.available ? "bg-[#4caf84]" : "bg-[#d4183d]"}`} />
                      <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: 11, color: v.available ? "#4caf84" : "#d4183d" }}>
                        {v.available ? "Disponible" : "No disponible"}
                      </span>
                    </div>
                    <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => { setEditingVehicle(v); setShowAdminPanel(true); }}
                        className="w-7 h-7 bg-[#1a1a24] border border-[#c9a84c]/20 rounded-lg flex items-center justify-center hover:bg-[#c9a84c]/15 transition-colors"
                        title="Editar"
                      >
                        <Edit2 size={12} color="#c9a84c" />
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(v.id)}
                        className="w-7 h-7 bg-[#1a1a24] border border-[#d4183d]/20 rounded-lg flex items-center justify-center hover:bg-[#d4183d]/15 transition-colors"
                        title="Eliminar"
                      >
                        <Trash2 size={12} color="#d4183d" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {adminTab === "activity" && (
              <div>
                <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Clock size={16} color="#c9a84c" />
                      <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: 16, fontWeight: 700, color: "#f0ede8" }}>
                        Gestión de Actividades
                      </span>
                    </div>
                    <p style={{ fontFamily: "'Outfit', sans-serif", fontSize: 13, color: "#7a7890" }}>
                      Historial de reservas, devoluciones, usuarios y cambios de flota.
                    </p>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-[#c9a84c]/10 border border-[#c9a84c]/25 text-[#c9a84c]" style={{ fontSize: 12, fontWeight: 600 }}>
                    {activityLog.length} eventos
                  </span>
                </div>

                {activityLog.length === 0 ? (
                  <div className="bg-[#12121a] border border-[#c9a84c]/10 rounded-2xl p-10 text-center">
                    <Clock size={34} color="#7a7890" className="mx-auto mb-3 opacity-50" />
                    <p style={{ fontFamily: "'Outfit', sans-serif", fontSize: 14, color: "#7a7890" }}>
                      Aún no hay actividades registradas.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
                    {activityLog.map((entry) => {
                      const categoryColor =
                        entry.category === "reservas" ? "#c9a84c" :
                        entry.category === "usuarios" ? "#4caf84" :
                        entry.category === "flota" ? "#60a5fa" : "#7a7890";
                      const roleLabel = entry.actorRole === "admin" ? "Administrador" : entry.actorRole === "secretary" ? "Secretario/a" : "Cliente";
                      const date = new Date(entry.timestamp);

                      return (
                        <div key={entry.id} className="bg-[#12121a] border border-[#c9a84c]/10 rounded-2xl p-4 flex gap-4">
                          <div className="flex flex-col items-center">
                            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: `${categoryColor}22`, border: `1px solid ${categoryColor}44` }}>
                              <Clock size={15} color={categoryColor} />
                            </div>
                            <div className="w-px flex-1 bg-[#c9a84c]/10 mt-2" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-3 mb-1">
                              <div>
                                <h4 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 14, fontWeight: 700, color: "#f0ede8" }}>
                                  {entry.action}
                                </h4>
                                <p style={{ fontFamily: "'Outfit', sans-serif", fontSize: 13, color: "#7a7890", lineHeight: 1.5 }}>
                                  {entry.detail}
                                </p>
                              </div>
                              <span className="px-2 py-1 rounded-lg flex-shrink-0" style={{ fontSize: 10, color: categoryColor, background: `${categoryColor}18`, border: `1px solid ${categoryColor}30`, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                                {entry.category}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 flex-wrap" style={{ fontFamily: "'Outfit', sans-serif", fontSize: 11, color: "#7a7890" }}>
                              <span>{entry.actorName}</span>
                              <span>·</span>
                              <span>{roleLabel}</span>
                              <span>·</span>
                              <span>{date.toLocaleDateString()} {date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {adminTab === "users" && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Users size={16} color="#c9a84c" />
                      <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: 16, fontWeight: 700, color: "#f0ede8" }}>
                        Gestión de Usuarios
                      </span>
                    </div>
                    <p style={{ fontFamily: "'Outfit', sans-serif", fontSize: 13, color: "#7a7890" }}>
                      Crea y administra cuentas de clientes y secretarios.
                    </p>
                  </div>
                  <button
                    onClick={openCreateUserModal}
                    className="flex items-center gap-2 px-4 py-2 bg-[#c9a84c] hover:bg-[#d4b860] rounded-xl transition-all"
                    style={{ fontFamily: "'Outfit', sans-serif", fontSize: 13, fontWeight: 700, color: "#0a0a0f" }}
                  >
                    <Plus size={14} />
                    Crear usuario
                  </button>
                </div>
                <div className="mb-4">
                  <div className="relative max-w-md">
                    <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#7a7890]" />
                    <input
                      value={userSearch}
                      onChange={(e) => setUserSearch(e.target.value)}
                      placeholder="Buscar usuario por nombre, correo o rol"
                      className="w-full pl-11 pr-4 py-3 rounded-2xl bg-[#1a1a24] border border-[#c9a84c]/15 text-[#f0ede8] outline-none placeholder:text-[#7a7890]"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(users)
                    .filter(([email, user]) => {
                      const search = userSearch.trim().toLowerCase();
                      if (!search) return true;
                      const name = typeof user?.name === "string" ? user.name.toLowerCase() : "";
                      const role = typeof user?.role === "string" ? user.role.toLowerCase() : "";
                      return (
                        name.includes(search) ||
                        email.toLowerCase().includes(search) ||
                        role.includes(search)
                      );
                    })
                    .map(([email, user]) => (
                      <div key={email} className="bg-[#12121a] border border-[#c9a84c]/10 rounded-2xl p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <p style={{ fontFamily: "'Outfit', sans-serif", fontSize: 14, fontWeight: 700, color: "#f0ede8" }}>{user.name}</p>
                            <p style={{ fontFamily: "'Outfit', sans-serif", fontSize: 12, color: "#7a7890" }}>{email}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-1 rounded-full text-[11px] font-semibold" style={{ background: user.role === "secretary" ? "rgba(76,175,132,0.12)" : "rgba(201,168,76,0.12)", color: user.role === "secretary" ? "#4caf84" : "#c9a84c" }}>
                              {user.role}
                            </span>
                            <button
                              type="button"
                              onClick={() => openEditUserModal(email, user)}
                              className="w-8 h-8 bg-[#1a1a24] border border-[#c9a84c]/20 rounded-lg flex items-center justify-center hover:bg-[#c9a84c]/15 hover:border-[#c9a84c]/40 transition-colors"
                              title="Editar usuario"
                            >
                              <Edit2 size={13} color="#c9a84c" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setUserDeleteConfirm(email)}
                              className="w-8 h-8 bg-[#1a1a24] border border-[#d4183d]/20 rounded-lg flex items-center justify-center hover:bg-[#d4183d]/15 hover:border-[#d4183d]/40 transition-colors"
                              title="Eliminar usuario"
                            >
                              <Trash2 size={13} color="#d4183d" />
                            </button>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3 text-sm text-[#7a7890]">
                          <div>
                            <p className="font-medium text-[#f0ede8]">Teléfono</p>
                            <p>{user.phone}</p>
                          </div>
                          <div>
                            <p className="font-medium text-[#f0ede8]">Ciudad</p>
                            <p>{user.city}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}

            <div className="mt-4 flex justify-end">
              <button
                onClick={onGoToFleet}
                className="flex items-center gap-2 text-[#c9a84c] hover:underline underline-offset-2 transition-all"
                style={{ fontFamily: "'Outfit', sans-serif", fontSize: 13 }}
              >
                Ver flota completa
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {statsCards.map(({ icon: Icon, label, value, sub }) => (
          <div key={label} className="bg-[#12121a] border border-[#c9a84c]/10 rounded-2xl p-5 hover:border-[#c9a84c]/30 transition-colors">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 bg-[#c9a84c]/10 rounded-lg flex items-center justify-center">
                <Icon size={15} color="#c9a84c" />
              </div>
              <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: 12, color: "#7a7890" }}>{label}</span>
            </div>
            <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 700, color: "#f0ede8" }}>{value}</div>
            <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 11, color: "#7a7890" }} className="mt-0.5">{sub}</div>
          </div>
        ))}
      </div>

      {userRole === "secretary" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-5 mb-8">
          <div className="bg-[#12121a] border border-[#c9a84c]/10 rounded-2xl p-5">
            <LineChart data={weekData.map((d) => ({ name: d.day, value: d.spent }))} label="Gastos Semanales" />
          </div>

          <div className="bg-[#12121a] border border-[#c9a84c]/10 rounded-2xl p-5">
            <LineChart data={monthData.map((d) => ({ name: d.month, value: d.spent }))} label="Gastos Mensuales" />
          </div>

          <div className="bg-[#12121a] border border-[#c9a84c]/10 rounded-2xl p-5">
            <PieChart
              data={[
                {
                  name: "Activas",
                  value: activeReservationsCount,
                  color: "#c9a84c",
                },
                {
                  name: "Finalizadas",
                  value: finishedReservationsCount,
                  color: "#f59e0b",
                },
                {
                  name: "Completadas",
                  value: reservations.filter((r) => getEffectiveStatus(r) === "completada").length,
                  color: "#4caf84",
                },
                {
                  name: "Canceladas",
                  value: reservations.filter((r) => r.status === "cancelada").length,
                  color: "#d4183d",
                },
              ]}
              label="Reservas por Estado"
            />
          </div>

          <div className="bg-[#12121a] border border-[#c9a84c]/10 rounded-2xl p-5">
            <BarChart
              data={clientSpendingData.map(([name, value]) => ({ name, value }))}
              label="Top 5 Clientes por Gasto"
            />
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Reservations list */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 16, fontWeight: 600, color: "#f0ede8" }}>{reservationTitle}</h3>
            <div className="flex gap-1">
              {[
                { id: "todas", label: "Todas" },
                { id: "activas", label: "Activas" },
                { id: "historial", label: "Historial" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  style={{ fontFamily: "'Outfit', sans-serif", fontSize: 12, fontWeight: 500 }}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    activeTab === tab.id ? "bg-[#c9a84c]/15 text-[#c9a84c]" : "text-[#7a7890] hover:text-[#f0ede8]"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            {filtered.length === 0 && (
              <div className="bg-[#12121a] border border-[#c9a84c]/10 rounded-2xl p-10 flex flex-col items-center text-center">
                <Car size={36} color="#7a7890" className="mb-3 opacity-40" />
                <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: 14, color: "#7a7890" }}>No tienes reservas aún</span>
              </div>
            )}
            {filtered.map((res) => {
              const status = getEffectiveStatus(res);
              const sc = statusConfig[status] || statusConfig.completada;
              return (
                <div
                  key={res.id}
                  onClick={() => setSelectedReservation(res)}
                  className="bg-[#12121a] border border-[#c9a84c]/10 rounded-2xl overflow-hidden hover:border-[#c9a84c]/40 transition-all group cursor-pointer"
                >
                  <div className="flex">
                    <div className="w-36 h-28 flex-shrink-0 overflow-hidden bg-[#1a1a24]">
                      <img src={res.img} alt={res.vehicle} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    </div>
                    <div className="flex-1 p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: 15, fontWeight: 600, color: "#f0ede8" }}>{res.vehicle}</span>
                            <span
                              className="px-2 py-0.5 rounded-full"
                              style={{ fontFamily: "'Outfit', sans-serif", fontSize: 10, fontWeight: 600, color: sc.color, background: sc.bg, letterSpacing: "0.05em" }}
                            >
                              {sc.label}
                            </span>
                          </div>
                          <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "#7a7890" }}>{res.id}</span>
                        </div>
                        <div className="text-right">
                          <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 18, fontWeight: 700, color: "#c9a84c" }}>${res.total}</div>
                          <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 11, color: "#7a7890" }}>{getDurationSummary(res)}</div>
                        </div>
                      </div>
                      <div className="flex gap-4 flex-wrap">
                        <div className="flex items-center gap-1.5">
                          <Calendar size={12} color="#7a7890" />
                          <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: 12, color: "#7a7890" }}>
                            {res.pickup} → {res.dropoff}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <MapPin size={12} color="#7a7890" />
                          <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: 12, color: "#7a7890" }}>{res.location}</span>
                        </div>
                      </div>
                      {res.clientName && (
                        <div className="mt-3 text-sm text-[#7a7890]">
                          <p className="font-medium text-[#f0ede8]">Cliente</p>
                          <p>{res.clientName} · {res.clientEmail || "sin email"}</p>
                        </div>
                      )}
                      {status === "finalizada" && (
                        <div className="mt-3 rounded-xl border border-[#f59e0b]/25 bg-[#f59e0b]/8 px-3 py-2">
                          <p style={{ fontFamily: "'Outfit', sans-serif", fontSize: 12, color: "#f0ede8", lineHeight: 1.45 }}>
                            El plazo del alquiler termino. Tiene 12 horas para devolver el vehiculo; despues se cobrara por dia adicional segun la tarifa del vehiculo.
                          </p>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center pr-4">
                      <ChevronRight size={16} color="#7a7890" className="group-hover:text-[#c9a84c] transition-colors" />
                    </div>
                  </div>
                  {(status === "activa" || status === "finalizada" || (status === "cancelada" && userRole === "client" && !isAdmin)) && (
                    <div className="bg-[#0a0a0f] border-t border-[#c9a84c]/10 p-4 flex justify-end gap-2 flex-wrap">
                      {res.invoice && (
                        <button
                          type="button"
                          className="px-4 py-2 rounded-xl border border-[#c9a84c]/40 text-[#c9a84c] hover:bg-[#c9a84c]/10 transition-colors flex items-center gap-2"
                          onClick={(e) => {
                            e.stopPropagation();
                            downloadInvoicePDF(res.invoice);
                          }}
                        >
                          <Download size={14} />
                          Factura
                        </button>
                      )}
                      {status === "activa" && (
                      <button
                        type="button"
                        className="px-4 py-2 rounded-xl border border-[#d4183d]/40 text-[#d4183d] hover:bg-[#d4183d]/10 transition-colors"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (window.confirm("¿Deseas cancelar esta reserva?")) {
                            onCancelReservation?.(res.id);
                          }
                        }}
                      >
                        CANCELAR
                      </button>
                      )}
                      {status === "finalizada" && userRole === "secretary" && (
                        <button
                          type="button"
                          className="px-4 py-2 rounded-xl bg-[#4caf84] text-[#0a0a0f] hover:bg-[#61c596] transition-colors font-semibold"
                          onClick={(e) => {
                            e.stopPropagation();
                            onReturnReservation?.(res.id);
                          }}
                        >
                          DEVUELTO
                        </button>
                      )}
                      {status === "cancelada" && userRole === "client" && !isAdmin && (
                        <button
                          type="button"
                          className="px-4 py-2 rounded-xl border border-[#d4183d]/40 text-[#d4183d] hover:bg-[#d4183d]/10 transition-colors flex items-center gap-2"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (window.confirm("¿Ocultar esta reserva cancelada de tu historial?")) hideCancelledReservation(res.id);
                          }}
                        >
                          <Trash2 size={14} />
                          BORRAR DEL HISTORIAL
                        </button>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Side widgets */}
        <div className="space-y-5">
          {/* Spending chart */}
          {userRole !== "secretary" && (
          <div className="bg-[#12121a] border border-[#c9a84c]/10 rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-5">
              <BarChart2 size={16} color="#c9a84c" />
              <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: 14, fontWeight: 600, color: "#f0ede8" }}>Gasto mensual</span>
            </div>
            <div className="flex items-end gap-2 h-28">
              {monthData.map(({ month, spent }) => (
                <div key={month} className="flex-1 flex flex-col items-center gap-1">
                  <div className="w-full flex items-end justify-center" style={{ height: 88 }}>
                    <div
                      className="w-full rounded-t-md transition-all"
                      style={{
                        height: `${(spent / maxSpent) * 88}px`,
                        background: spent > 0 ? "linear-gradient(to top, #c9a84c, #d4b860)" : "#1a1a24",
                        minHeight: 4,
                      }}
                    />
                  </div>
                  <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: 10, color: "#7a7890" }}>{month}</span>
                </div>
              ))}
            </div>
          </div>
          )}

          {false && userRole === "secretary" && (
            <div className="space-y-5">
              {/* Gráfico de Reservas por Estado */}
              <div className="bg-[#12121a] border border-[#c9a84c]/10 rounded-2xl p-6">
                <PieChart
                  data={[
                    {
                      name: "Activas",
                      value: activeReservationsCount,
                      color: "#c9a84c",
                    },
                    {
                      name: "Finalizadas",
                      value: finishedReservationsCount,
                      color: "#f59e0b",
                    },
                    {
                      name: "Completadas",
                      value: reservations.filter((r) => getEffectiveStatus(r) === "completada").length,
                      color: "#4caf84",
                    },
                    {
                      name: "Canceladas",
                      value: reservations.filter((r) => r.status === "cancelada").length,
                      color: "#d4183d",
                    },
                  ]}
                  label="Reservas por Estado"
                />
              </div>

              {/* Gráfico de Gastos Mensuales */}
              <div className="bg-[#12121a] border border-[#c9a84c]/10 rounded-2xl p-6">
                <LineChart data={monthData.map((d) => ({ name: d.month, value: d.spent }))} label="Gastos Mensuales" />
              </div>

              {/* Gráfico de Gastos por Cliente */}
              <div className="bg-[#12121a] border border-[#c9a84c]/10 rounded-2xl p-6">
                <BarChart
                  data={clientSpendingData.map(([name, value]) => ({ name, value }))}
                  label="Top 5 Clientes por Gasto"
                />
              </div>
            </div>
          )}

          {/* Próxima recogida */}
          {activeReservation ? (
            <div className="bg-[#12121a] border border-[#c9a84c]/15 rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-2 h-2 rounded-full bg-[#c9a84c] animate-pulse" />
                <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: 14, fontWeight: 600, color: "#f0ede8" }}>Próxima recogida</span>
              </div>
              <div className="bg-[#1a1a24] rounded-xl p-4">
                <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 14, fontWeight: 600, color: "#f0ede8" }} className="mb-1">
                  {activeReservation.vehicle}
                </div>
                <div className="flex items-center gap-2 mb-3">
                  <Calendar size={13} color="#c9a84c" />
                  <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 13, color: "#c9a84c" }}>{activeReservation.pickup} · 10:00</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin size={13} color="#7a7890" />
                  <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: 13, color: "#7a7890" }}>{activeReservation.location?.split(",")[0]}</span>
                </div>
              </div>
              <button
                onClick={() => setSelectedReservation(activeReservation)}
                className="mt-3 w-full text-center py-2.5 border border-[#c9a84c]/25 rounded-xl hover:bg-[#c9a84c]/5 hover:border-[#c9a84c]/50 transition-colors"
                style={{ fontFamily: "'Outfit', sans-serif", fontSize: 12, color: "#c9a84c", letterSpacing: "0.05em", fontWeight: 500 }}
              >
                VER DETALLES
              </button>
            </div>
          ) : (
            <div className="bg-[#12121a] border border-[#c9a84c]/15 rounded-2xl p-5 flex flex-col items-center text-center justify-center py-8">
              <Car size={32} color="#7a7890" className="mb-3 opacity-50" />
              <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: 14, color: "#7a7890" }}>No tienes recogidas próximas</span>
            </div>
          )}

          {/* Puntos */}
          <div className="bg-gradient-to-br from-[#c9a84c]/10 to-[#c9a84c]/5 border border-[#c9a84c]/25 rounded-2xl p-5">
            <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 12, color: "#c9a84c", letterSpacing: "0.1em" }} className="mb-2">
              PUNTOS DISPONIBLES
            </div>
            <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 32, fontWeight: 700, color: "#c9a84c" }}>
              {Math.floor(reservations.reduce((s, r) => s + (r.total || 0), 0) * 0.5).toLocaleString()}
            </div>
            <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 13, color: "#7a7890" }} className="mb-4">
              ≈ ${Math.floor(reservations.reduce((s, r) => s + (r.total || 0), 0) * 0.025)} en descuentos
            </div>
            <div className="h-1.5 bg-[#1a1a24] rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#c9a84c] to-[#d4b860] rounded-full"
                style={{ width: `${Math.min((Math.floor(reservations.reduce((s, r) => s + (r.total || 0), 0) * 0.5) / 2000) * 100, 100)}%` }}
              />
            </div>
            <div className="flex justify-between mt-1">
              <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: 11, color: "#7a7890" }}>
                {Math.floor(reservations.reduce((s, r) => s + (r.total || 0), 0) * 0.5).toLocaleString()} / 2.000 para Platinum
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ====== RESERVATION DETAIL MODAL ====== */}
      {selectedReservation && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#0a0a0f]/85 backdrop-blur-md p-4"
          onClick={() => setSelectedReservation(null)}
        >
          <div
            className="bg-[#12121a] border border-[#c9a84c]/20 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl relative flex flex-col"
            style={{ maxHeight: "90vh" }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="absolute top-4 right-4 z-10 w-9 h-9 bg-[#0a0a0f]/60 backdrop-blur-sm rounded-full flex items-center justify-center text-[#f0ede8] hover:bg-[#c9a84c] hover:text-[#0a0a0f] transition-all"
              onClick={() => setSelectedReservation(null)}
            >
              <X size={16} />
            </button>

            <div className="h-56 sm:h-72 relative bg-[#1a1a24] flex-shrink-0">
              <img src={selectedReservation.img} alt={selectedReservation.vehicle} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#12121a] via-[#12121a]/10 to-transparent" />
              <div className="absolute bottom-4 left-6">
                <span
                  className="px-3 py-1 rounded-full text-xs font-semibold"
                  style={{
                    fontFamily: "'Outfit', sans-serif",
                    color: statusConfig[getEffectiveStatus(selectedReservation)]?.color || "#c9a84c",
                    background: statusConfig[getEffectiveStatus(selectedReservation)]?.bg || "rgba(201,168,76,0.12)",
                    letterSpacing: "0.08em",
                  }}
                >
                  {statusConfig[getEffectiveStatus(selectedReservation)]?.label}
                </span>
              </div>
            </div>

            <div className="p-6 sm:p-8 overflow-y-auto flex-1">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 26, fontWeight: 700, color: "#f0ede8" }}>
                    {selectedReservation.vehicle}
                  </h3>
                  <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 13, color: "#c9a84c" }}>
                    {selectedReservation.id}
                  </span>
                </div>
                <div className="text-right">
                  <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 26, fontWeight: 700, color: "#c9a84c" }}>
                    ${selectedReservation.total}
                  </div>
                  <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 12, color: "#7a7890" }}>
                    {getRateSummary(selectedReservation)}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                {/* Dates */}
                <div className="bg-[#1a1a24] rounded-2xl p-5 border border-[#c9a84c]/8">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-7 h-7 bg-[#c9a84c]/12 rounded-lg flex items-center justify-center">
                      <Calendar size={14} color="#c9a84c" />
                    </div>
                    <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: 13, fontWeight: 600, color: "#f0ede8" }}>Fechas</span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: 12, color: "#7a7890" }}>Recogida</span>
                      <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: 13, color: "#f0ede8", fontWeight: 500 }}>{selectedReservation.pickup}</span>
                    </div>
                    <div className="h-px bg-[#c9a84c]/8" />
                    <div className="flex justify-between items-center">
                      <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: 12, color: "#7a7890" }}>Devolución</span>
                      <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: 13, color: "#f0ede8", fontWeight: 500 }}>{selectedReservation.dropoff}</span>
                    </div>
                    <div className="h-px bg-[#c9a84c]/8" />
                    <div className="flex justify-between items-center">
                      <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: 12, color: "#7a7890" }}>Duración</span>
                      <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 13, color: "#c9a84c", fontWeight: 600 }}>{getDurationSummary(selectedReservation)}</span>
                    </div>
                  </div>
                </div>

                {/* Client info */}
                <div className="bg-[#1a1a24] rounded-2xl p-5 border border-[#c9a84c]/8">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-7 h-7 bg-[#c9a84c]/12 rounded-lg flex items-center justify-center">
                      <Users size={14} color="#c9a84c" />
                    </div>
                    <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: 13, fontWeight: 600, color: "#f0ede8" }}>Cliente</span>
                  </div>
                  <div className="space-y-2 text-sm text-[#7a7890]">
                    <div>
                      <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 12, color: "#7a7890" }}>Nombre</div>
                      <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 13, color: "#f0ede8", fontWeight: 500 }}>{selectedReservation.clientName || "Desconocido"}</div>
                    </div>
                    <div>
                      <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 12, color: "#7a7890" }}>Correo</div>
                      <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 13, color: "#f0ede8", fontWeight: 500 }}>{selectedReservation.clientEmail || "No registrado"}</div>
                    </div>
                    <div>
                      <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 12, color: "#7a7890" }}>Teléfono</div>
                      <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 13, color: "#f0ede8", fontWeight: 500 }}>{selectedReservation.clientPhone || "No registrado"}</div>
                    </div>
                  </div>
                </div>

                {/* Vehicle info */}
                <div className="bg-[#1a1a24] rounded-2xl p-5 border border-[#c9a84c]/8">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-7 h-7 bg-[#c9a84c]/12 rounded-lg flex items-center justify-center">
                      <Car size={14} color="#c9a84c" />
                    </div>
                    <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: 13, fontWeight: 600, color: "#f0ede8" }}>Vehículo</span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: 12, color: "#7a7890" }}>Categoría</span>
                      <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: 12, color: "#f0ede8" }}>{selectedReservation.category}</span>
                    </div>
                  </div>
                </div>

                {/* Payment */}
                <div className="bg-[#1a1a24] rounded-2xl p-5 border border-[#c9a84c]/8">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-7 h-7 bg-[#c9a84c]/12 rounded-lg flex items-center justify-center">
                      <Shield size={14} color="#c9a84c" />
                    </div>
                    <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: 13, fontWeight: 600, color: "#f0ede8" }}>Resumen de pago</span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: 12, color: "#7a7890" }}>Subtotal</span>
                      <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: 12, color: "#f0ede8" }}>${(selectedReservation.subtotal ?? selectedReservation.total).toFixed?.(2) ?? selectedReservation.total}</span>
                    </div>
                    <div className="flex justify-between">
                      <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: 12, color: "#7a7890" }}>IVA (15%)</span>
                      <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: 12, color: "#f0ede8" }}>${(selectedReservation.iva ?? 0).toFixed?.(2) ?? 0}</span>
                    </div>
                    <div className="h-px bg-[#c9a84c]/10 my-1" />
                    <div className="flex justify-between">
                      <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: 13, fontWeight: 600, color: "#f0ede8" }}>Total</span>
                      <span style={{ fontFamily: "'Playfair Display', serif", fontSize: 15, fontWeight: 700, color: "#c9a84c" }}>${Number(selectedReservation.total).toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {getEffectiveStatus(selectedReservation) === "finalizada" && (
                <div className="mb-6 rounded-2xl border border-[#f59e0b]/30 bg-[#f59e0b]/10 p-4">
                  <div className="flex items-start gap-3">
                    <AlertTriangle size={18} color="#f59e0b" className="mt-0.5 flex-shrink-0" />
                    <div>
                      <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 13, fontWeight: 700, color: "#f59e0b", letterSpacing: "0.04em" }}>
                        ENTREGA PENDIENTE
                      </div>
                      <p style={{ fontFamily: "'Outfit', sans-serif", fontSize: 13, color: "#f0ede8", lineHeight: 1.6, marginTop: 4 }}>
                        El plazo del alquiler termino. Tiene 12 horas para devolver el vehiculo; despues se cobrara por dia adicional segun la tarifa del vehiculo.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex gap-3 flex-wrap">
                {selectedReservation.invoice && (
                  <button
                    className="flex-1 min-w-[150px] border border-[#c9a84c]/40 text-[#c9a84c] hover:bg-[#c9a84c]/8 rounded-xl py-3.5 transition-all flex items-center justify-center gap-2"
                    style={{ fontFamily: "'Outfit', sans-serif", fontSize: 13, fontWeight: 700, letterSpacing: "0.06em" }}
                    onClick={() => {
                      downloadInvoicePDF(selectedReservation.invoice);
                    }}
                  >
                    <Download size={14} />
                    DESCARGAR FACTURA
                  </button>
                )}
                <button
                  className="flex-1 min-w-[150px] bg-[#c9a84c] hover:bg-[#d4b860] text-[#0a0a0f] rounded-xl py-3.5 transition-all hover:scale-[1.01] active:scale-[0.99]"
                  style={{ fontFamily: "'Outfit', sans-serif", fontSize: 13, fontWeight: 700, letterSpacing: "0.06em" }}
                  onClick={() => setSelectedReservation(null)}
                >
                  CERRAR DETALLES
                </button>
                {getEffectiveStatus(selectedReservation) === "activa" && (
                  <button
                    className="flex-1 min-w-[150px] border border-[#d4183d]/40 text-[#d4183d] hover:bg-[#d4183d]/8 rounded-xl py-3.5 transition-all"
                    style={{ fontFamily: "'Outfit', sans-serif", fontSize: 13, fontWeight: 700, letterSpacing: "0.06em" }}
                    onClick={() => {
                      onCancelReservation?.(selectedReservation.id);
                      setSelectedReservation(null);
                    }}
                  >
                    CANCELAR RESERVA
                  </button>
                )}
                {getEffectiveStatus(selectedReservation) === "finalizada" && userRole === "secretary" && (
                  <button
                    className="flex-1 min-w-[150px] bg-[#4caf84] hover:bg-[#61c596] text-[#0a0a0f] rounded-xl py-3.5 transition-all hover:scale-[1.01] active:scale-[0.99]"
                    style={{ fontFamily: "'Outfit', sans-serif", fontSize: 13, fontWeight: 700, letterSpacing: "0.06em" }}
                    onClick={() => {
                      onReturnReservation?.(selectedReservation.id);
                      setSelectedReservation(null);
                    }}
                  >
                    DEVUELTO
                  </button>
                )}
                {getEffectiveStatus(selectedReservation) === "cancelada" && userRole === "client" && !isAdmin && (
                  <button
                    className="flex-1 min-w-[150px] border border-[#d4183d]/40 text-[#d4183d] hover:bg-[#d4183d]/8 rounded-xl py-3.5 transition-all flex items-center justify-center gap-2"
                    style={{ fontFamily: "'Outfit', sans-serif", fontSize: 13, fontWeight: 700 }}
                    onClick={() => hideCancelledReservation(selectedReservation.id)}
                  >
                    <Trash2 size={14} /> BORRAR DEL HISTORIAL
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Admin Panel Modal */}
      {showAdminPanel && (
        <AdminPanel
          vehicle={editingVehicle}
          existingVehicles={vehicles}
          onSave={handleSaveVehicle}
          onClose={() => { setShowAdminPanel(false); setEditingVehicle(null); }}
        />
      )}

      {/* Create User Modal */}
      {showUserModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0a0a0f]/85 backdrop-blur-md p-4" onClick={() => { resetUserForm(); setShowUserModal(false); }}>
          <div className="bg-[#12121a] border border-[#c9a84c]/20 rounded-3xl w-full max-w-xl p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 24, fontWeight: 700, color: "#f0ede8" }}>{editingUserEmail ? "Editar usuario" : "Crear nuevo usuario"}</h3>
                <p style={{ fontFamily: "'Outfit', sans-serif", fontSize: 13, color: "#7a7890" }}>{editingUserEmail ? "Actualiza la informacion, credenciales y rol de la cuenta." : "Registra un cliente o un secretario para la plataforma."}</p>
              </div>
              <button className="text-[#7a7890] hover:text-[#f0ede8]" onClick={() => { resetUserForm(); setShowUserModal(false); }}>
                <X size={20} />
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label style={{ fontFamily: "'Outfit', sans-serif", fontSize: 11, color: "#7a7890", letterSpacing: "0.1em" }} className="block mb-1.5">Nombres</label>
                <input type="text" value={newUserName} onChange={(e) => setNewUserName(e.target.value)} className="w-full bg-[#1a1a24] border border-[#c9a84c]/15 rounded-2xl px-4 py-3 text-[#f0ede8] outline-none" placeholder="Ana María" />
              </div>
              <div>
                <label style={{ fontFamily: "'Outfit', sans-serif", fontSize: 11, color: "#7a7890", letterSpacing: "0.1em" }} className="block mb-1.5">Apellidos</label>
                <input type="text" value={newUserLastName} onChange={(e) => setNewUserLastName(e.target.value)} className="w-full bg-[#1a1a24] border border-[#c9a84c]/15 rounded-2xl px-4 py-3 text-[#f0ede8] outline-none" placeholder="Moreno Zambrano" />
              </div>
              <div>
                <label style={{ fontFamily: "'Outfit', sans-serif", fontSize: 11, color: "#7a7890", letterSpacing: "0.1em" }} className="block mb-1.5">Correo electrónico</label>
                <input type="text" value={newUserEmail} onChange={(e) => setNewUserEmail(e.target.value)} className="w-full bg-[#1a1a24] border border-[#c9a84c]/15 rounded-2xl px-4 py-3 text-[#f0ede8] outline-none" placeholder="ana@renta.com" />
              </div>
              <div>
                <label style={{ fontFamily: "'Outfit', sans-serif", fontSize: 11, color: "#7a7890", letterSpacing: "0.1em" }} className="block mb-1.5">Teléfono</label>
                <input type="text" value={newUserPhone} onChange={(e) => setNewUserPhone(e.target.value)} className="w-full bg-[#1a1a24] border border-[#c9a84c]/15 rounded-2xl px-4 py-3 text-[#f0ede8] outline-none" placeholder="+593 9XX XXX XXX" />
              </div>
              <div>
                <label style={{ fontFamily: "'Outfit', sans-serif", fontSize: 11, color: "#7a7890", letterSpacing: "0.1em" }} className="block mb-1.5">Ciudad</label>
                <input list="ecuador-cities-admin" type="text" value={newUserCity} onChange={(e) => setNewUserCity(e.target.value)} autoComplete="off" className="w-full bg-[#1a1a24] border border-[#c9a84c]/15 rounded-2xl px-4 py-3 text-[#f0ede8] outline-none" placeholder="Escribe para buscar, ej. Manta" />
                <datalist id="ecuador-cities-admin">
                  {ECUADOR_CITIES.map((ecuadorCity) => <option key={ecuadorCity} value={ecuadorCity} />)}
                </datalist>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label style={{ fontFamily: "'Outfit', sans-serif", fontSize: 11, color: "#7a7890", letterSpacing: "0.1em" }} className="block mb-1.5">Contraseña</label>
                <input type="password" value={newUserPassword} onChange={(e) => setNewUserPassword(e.target.value)} className="w-full bg-[#1a1a24] border border-[#c9a84c]/15 rounded-2xl px-4 py-3 text-[#f0ede8] outline-none" placeholder={editingUserEmail ? "Dejar igual" : "******"} />
              </div>
              <div>
                <label style={{ fontFamily: "'Outfit', sans-serif", fontSize: 11, color: "#7a7890", letterSpacing: "0.1em" }} className="block mb-1.5">Rol</label>
                <select value={newUserRole} onChange={(e) => setNewUserRole(e.target.value as "client" | "secretary")} className="w-full bg-[#1a1a24] border border-[#c9a84c]/15 rounded-2xl px-4 py-3 text-[#f0ede8] outline-none">
                  <option value="client">Cliente</option>
                  <option value="secretary">Secretario/a</option>
                </select>
              </div>
            </div>
            {userCreateError && (
              <div className="mb-4 text-[#d4183d] text-sm">{userCreateError}</div>
            )}
            <div className="flex gap-3 justify-end">
              <button onClick={() => { resetUserForm(); setShowUserModal(false); }} className="px-5 py-3 rounded-xl border border-[#c9a84c]/20 text-[#7a7890] hover:bg-[#c9a84c]/5 transition-colors">
                Cancelar
              </button>
              <button onClick={handleCreateUser} className="px-5 py-3 rounded-xl bg-[#c9a84c] text-[#0a0a0f] font-semibold hover:bg-[#d4b860] transition-colors">
                {editingUserEmail ? "Guardar cambios" : "Crear usuario"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete User Confirm Modal */}
      {userDeleteConfirm !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#0a0a0f]/85 backdrop-blur-md p-4"
          onClick={() => setUserDeleteConfirm(null)}
        >
          <div
            className="bg-[#12121a] border border-[#d4183d]/30 rounded-2xl p-7 max-w-sm w-full text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-14 h-14 bg-[#d4183d]/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 size={22} color="#d4183d" />
            </div>
            <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, fontWeight: 700, color: "#f0ede8" }} className="mb-2">
              Eliminar usuario
            </h3>
            <p style={{ fontFamily: "'Outfit', sans-serif", fontSize: 14, color: "#7a7890", lineHeight: 1.6 }} className="mb-2">
              {users[userDeleteConfirm]?.name || "Usuario"} · {userDeleteConfirm}
            </p>
            <p style={{ fontFamily: "'Outfit', sans-serif", fontSize: 13, color: "#7a7890", lineHeight: 1.6 }} className="mb-6">
              Esta accion no se puede deshacer.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setUserDeleteConfirm(null)}
                className="flex-1 py-3 border border-[#c9a84c]/20 rounded-xl hover:bg-[#c9a84c]/5 transition-colors"
                style={{ fontFamily: "'Outfit', sans-serif", fontSize: 13, fontWeight: 600, color: "#7a7890" }}
              >
                CANCELAR
              </button>
              <button
                onClick={confirmDeleteUser}
                className="flex-1 py-3 bg-[#d4183d] hover:bg-[#e01e45] rounded-xl transition-colors"
                style={{ fontFamily: "'Outfit', sans-serif", fontSize: 13, fontWeight: 700, color: "#fff", letterSpacing: "0.05em" }}
              >
                ELIMINAR
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm Modal */}
      {deleteConfirm !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#0a0a0f]/85 backdrop-blur-md p-4"
          onClick={() => setDeleteConfirm(null)}
        >
          <div
            className="bg-[#12121a] border border-[#d4183d]/30 rounded-2xl p-7 max-w-sm w-full text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-14 h-14 bg-[#d4183d]/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 size={22} color="#d4183d" />
            </div>
            <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, fontWeight: 700, color: "#f0ede8" }} className="mb-2">
              ¿Eliminar vehículo?
            </h3>
            <p style={{ fontFamily: "'Outfit', sans-serif", fontSize: 14, color: "#7a7890", lineHeight: 1.6 }} className="mb-6">
              Esta acción no se puede deshacer.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 py-3 border border-[#c9a84c]/20 rounded-xl hover:bg-[#c9a84c]/5 transition-colors"
                style={{ fontFamily: "'Outfit', sans-serif", fontSize: 13, fontWeight: 600, color: "#7a7890" }}
              >
                CANCELAR
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 py-3 bg-[#d4183d] hover:bg-[#e01e45] rounded-xl transition-colors"
                style={{ fontFamily: "'Outfit', sans-serif", fontSize: 13, fontWeight: 700, color: "#fff", letterSpacing: "0.05em" }}
              >
                ELIMINAR
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
