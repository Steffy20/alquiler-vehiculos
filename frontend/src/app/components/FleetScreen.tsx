import { useState } from "react";
import { Star, Fuel, Users, Settings, Heart, ArrowRight, SlidersHorizontal, X, Plus, Edit2, Trash2, Clock, Shield } from "lucide-react";
import type { Vehicle } from "../App";
import { AdminPanel } from "./AdminPanel";
import { BRANCH_CITIES, createBranchInventory, inventoryTotals, type BranchCity } from "../utils/branches";

interface FleetScreenProps {
  vehicles: Vehicle[];
  isAdmin: boolean;
  onSelect: (vehicle: Vehicle) => void;
  onAddVehicle: (v: Vehicle) => void;
  onUpdateVehicle: (v: Vehicle) => void;
  onDeleteVehicle: (id: number) => void;
  eyebrow?: string;
  title?: string;
  description?: string;
}

const RECENT_DAYS = 30;

function isRecent(v: Vehicle): boolean {
  if (v.isNew) return true;
  if (!v.addedAt) return false;
  const added = new Date(v.addedAt).getTime();
  const now = Date.now();
  return (now - added) / (1000 * 60 * 60 * 24) <= RECENT_DAYS;
}

export function FleetScreen({
  vehicles,
  isAdmin,
  onSelect,
  onAddVehicle,
  onUpdateVehicle,
  onDeleteVehicle,
  eyebrow = "NUESTROS VEHÍCULOS",
  title = "VehÃ­culos disponibles",
  description,
}: FleetScreenProps) {
  const [activeCategory, setActiveCategory] = useState("Todos");
  const [activeBrand, setActiveBrand] = useState("Todas");
  const [activeCity, setActiveCity] = useState<"General" | BranchCity>("General");
  const [availabilityFilter, setAvailabilityFilter] = useState<"Todos" | "Disponibles" | "No disponibles">("Todos");
  const [favorites, setFavorites] = useState<number[]>([]);
  const [maxPrice, setMaxPrice] = useState(500);
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState("Precio ↑");
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);

  // Derived dynamically from vehicles list
  const categories = ["Todos", "Recientes", ...Array.from(new Set(vehicles.map((v) => v.category))).sort()];
  const brands = ["Todas", ...Array.from(new Set(vehicles.map((v) => v.brand))).sort()];
  const maxVehiclePrice = Math.max(...vehicles.map((v) => v.price), 500);

  const toggleFav = (id: number) =>
    setFavorites((prev) => (prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]));

  const cityInventory = (v: Vehicle) => {
    const branches = v.branches || createBranchInventory(v.stock || 0, v.occupied || 0);
    return activeCity === "General" ? inventoryTotals(branches) : branches[activeCity];
  };
  const isEffectivelyAvailable = (v: Vehicle) => {
    const inventory = cityInventory(v);
    return v.available && inventory.stock - inventory.occupied > 0;
  };

  // Al elegir una sucursal solo pertenecen al resultado los modelos que tienen
  // unidades asignadas allí, aunque todas esas unidades estén ocupadas.
  const vehiclesInSelectedCity = vehicles.filter(
    (v) => activeCity === "General" || cityInventory(v).stock > 0
  );

  const filtered = vehiclesInSelectedCity
    .filter((v) => {
      if (activeCategory === "Todos") return true;
      if (activeCategory === "Recientes") return isRecent(v);
      return v.category === activeCategory;
    })
    .filter((v) => (activeBrand === "Todas" ? true : v.brand === activeBrand))
    .filter((v) => {
      if (availabilityFilter === "Disponibles") return isEffectivelyAvailable(v);
      if (availabilityFilter === "No disponibles") return !isEffectivelyAvailable(v);
      return true;
    })
    .filter((v) => v.price <= maxPrice)
    .sort((a, b) => {
      if (sortBy === "Precio ↑") return a.price - b.price;
      if (sortBy === "Precio ↓") return b.price - a.price;
      if (sortBy === "Mejor valorados") return b.rating - a.rating;
      if (sortBy === "Recientes") return (new Date(b.addedAt ?? 0).getTime()) - (new Date(a.addedAt ?? 0).getTime());
      return 0;
    });
  const displayTitle = title.includes("disponibles") ? "Vehículos disponibles" : title;
  const summaryText = description || `${filtered.length} vehículo${filtered.length !== 1 ? "s" : ""} · ${vehicles.length} en total`;

  const handleSaveVehicle = (v: Vehicle) => {
    if (editingVehicle) {
      onUpdateVehicle(v);
    } else {
      onAddVehicle(v);
    }
    setShowAdminPanel(false);
    setEditingVehicle(null);
  };

  const handleEditClick = (e: React.MouseEvent, vehicle: Vehicle) => {
    e.stopPropagation();
    setEditingVehicle(vehicle);
    setShowAdminPanel(true);
  };

  const handleDeleteClick = (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    setDeleteConfirm(id);
  };

  const confirmDelete = () => {
    if (deleteConfirm !== null) {
      onDeleteVehicle(deleteConfirm);
      setDeleteConfirm(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] px-6 py-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-end justify-between mb-8">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="h-px w-6 bg-[#c9a84c]" />
            <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: 11, color: "#c9a84c", letterSpacing: "0.2em" }}>{eyebrow}</span>
          </div>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, fontSize: 32, color: "#f0ede8" }}>
            {displayTitle}
          </h2>
          <p style={{ fontFamily: "'Outfit', sans-serif", fontSize: 14, color: "#7a7890" }} className="mt-1">
            {summaryText}
          </p>
          <p style={{ fontFamily: "'Outfit', sans-serif", fontSize: 14, color: "#7a7890" }} className="mt-1 hidden">
            {description || `${filtered.length} vehículo${filtered.length !== 1 ? "s" : ""} · ${vehicles.length} en total`}
          </p>
        </div>
        <div className="flex gap-3 items-center flex-wrap justify-end">
          {isAdmin && (
            <button
              onClick={() => { setEditingVehicle(null); setShowAdminPanel(true); }}
              className="flex items-center gap-2 bg-[#c9a84c] hover:bg-[#d4b860] px-4 py-2.5 rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98]"
              style={{ fontFamily: "'Outfit', sans-serif", fontSize: 13, fontWeight: 700, color: "#0a0a0f", letterSpacing: "0.05em" }}
            >
              <Plus size={16} />
              AGREGAR VEHÍCULO
            </button>
          )}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-[#1a1a24] border border-[#c9a84c]/15 rounded-xl px-4 py-2.5 outline-none hover:border-[#c9a84c]/40 transition-colors cursor-pointer"
            style={{ fontFamily: "'Outfit', sans-serif", fontSize: 13, color: "#f0ede8" }}
          >
            <option>Precio ↑</option>
            <option>Precio ↓</option>
            <option>Mejor valorados</option>
            <option>Recientes</option>
          </select>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 border rounded-xl px-4 py-2.5 transition-colors ${
              showFilters ? "bg-[#c9a84c]/10 border-[#c9a84c]/50" : "border-[#c9a84c]/15 hover:border-[#c9a84c]/40"
            }`}
            style={{ fontFamily: "'Outfit', sans-serif", fontSize: 13, color: "#f0ede8" }}
          >
            <SlidersHorizontal size={15} color="#c9a84c" />
            Filtros
          </button>
        </div>
      </div>

      {/* Filter panel */}
      {showFilters && (
        <div className="bg-[#12121a] border border-[#c9a84c]/15 rounded-2xl p-6 mb-6 relative">
          <button onClick={() => setShowFilters(false)} className="absolute top-4 right-4 text-[#7a7890] hover:text-[#f0ede8]">
            <X size={18} />
          </button>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Price */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: 14, fontWeight: 600, color: "#f0ede8" }}>Precio máximo/día</span>
                <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 15, color: "#c9a84c", fontWeight: 500 }}>${maxPrice}</span>
              </div>
              <input
                type="range"
                min={50}
                max={maxVehiclePrice}
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className="w-full accent-[#c9a84c]"
              />
              <div className="flex justify-between mt-2">
                <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: 12, color: "#7a7890" }}>$50</span>
                <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: 12, color: "#7a7890" }}>${maxVehiclePrice}</span>
              </div>
            </div>

            {/* Brand — auto-updated */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: 14, fontWeight: 600, color: "#f0ede8" }}>Marca</span>
                <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: 11, color: "#7a7890" }}>{brands.length - 1} marcas</span>
              </div>
              <select
                value={activeBrand}
                onChange={(e) => setActiveBrand(e.target.value)}
                className="w-full bg-[#1a1a24] border border-[#c9a84c]/15 rounded-xl px-4 py-2.5 outline-none hover:border-[#c9a84c]/40 transition-colors cursor-pointer"
                style={{ fontFamily: "'Outfit', sans-serif", fontSize: 13, color: "#f0ede8" }}
              >
                {brands.map((b) => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
            </div>

            {/* Availability filter */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: 14, fontWeight: 600, color: "#f0ede8" }}>Sucursal</span>
              </div>
              <select value={activeCity} onChange={(e) => setActiveCity(e.target.value as "General" | BranchCity)} className="w-full bg-[#1a1a24] border border-[#c9a84c]/15 rounded-xl px-4 py-2.5 outline-none cursor-pointer" style={{ color: "#f0ede8", fontSize: 13 }}>
                <option value="General">General (todas)</option>
                {BRANCH_CITIES.map((city) => <option key={city} value={city}>{city}</option>)}
              </select>
            </div>

            {/* Availability filter */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: 14, fontWeight: 600, color: "#f0ede8" }}>Disponibilidad</span>
              </div>
              <div className="flex flex-col gap-2">
                {(["Todos", "Disponibles", "No disponibles"] as const).map((opt) => (
                  <button
                    key={opt}
                    onClick={() => setAvailabilityFilter(opt)}
                    className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl border transition-all text-left ${
                      availabilityFilter === opt
                        ? opt === "Disponibles"
                          ? "bg-[#22c55e]/10 border-[#22c55e]/50 text-[#22c55e]"
                          : opt === "No disponibles"
                          ? "bg-[#d4183d]/10 border-[#d4183d]/50 text-[#d4183d]"
                          : "bg-[#c9a84c]/10 border-[#c9a84c]/50 text-[#c9a84c]"
                        : "border-[#c9a84c]/15 text-[#7a7890] hover:border-[#c9a84c]/30 hover:text-[#f0ede8]"
                    }`}
                    style={{ fontFamily: "'Outfit', sans-serif", fontSize: 13, fontWeight: 500 }}
                  >
                    <span style={{ width: 8, height: 8, borderRadius: "50%", background: opt === "Disponibles" ? "#22c55e" : opt === "No disponibles" ? "#d4183d" : "#c9a84c", display: "inline-block", flexShrink: 0 }} />
                    {opt}
                    <span className="ml-auto" style={{ fontSize: 11, opacity: 0.7 }}>
                      {opt === "Todos" ? vehiclesInSelectedCity.length : opt === "Disponibles" ? vehiclesInSelectedCity.filter(isEffectivelyAvailable).length : vehiclesInSelectedCity.filter(v => !isEffectivelyAvailable(v)).length}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Category tabs — derived dynamically */}
      <div className="flex gap-2 mb-8 overflow-x-auto pb-2 scrollbar-hide">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            style={{ fontFamily: "'Outfit', sans-serif", fontSize: 13, fontWeight: 500, whiteSpace: "nowrap" }}
            className={`px-5 py-2 rounded-full transition-all flex items-center gap-1.5 ${
              activeCategory === cat
                ? "bg-[#c9a84c] text-[#0a0a0f]"
                : "text-[#7a7890] border border-[#c9a84c]/15 hover:border-[#c9a84c]/40 hover:text-[#f0ede8]"
            }`}
          >
            {cat === "Recientes" && <Clock size={12} />}
            {cat}
            {cat === "Recientes" && (
              <span className={`text-xs rounded-full px-1.5 py-0.5 ${activeCategory === cat ? "bg-[#0a0a0f]/20 text-[#0a0a0f]" : "bg-[#c9a84c]/15 text-[#c9a84c]"}`}
                style={{ fontSize: 10, fontWeight: 700 }}>
                {vehicles.filter(isRecent).length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.length === 0 && (
          <div className="col-span-3 flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 bg-[#1a1a24] rounded-2xl flex items-center justify-center mb-4">
              <Shield size={28} color="#7a7890" />
            </div>
            <p style={{ fontFamily: "'Outfit', sans-serif", fontSize: 15, color: "#7a7890" }}>No hay vehículos que coincidan con los filtros</p>
            <button onClick={() => { setActiveCategory("Todos"); setActiveBrand("Todas"); setMaxPrice(maxVehiclePrice); setAvailabilityFilter("Todos"); }}
              className="mt-4 text-[#c9a84c] hover:underline underline-offset-2"
              style={{ fontFamily: "'Outfit', sans-serif", fontSize: 13 }}>
              Limpiar filtros
            </button>
          </div>
        )}
        {filtered.map((vehicle) => (
          <div
            key={vehicle.id}
            className="group bg-[#12121a] border border-[#c9a84c]/10 rounded-2xl overflow-hidden hover:border-[#c9a84c]/40 transition-all duration-300 hover:shadow-[0_0_40px_rgba(201,168,76,0.08)] cursor-pointer relative"
          >
            {/* NEW badge */}
            {isRecent(vehicle) && (
              <div className="absolute top-3 left-3 z-10">
                <span className="flex items-center gap-1 bg-[#c9a84c] px-2.5 py-1 rounded-full"
                  style={{ fontFamily: "'Outfit', sans-serif", fontSize: 10, color: "#0a0a0f", fontWeight: 700, letterSpacing: "0.1em" }}>
                  <Clock size={9} /> NUEVO
                </span>
              </div>
            )}

            {/* Image */}
            <div className="relative overflow-hidden h-48 bg-[#1a1a24]">
              <img
                src={vehicle.img}
                alt={vehicle.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#12121a] to-transparent opacity-60" />
              {!isEffectivelyAvailable(vehicle) ? (
                <div className="absolute inset-0 bg-[#0a0a0f]/70 flex items-center justify-center">
                  <span
                    className="bg-[#1a1a24] border border-[#c9a84c]/30 px-4 py-2 rounded-full"
                    style={{ fontFamily: "'Outfit', sans-serif", fontSize: 12, color: "#7a7890", letterSpacing: "0.1em" }}
                  >
                    NO DISPONIBLE
                  </span>
                </div>
              ) : null}
              <button
                onClick={(e) => { e.stopPropagation(); toggleFav(vehicle.id); }}
                className="absolute top-3 right-3 w-8 h-8 bg-[#0a0a0f]/60 rounded-full flex items-center justify-center hover:bg-[#0a0a0f]/80 transition-colors"
              >
                <Heart
                  size={15}
                  color={favorites.includes(vehicle.id) ? "#c9a84c" : "#7a7890"}
                  fill={favorites.includes(vehicle.id) ? "#c9a84c" : "none"}
                />
              </button>
              {!isRecent(vehicle) && (
                <div className="absolute top-3 left-3">
                  <span
                    className="bg-[#c9a84c]/15 border border-[#c9a84c]/30 px-3 py-1 rounded-full"
                    style={{ fontFamily: "'Outfit', sans-serif", fontSize: 11, color: "#c9a84c", fontWeight: 500 }}
                  >
                    {vehicle.category}
                  </span>
                </div>
              )}

              {/* Admin controls overlay */}
              {isAdmin && (
                <div className="absolute bottom-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={(e) => handleEditClick(e, vehicle)}
                    className="w-8 h-8 bg-[#1a1a24]/90 border border-[#c9a84c]/30 rounded-lg flex items-center justify-center hover:bg-[#c9a84c]/20 transition-colors"
                    title="Editar"
                  >
                    <Edit2 size={13} color="#c9a84c" />
                  </button>
                  <button
                    onClick={(e) => handleDeleteClick(e, vehicle.id)}
                    className="w-8 h-8 bg-[#1a1a24]/90 border border-[#d4183d]/30 rounded-lg flex items-center justify-center hover:bg-[#d4183d]/20 transition-colors"
                    title="Eliminar"
                  >
                    <Trash2 size={13} color="#d4183d" />
                  </button>
                </div>
              )}
            </div>

            {/* Info */}
            <div
              className={`p-5 transition-colors ${isEffectivelyAvailable(vehicle) && !isAdmin ? "cursor-pointer hover:bg-[#1a1a24]" : "cursor-default"}`}
              onClick={() => isEffectivelyAvailable(vehicle) && !isAdmin && onSelect({ ...vehicle, selectedCity: activeCity === "General" ? BRANCH_CITIES.find((city) => { const item = (vehicle.branches || createBranchInventory(vehicle.stock, vehicle.occupied))[city]; return item.stock > item.occupied; }) : activeCity })}
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 16, fontWeight: 600, color: "#f0ede8" }}>
                    {vehicle.name}
                  </h3>
                  <div className="flex items-center gap-1 mt-1">
                    <Star size={12} fill="#c9a84c" color="#c9a84c" />
                    <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: "#c9a84c" }}>{vehicle.rating}</span>
                    <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: 12, color: "#7a7890" }}>({vehicle.reviews})</span>
                  </div>
                </div>
                <div className="text-right">
                  <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 700, color: "#c9a84c" }}>
                    ${vehicle.price}
                  </div>
                  <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 11, color: "#7a7890" }}>por día</div>
                </div>
              </div>

              {/* Availability badges */}
              <div className="flex items-center gap-2 mb-3">
                <div className="flex items-center gap-1.5 bg-[#22c55e]/10 border border-[#22c55e]/30 rounded-full px-2.5 py-1">
                  <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#22c55e", display: "inline-block" }} />
                  <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: 11, color: "#22c55e", fontWeight: 600 }}>
                    Disponibles: {Math.max(0, cityInventory(vehicle).stock - cityInventory(vehicle).occupied)}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 bg-[#d4183d]/10 border border-[#d4183d]/30 rounded-full px-2.5 py-1">
                  <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#d4183d", display: "inline-block" }} />
                  <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: 11, color: "#d4183d", fontWeight: 600 }}>
                    Ocupados: {cityInventory(vehicle).occupied}
                  </span>
                </div>
              </div>

              {/* Specs */}
              <div className="flex gap-4 mb-4">
                <div className="flex items-center gap-1.5">
                  <Users size={13} color="#7a7890" />
                  <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: 12, color: "#7a7890" }}>{vehicle.seats} plazas</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Fuel size={13} color="#7a7890" />
                  <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: 12, color: "#7a7890" }}>{vehicle.fuel}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Settings size={13} color="#7a7890" />
                  <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: 12, color: "#7a7890" }}>{vehicle.transmission}</span>
                </div>
              </div>

              {/* Tags */}
              <div className="flex gap-2 flex-wrap mb-4">
                {vehicle.tags.map((tag) => (
                  <span
                    key={tag}
                    className="bg-[#1a1a24] rounded-lg px-2.5 py-1"
                    style={{ fontFamily: "'Outfit', sans-serif", fontSize: 11, color: "#7a7890" }}
                  >
                    {tag}
                  </span>
                ))}
              </div>

              <button
                disabled={!isEffectivelyAvailable(vehicle) || isAdmin}
                className={`w-full flex items-center justify-center gap-2 rounded-xl py-3 transition-all group/btn ${
                  !isEffectivelyAvailable(vehicle) || isAdmin
                    ? "bg-[#1a1a24] border border-[#c9a84c]/10 cursor-not-allowed"
                    : "bg-[#c9a84c]/10 border border-[#c9a84c]/30 hover:bg-[#c9a84c] hover:border-[#c9a84c] hover:text-[#0a0a0f]"
                }`}
                style={{
                  fontFamily: "'Outfit', sans-serif",
                  fontSize: 13,
                  fontWeight: 600,
                  color: !isEffectivelyAvailable(vehicle) || isAdmin ? "#7a7890" : "#c9a84c",
                  letterSpacing: "0.05em",
                }}
              >
                {!isEffectivelyAvailable(vehicle) ? "NO DISPONIBLE" : isAdmin ? "SOLO CLIENTES" : "RESERVAR"}
                {!isEffectivelyAvailable(vehicle) || isAdmin ? null : <ArrowRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Admin Panel Modal */}
      {showAdminPanel && (
        <AdminPanel
          vehicle={editingVehicle}
          existingVehicles={vehicles}
          onSave={handleSaveVehicle}
          onClose={() => { setShowAdminPanel(false); setEditingVehicle(null); }}
        />
      )}

      {/* Delete Confirmation Modal */}
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
              Esta acción no se puede deshacer. El vehículo será eliminado del catálogo permanentemente.
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
