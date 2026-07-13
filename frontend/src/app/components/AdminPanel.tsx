import { useState, useEffect, useRef } from "react";
import {
  X, Plus, Check, AlertCircle, Car, DollarSign,
  Users, Tag, Image, Zap, ChevronDown, Pencil, Settings2, Trash2
} from "lucide-react";
import type { Vehicle } from "../App";
import { BRANCH_CITIES, createBranchInventory, inventoryTotals, type BranchCity, type BranchInventory } from "../utils/branches";

const FUEL_OPTIONS = ["Gasolina", "Diesel", "Hibrido", "Electrico"];
const TRANSMISSION_OPTIONS = ["Automatico", "Manual"];

const BASE_BRANDS = ["Mercedes-Benz", "BMW", "Porsche", "Tesla", "Land Rover", "Audi", "Toyota", "Ford", "Chevrolet", "Honda", "Hyundai", "Kia"];
const BASE_CATEGORIES = ["Premium", "SUV", "Deportivo", "Electrico", "Sedan", "Compacto", "Minivan", "Pickup"];

const STORAGE_BRANDS_KEY = "renta_brands";
const STORAGE_CATEGORIES_KEY = "renta_categories";

function loadList(key: string, base: string[]): string[] {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return [...base];
    const custom: string[] = JSON.parse(raw);
    const merged = [...base];
    for (const item of custom) {
      if (!merged.includes(item)) merged.push(item);
    }
    return merged;
  } catch {
    return [...base];
  }
}

function saveCustomList(key: string, base: string[], fullList: string[]) {
  const custom = fullList.filter((x) => !base.includes(x));
  localStorage.setItem(key, JSON.stringify(custom));
}

interface AdminPanelProps {
  vehicle?: Vehicle | null;
  existingVehicles: Vehicle[];
  onSave: (v: Vehicle) => void;
  onClose: () => void;
}

function generateId(existing: Vehicle[]): number {
  const ids = existing.map((v) => v.id);
  let id = 100;
  while (ids.includes(id)) id++;
  return id;
}

interface ManageListModalProps {
  title: string;
  items: string[];
  baseItems: string[];
  onUpdate: (newList: string[]) => void;
  onClose: () => void;
}

function ManageListModal({ title, items, baseItems, onUpdate, onClose }: ManageListModalProps) {
  const [list, setList] = useState<string[]>(items);
  const [newValue, setNewValue] = useState("");
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editValue, setEditValue] = useState("");
  const [error, setError] = useState("");

  const handleAdd = () => {
    const val = newValue.trim();
    if (!val) { setError("Escribe un nombre"); return; }
    if (list.map(x => x.toLowerCase()).includes(val.toLowerCase())) { setError("Ya existe"); return; }
    setList([...list, val]);
    setNewValue("");
    setError("");
  };

  const handleDelete = (idx: number) => {
    setList(list.filter((_, i) => i !== idx));
    if (editingIndex === idx) { setEditingIndex(null); setEditValue(""); }
  };

  const startEdit = (idx: number) => {
    setEditingIndex(idx);
    setEditValue(list[idx]);
    setError("");
  };

  const handleEditSave = (idx: number) => {
    const val = editValue.trim();
    if (!val) { setError("No puede estar vacio"); return; }
    const updated = [...list];
    updated[idx] = val;
    setList(updated);
    setEditingIndex(null);
    setEditValue("");
    setError("");
  };

  const handleSave = () => {
    onUpdate(list);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-[#0a0a0f]/90 backdrop-blur-md p-4"
      onClick={onClose}
    >
      <div
        className="bg-[#12121a] border border-[#c9a84c]/25 rounded-3xl w-full max-w-md shadow-2xl flex flex-col overflow-hidden"
        style={{ maxHeight: "85vh" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-5 border-b border-[#c9a84c]/10 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-[#c9a84c]/15 border border-[#c9a84c]/30 rounded-xl flex items-center justify-center">
              <Settings2 size={15} color="#c9a84c" />
            </div>
            <div>
              <div style={{ fontFamily: "Playfair Display, serif", fontSize: 17, fontWeight: 700, color: "#f0ede8" }}>
                Gestionar {title}
              </div>
              <div style={{ fontFamily: "Outfit, sans-serif", fontSize: 11, color: "#7a7890" }}>
                {list.length} registradas
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 bg-[#1a1a24] hover:bg-[#c9a84c]/10 rounded-full flex items-center justify-center transition-colors"
          >
            <X size={14} color="#7a7890" />
          </button>
        </div>

        <div className="px-6 py-4 border-b border-[#c9a84c]/10 flex-shrink-0">
          <div style={{ fontFamily: "Outfit, sans-serif", fontSize: 11, color: "#7a7890", letterSpacing: "0.1em", fontWeight: 500 }} className="mb-2">
            AGREGAR NUEVA
          </div>
          <div className="flex gap-2">
            <input
              value={newValue}
              onChange={(e) => { setNewValue(e.target.value); setError(""); }}
              onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAdd())}
              placeholder={`Nueva ${title.toLowerCase().replace(/s$/, "")}`}
              className="flex-1 bg-[#1a1a24] border border-[#1a1a24] focus:border-[#c9a84c]/50 rounded-xl px-4 py-2.5 outline-none transition-colors"
              style={{ fontFamily: "Outfit, sans-serif", fontSize: 13, color: "#f0ede8" }}
            />
            <button type="button" onClick={handleAdd} className="px-4 py-2.5 bg-[#c9a84c]/10 border border-[#c9a84c]/30 hover:bg-[#c9a84c]/20 rounded-xl transition-colors">
              <Plus size={16} color="#c9a84c" />
            </button>
          </div>
          {error && (
            <div className="flex items-center gap-1 mt-1.5 text-[#d4183d]">
              <AlertCircle size={11} />
              <span style={{ fontFamily: "Outfit, sans-serif", fontSize: 11 }}>{error}</span>
            </div>
          )}
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-2">
          {list.map((item, idx) => (
            <div key={idx} className="flex items-center gap-2 bg-[#1a1a24] rounded-xl px-3 py-2.5 group">
              {editingIndex === idx ? (
                <>
                  <input
                    autoFocus
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleEditSave(idx);
                      if (e.key === "Escape") { setEditingIndex(null); setEditValue(""); }
                    }}
                    className="flex-1 bg-transparent outline-none"
                    style={{ fontFamily: "Outfit, sans-serif", fontSize: 13, color: "#f0ede8" }}
                  />
                  <button onClick={() => handleEditSave(idx)} className="w-7 h-7 flex items-center justify-center rounded-lg bg-[#c9a84c]/20 hover:bg-[#c9a84c]/30 transition-colors">
                    <Check size={13} color="#c9a84c" />
                  </button>
                  <button onClick={() => { setEditingIndex(null); setEditValue(""); }} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-white/5 transition-colors">
                    <X size={13} color="#7a7890" />
                  </button>
                </>
              ) : (
                <>
                  <span className="flex-1" style={{ fontFamily: "Outfit, sans-serif", fontSize: 13, color: "#f0ede8" }}>{item}</span>
                  {baseItems.includes(item) && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full border border-[#7a7890]/30" style={{ fontFamily: "Outfit, sans-serif", color: "#7a7890" }}>
                      base
                    </span>
                  )}
                  <button onClick={() => startEdit(idx)} className="w-7 h-7 flex items-center justify-center rounded-lg opacity-0 group-hover:opacity-100 hover:bg-[#c9a84c]/10 transition-all">
                    <Pencil size={12} color="#c9a84c" />
                  </button>
                  <button onClick={() => handleDelete(idx)} className="w-7 h-7 flex items-center justify-center rounded-lg opacity-0 group-hover:opacity-100 hover:bg-[#d4183d]/10 transition-all">
                    <Trash2 size={12} color="#d4183d" />
                  </button>
                </>
              )}
            </div>
          ))}
          {list.length === 0 && (
            <div className="text-center py-6">
              <span style={{ fontFamily: "Outfit, sans-serif", fontSize: 13, color: "#7a7890" }}>Sin opciones registradas</span>
            </div>
          )}
        </div>

        <div className="flex gap-3 px-6 py-4 border-t border-[#c9a84c]/10 flex-shrink-0">
          <button onClick={onClose} className="flex-1 py-3 border border-[#c9a84c]/20 rounded-xl hover:bg-[#c9a84c]/5 transition-colors" style={{ fontFamily: "Outfit, sans-serif", fontSize: 13, fontWeight: 600, color: "#7a7890" }}>
            CANCELAR
          </button>
          <button onClick={handleSave} className="flex-1 flex items-center justify-center gap-2 py-3 bg-[#c9a84c] hover:bg-[#d4b860] rounded-xl transition-all" style={{ fontFamily: "Outfit, sans-serif", fontSize: 13, fontWeight: 700, color: "#0a0a0f" }}>
            <Check size={15} />
            GUARDAR CAMBIOS
          </button>
        </div>
      </div>
    </div>
  );
}

interface SelectableFieldProps {
  label: string;
  value: string;
  options: string[];
  baseOptions: string[];
  error?: string;
  onChange: (val: string) => void;
  onListUpdate: (newList: string[]) => void;
  icon: React.ReactNode;
  placeholder: string;
  addLabel: string;
}

function SelectableField({ label, value, options, baseOptions, error, onChange, onListUpdate, icon, placeholder, addLabel }: SelectableFieldProps) {
  const [open, setOpen] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [showManage, setShowManage] = useState(false);
  const [newVal, setNewVal] = useState("");
  const [addError, setAddError] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
        setShowAdd(false);
        setAddError("");
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleAddNew = () => {
    const val = newVal.trim();
    if (!val) { setAddError("Escribe un nombre"); return; }
    if (options.map(x => x.toLowerCase()).includes(val.toLowerCase())) { setAddError("Ya existe"); return; }
    const updated = [...options, val];
    onListUpdate(updated);
    onChange(val);
    setNewVal("");
    setAddError("");
    setOpen(false);
    setShowAdd(false);
  };

  return (
    <>
      <div>
        <label style={{ fontFamily: "Outfit, sans-serif", fontSize: 11, color: "#7a7890", letterSpacing: "0.1em", fontWeight: 500 }} className="block mb-1.5">
          {label}
        </label>
        <div ref={ref} className="relative">
          <button
            type="button"
            onClick={() => { setOpen(!open); setShowAdd(false); setAddError(""); }}
            className={`w-full flex items-center gap-3 bg-[#1a1a24] border rounded-xl px-4 py-3 transition-colors ${error ? "border-[#d4183d]" : "border-[#1a1a24] hover:border-[#c9a84c]/40"}`}
          >
            <span style={{ flexShrink: 0 }}>{icon}</span>
            <span className="flex-1 text-left" style={{ fontFamily: "Outfit, sans-serif", fontSize: 14, color: value ? "#f0ede8" : "#7a7890" }}>
              {value || placeholder}
            </span>
            <ChevronDown size={14} color="#7a7890" style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s" }} />
          </button>

          {open && (
            <div className="absolute top-full mt-1 left-0 right-0 bg-[#1e1e2a] border border-[#c9a84c]/20 rounded-xl z-20 shadow-2xl overflow-hidden">
              <div className="max-h-48 overflow-y-auto">
                {options.map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => { onChange(opt); setOpen(false); setShowAdd(false); }}
                    className="w-full text-left px-4 py-2.5 hover:bg-[#c9a84c]/10 transition-colors flex items-center justify-between"
                    style={{ fontFamily: "Outfit, sans-serif", fontSize: 14, color: value === opt ? "#c9a84c" : "#f0ede8" }}
                  >
                    {opt}
                    {value === opt && <Check size={13} color="#c9a84c" />}
                  </button>
                ))}
                {options.length === 0 && (
                  <div className="px-4 py-3 text-center" style={{ fontFamily: "Outfit, sans-serif", fontSize: 13, color: "#7a7890" }}>Sin opciones</div>
                )}
              </div>
              <div className="border-t border-[#c9a84c]/10" />
              {showAdd ? (
                <div className="px-3 py-2.5">
                  <div className="flex gap-2">
                    <input
                      autoFocus
                      value={newVal}
                      onChange={(e) => { setNewVal(e.target.value); setAddError(""); }}
                      onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddNew())}
                      placeholder={`Nombre...`}
                      className="flex-1 bg-[#12121a] border border-[#c9a84c]/30 rounded-lg px-3 py-2 outline-none"
                      style={{ fontFamily: "Outfit, sans-serif", fontSize: 13, color: "#f0ede8" }}
                    />
                    <button type="button" onClick={handleAddNew} className="px-3 py-2 bg-[#c9a84c]/15 border border-[#c9a84c]/30 hover:bg-[#c9a84c]/25 rounded-lg transition-colors">
                      <Check size={14} color="#c9a84c" />
                    </button>
                    <button type="button" onClick={() => { setShowAdd(false); setNewVal(""); setAddError(""); }} className="px-3 py-2 hover:bg-white/5 rounded-lg transition-colors">
                      <X size={14} color="#7a7890" />
                    </button>
                  </div>
                  {addError && (
                    <div className="flex items-center gap-1 mt-1 text-[#d4183d]">
                      <AlertCircle size={10} />
                      <span style={{ fontFamily: "Outfit, sans-serif", fontSize: 11 }}>{addError}</span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex">
                  <button
                    type="button"
                    onClick={() => setShowAdd(true)}
                    className="flex-1 flex items-center gap-2 px-4 py-2.5 hover:bg-[#c9a84c]/10 transition-colors"
                    style={{ fontFamily: "Outfit, sans-serif", fontSize: 13, color: "#c9a84c" }}
                  >
                    <Plus size={13} />
                    {addLabel}
                  </button>
                  <button
                    type="button"
                    onClick={() => { setOpen(false); setShowManage(true); }}
                    className="flex items-center gap-2 px-4 py-2.5 hover:bg-[#c9a84c]/10 transition-colors border-l border-[#c9a84c]/10"
                    style={{ fontFamily: "Outfit, sans-serif", fontSize: 12, color: "#7a7890" }}
                  >
                    <Settings2 size={12} />
                    Gestionar
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
        {error && (
          <div className="flex items-center gap-1 mt-1 text-[#d4183d]">
            <AlertCircle size={11} />
            <span style={{ fontFamily: "Outfit, sans-serif", fontSize: 11 }}>{error}</span>
          </div>
        )}
      </div>
      {showManage && (
        <ManageListModal
          title={label === "MARCA" ? "Marcas" : "Categorias"}
          items={options}
          baseItems={baseOptions}
          onUpdate={(newList) => {
            onListUpdate(newList);
          }}
          onClose={() => setShowManage(false)}
        />
      )}
    </>
  );
}

export function AdminPanel({ vehicle, existingVehicles, onSave, onClose }: AdminPanelProps) {
  const isEdit = !!vehicle;

  const [brands, setBrands] = useState<string[]>(() => loadList(STORAGE_BRANDS_KEY, BASE_BRANDS));
  const [categories, setCategories] = useState<string[]>(() => loadList(STORAGE_CATEGORIES_KEY, BASE_CATEGORIES));

  const [name, setName] = useState(vehicle?.name ?? "");
  const [brand, setBrand] = useState(vehicle?.brand ?? "");
  const [category, setCategory] = useState(vehicle?.category ?? "");
  const [price, setPrice] = useState(vehicle?.price?.toString() ?? "");
  const [seats, setSeats] = useState(vehicle?.seats?.toString() ?? "");
  const [fuel, setFuel] = useState(vehicle?.fuel ?? "Gasolina");
  const [transmission, setTransmission] = useState(vehicle?.transmission ?? "Automatico");
  const [img, setImg] = useState(vehicle?.img ?? "");
  const [available, setAvailable] = useState(vehicle?.available ?? true);
  const [rating, setRating] = useState(vehicle?.rating?.toString() ?? "4.5");
  const [reviews, setReviews] = useState(vehicle?.reviews?.toString() ?? "0");
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>(vehicle?.tags ?? []);
  const initialBranches = vehicle?.branches || createBranchInventory(vehicle?.stock ?? 0, vehicle?.occupied ?? 0);
  const [branchInventory, setBranchInventory] = useState<BranchInventory>(initialBranches);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saved, setSaved] = useState(false);

  const handleBrandsUpdate = (newList: string[]) => {
    setBrands(newList);
    saveCustomList(STORAGE_BRANDS_KEY, BASE_BRANDS, newList);
    if (!newList.includes(brand)) setBrand("");
  };

  const handleCategoriesUpdate = (newList: string[]) => {
    setCategories(newList);
    saveCustomList(STORAGE_CATEGORIES_KEY, BASE_CATEGORIES, newList);
    if (!newList.includes(category)) setCategory("");
  };

  const addTag = () => {
    const t = tagInput.trim();
    if (t && !tags.includes(t) && tags.length < 5) {
      setTags([...tags, t]);
      setTagInput("");
    }
  };

  const removeTag = (t: string) => setTags(tags.filter((x) => x !== t));

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!name.trim()) errs.name = "Requerido";
    if (!brand.trim()) errs.brand = "Selecciona una marca";
    if (!category.trim()) errs.category = "Selecciona una categoria";
    if (!price || isNaN(Number(price)) || Number(price) <= 0) errs.price = "Precio invalido";
    if (!seats || isNaN(Number(seats)) || Number(seats) < 1) errs.seats = "Plazas invalidas";
    if (!img.trim()) errs.img = "URL de imagen requerida";
    const totals = inventoryTotals(branchInventory);
    if (totals.stock < 1) errs.stock = "Asigna al menos una unidad a una ciudad";
    if (BRANCH_CITIES.some((city) => branchInventory[city].occupied > branchInventory[city].stock)) errs.stock = "Los ocupados no pueden superar el total";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;
    const now = new Date().toISOString();
    const inventoryToSave: BranchInventory = isEdit
      ? branchInventory
      : Object.fromEntries(BRANCH_CITIES.map((city) => [city, { ...branchInventory[city], occupied: 0 }])) as BranchInventory;
    const totals = inventoryTotals(inventoryToSave);
    const savedVehicle: Vehicle = {
      id: isEdit ? vehicle!.id : generateId(existingVehicles),
      name: name.trim(),
      brand: brand.trim(),
      category: category.trim(),
      price: Number(price),
      rating: Number(rating),
      reviews: Number(reviews),
      seats: Number(seats),
      fuel,
      transmission,
      img: img.trim(),
      tags,
      available,
      stock: totals.stock,
      occupied: totals.occupied,
      branches: inventoryToSave,
      isNew: !isEdit,
      addedAt: isEdit ? vehicle!.addedAt : now,
    };
    onSave(savedVehicle);
    setSaved(true);
    setTimeout(onClose, 700);
  };

  const fieldClass = (key: string) =>
    `w-full flex items-center gap-3 bg-[#1a1a24] border rounded-xl px-4 py-3 transition-colors ${
      errors[key] ? "border-[#d4183d]" : "border-[#1a1a24] focus-within:border-[#c9a84c]/50"
    }`;

  const inputStyle: React.CSSProperties = {
    fontFamily: "Outfit, sans-serif",
    fontSize: 14,
    color: "#f0ede8",
    background: "transparent",
    outline: "none",
    width: "100%",
  };

  const InputError = ({ msg }: { msg?: string }) => {
    if (!msg) return null;
    return (
      <div className="flex items-center gap-1 mt-1 text-[#d4183d]">
        <AlertCircle size={11} />
        <span style={{ fontSize: 11, fontFamily: "Outfit, sans-serif" }}>{msg}</span>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0a0a0f]/90 backdrop-blur-md p-4" onClick={onClose}>
      <div
        className="bg-[#12121a] border border-[#c9a84c]/20 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl relative flex flex-col"
        style={{ maxHeight: "92vh" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-7 py-5 border-b border-[#c9a84c]/10 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-[#c9a84c]/15 border border-[#c9a84c]/30 rounded-xl flex items-center justify-center">
              <Car size={17} color="#c9a84c" />
            </div>
            <div>
              <div style={{ fontFamily: "Playfair Display, serif", fontSize: 20, fontWeight: 700, color: "#f0ede8" }}>
                {isEdit ? "Editar Vehiculo" : "Agregar Vehiculo"}
              </div>
              <div style={{ fontFamily: "Outfit, sans-serif", fontSize: 12, color: "#7a7890" }}>
                {isEdit ? "Modifica los datos del vehiculo" : "Completa todos los campos"}
              </div>
            </div>
          </div>
          <button onClick={onClose} className="w-9 h-9 bg-[#1a1a24] hover:bg-[#c9a84c]/10 rounded-full flex items-center justify-center transition-colors">
            <X size={16} color="#7a7890" />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 px-7 py-6 space-y-5">
          <div>
            <label style={{ fontFamily: "Outfit, sans-serif", fontSize: 11, color: "#7a7890", letterSpacing: "0.1em", fontWeight: 500 }} className="block mb-1.5">
              NOMBRE DEL VEHICULO
            </label>
            <div className={fieldClass("name")}>
              <Car size={14} color={errors.name ? "#d4183d" : "#7a7890"} />
              <input value={name} onChange={(e) => { setName(e.target.value); setErrors({ ...errors, name: "" }); }} placeholder="Mercedes-Benz S-Class" style={inputStyle} />
            </div>
            <InputError msg={errors.name} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <SelectableField
              label="MARCA"
              value={brand}
              options={brands}
              baseOptions={BASE_BRANDS}
              error={errors.brand}
              onChange={(val) => { setBrand(val); setErrors({ ...errors, brand: "" }); }}
              onListUpdate={handleBrandsUpdate}
              icon={<Tag size={14} color={errors.brand ? "#d4183d" : "#7a7890"} />}
              placeholder="Seleccionar marca"
              addLabel="Nueva marca"
            />
            <SelectableField
              label="CATEGORIA"
              value={category}
              options={categories}
              baseOptions={BASE_CATEGORIES}
              error={errors.category}
              onChange={(val) => { setCategory(val); setErrors({ ...errors, category: "" }); }}
              onListUpdate={handleCategoriesUpdate}
              icon={<Tag size={14} color={errors.category ? "#d4183d" : "#7a7890"} />}
              placeholder="Seleccionar categoria"
              addLabel="Nueva categoria"
            />
          </div>

          <div>
            <label style={{ fontFamily: "Outfit, sans-serif", fontSize: 11, color: "#7a7890", letterSpacing: "0.1em", fontWeight: 500 }} className="block mb-1.5">
              PRECIO POR DIA ($)
            </label>
            <div className={fieldClass("price")}>
              <DollarSign size={14} color={errors.price ? "#d4183d" : "#7a7890"} />
              <input type="number" value={price} onChange={(e) => { setPrice(e.target.value); setErrors({ ...errors, price: "" }); }} placeholder="189" min="1" style={inputStyle} />
            </div>
            <InputError msg={errors.price} />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label style={{ fontFamily: "Outfit, sans-serif", fontSize: 11, color: "#7a7890", letterSpacing: "0.1em", fontWeight: 500 }} className="block mb-1.5">PLAZAS</label>
              <div className={fieldClass("seats")}>
                <Users size={14} color={errors.seats ? "#d4183d" : "#7a7890"} />
                <input type="number" value={seats} onChange={(e) => { setSeats(e.target.value); setErrors({ ...errors, seats: "" }); }} placeholder="5" min="1" max="15" style={inputStyle} />
              </div>
              <InputError msg={errors.seats} />
            </div>
            <div>
              <label style={{ fontFamily: "Outfit, sans-serif", fontSize: 11, color: "#7a7890", letterSpacing: "0.1em", fontWeight: 500 }} className="block mb-1.5">COMBUSTIBLE</label>
              <select value={fuel} onChange={(e) => setFuel(e.target.value)} className="w-full bg-[#1a1a24] border border-[#1a1a24] focus:border-[#c9a84c]/50 rounded-xl px-4 py-3 outline-none transition-colors" style={{ fontFamily: "Outfit, sans-serif", fontSize: 14, color: "#f0ede8" }}>
                {FUEL_OPTIONS.map((f) => <option key={f}>{f}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontFamily: "Outfit, sans-serif", fontSize: 11, color: "#7a7890", letterSpacing: "0.1em", fontWeight: 500 }} className="block mb-1.5">TRANSMISION</label>
              <select value={transmission} onChange={(e) => setTransmission(e.target.value)} className="w-full bg-[#1a1a24] border border-[#1a1a24] focus:border-[#c9a84c]/50 rounded-xl px-4 py-3 outline-none transition-colors" style={{ fontFamily: "Outfit, sans-serif", fontSize: 14, color: "#f0ede8" }}>
                {TRANSMISSION_OPTIONS.map((t) => <option key={t}>{t}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label style={{ fontFamily: "Outfit, sans-serif", fontSize: 11, color: "#7a7890", letterSpacing: "0.1em", fontWeight: 500 }} className="block mb-1.5">VALORACION (1-5)</label>
              <div className={fieldClass("rating")}>
                <Zap size={14} color="#7a7890" />
                <input type="number" value={rating} onChange={(e) => setRating(e.target.value)} placeholder="4.5" min="1" max="5" step="0.1" style={inputStyle} />
              </div>
            </div>
            <div>
              <label style={{ fontFamily: "Outfit, sans-serif", fontSize: 11, color: "#7a7890", letterSpacing: "0.1em", fontWeight: 500 }} className="block mb-1.5">N RESENAS</label>
              <div className={fieldClass("reviews")}>
                <Users size={14} color="#7a7890" />
                <input type="number" value={reviews} onChange={(e) => setReviews(e.target.value)} placeholder="0" min="0" style={inputStyle} />
              </div>
            </div>
          </div>

          <div>
            <label style={{ fontFamily: "Outfit, sans-serif", fontSize: 11, color: "#7a7890", letterSpacing: "0.1em", fontWeight: 500 }} className="block mb-1.5">URL DE IMAGEN</label>
            <div className={fieldClass("img")}>
              <Image size={14} color={errors.img ? "#d4183d" : "#7a7890"} />
              <input value={img} onChange={(e) => { setImg(e.target.value); setErrors({ ...errors, img: "" }); }} placeholder="https://images.unsplash.com/..." style={inputStyle} />
            </div>
            <InputError msg={errors.img} />
            {img && !errors.img && (
              <div className="mt-2 h-28 rounded-xl overflow-hidden border border-[#c9a84c]/15">
                <img src={img} alt="Preview" className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
              </div>
            )}
          </div>

          <div>
            <label style={{ fontFamily: "Outfit, sans-serif", fontSize: 11, color: "#7a7890", letterSpacing: "0.1em", fontWeight: 500 }} className="block mb-1.5">ETIQUETAS (max. 5)</label>
            <div className="flex gap-2 mb-2 flex-wrap">
              {tags.map((t) => (
                <span key={t} className="flex items-center gap-1.5 bg-[#c9a84c]/10 border border-[#c9a84c]/30 rounded-full px-3 py-1">
                  <span style={{ fontFamily: "Outfit, sans-serif", fontSize: 12, color: "#c9a84c" }}>{t}</span>
                  <button type="button" onClick={() => removeTag(t)}>
                    <X size={11} color="#7a7890" />
                  </button>
                </span>
              ))}
            </div>
            {tags.length < 5 && (
              <div className="flex gap-2">
                <input
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
                  placeholder="Ej: Techo panoramico"
                  className="flex-1 bg-[#1a1a24] border border-[#1a1a24] focus:border-[#c9a84c]/50 rounded-xl px-4 py-2.5 outline-none transition-colors"
                  style={{ fontFamily: "Outfit, sans-serif", fontSize: 13, color: "#f0ede8" }}
                />
                <button type="button" onClick={addTag} className="px-4 py-2.5 bg-[#c9a84c]/10 border border-[#c9a84c]/30 hover:bg-[#c9a84c]/20 rounded-xl transition-colors">
                  <Plus size={16} color="#c9a84c" />
                </button>
              </div>
            )}
          </div>

          <div className="bg-[#1a1a24] rounded-2xl px-5 py-4">
            <div style={{ fontFamily: "Outfit, sans-serif", fontSize: 11, color: "#7a7890", letterSpacing: "0.1em", fontWeight: 500 }} className="mb-3">
              STOCK Y DISPONIBILIDAD
            </div>
            <div className="space-y-3">
              {BRANCH_CITIES.map((city) => (
                <div key={city} className={`grid ${isEdit ? "grid-cols-[1fr_90px_90px]" : "grid-cols-[1fr_110px]"} gap-3 items-end`}>
                  <div style={{ color: "#f0ede8", fontSize: 13, fontWeight: 600 }}>{city}</div>
                  <div><label style={{ fontSize: 10, color: "#7a7890" }}>UNIDADES DISPONIBLES</label><input type="number" min="0" value={branchInventory[city].stock} onChange={(e) => setBranchInventory((prev) => ({ ...prev, [city]: { ...prev[city], stock: Math.max(0, Number(e.target.value)), ...(!isEdit ? { occupied: 0 } : {}) } }))} className="w-full bg-[#12121a] border border-[#c9a84c]/15 rounded-lg px-3 py-2" style={inputStyle} /></div>
                  {isEdit && <div><label style={{ fontSize: 10, color: "#7a7890" }}>OCUPADOS</label><input type="number" min="0" max={branchInventory[city].stock} value={branchInventory[city].occupied} onChange={(e) => setBranchInventory((prev) => ({ ...prev, [city]: { ...prev[city], occupied: Math.max(0, Number(e.target.value)) } }))} className="w-full bg-[#12121a] border border-[#d4183d]/20 rounded-lg px-3 py-2" style={inputStyle} /></div>}
                </div>
              ))}
              <InputError msg={errors.stock} />
              <div style={{ color: "#7a7890", fontSize: 12 }}>
                Total general: {inventoryTotals(branchInventory).stock} · Disponibles: {isEdit ? inventoryTotals(branchInventory).stock - inventoryTotals(branchInventory).occupied : inventoryTotals(branchInventory).stock}
                {isEdit && <> · Ocupados: {inventoryTotals(branchInventory).occupied}</>}
              </div>
            </div>
            <div className="mt-3 flex items-center justify-between">
              <div>
                <div style={{ fontFamily: "Outfit, sans-serif", fontSize: 14, fontWeight: 600, color: "#f0ede8" }}>Activo en catálogo</div>
                <div style={{ fontFamily: "Outfit, sans-serif", fontSize: 12, color: "#7a7890" }}>
                  {available ? "El vehiculo aparece disponible para reservar" : "El vehiculo esta marcado como no disponible"}
                </div>
              </div>
              <button type="button" onClick={() => setAvailable(!available)} className={`relative w-12 h-6 rounded-full transition-colors duration-300 ${available ? "bg-[#c9a84c]" : "bg-[#2a2a3a]"}`}>
                <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-300 ${available ? "translate-x-6" : "translate-x-0.5"}`} />
              </button>
            </div>
          </div>
        </div>

        <div className="flex gap-3 px-7 py-5 border-t border-[#c9a84c]/10 flex-shrink-0">
          <button onClick={onClose} className="flex-1 py-3.5 border border-[#c9a84c]/20 rounded-xl hover:bg-[#c9a84c]/5 transition-colors" style={{ fontFamily: "Outfit, sans-serif", fontSize: 13, fontWeight: 600, color: "#7a7890", letterSpacing: "0.05em" }}>
            CANCELAR
          </button>
          <button
            onClick={handleSave}
            disabled={saved}
            className={`flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl transition-all ${saved ? "bg-[#4caf84] border border-[#4caf84]" : "bg-[#c9a84c] hover:bg-[#d4b860] hover:scale-[1.01] active:scale-[0.99]"}`}
            style={{ fontFamily: "Outfit, sans-serif", fontSize: 13, fontWeight: 700, color: "#0a0a0f", letterSpacing: "0.06em" }}
          >
            {saved ? <><Check size={16} /> GUARDADO</> : isEdit ? "ACTUALIZAR VEHICULO" : "AGREGAR VEHICULO"}
          </button>
        </div>
      </div>
    </div>
  );
}
