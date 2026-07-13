import { Star, Shield, Clock } from "lucide-react";

const HERO_IMG = "https://images.unsplash.com/photo-1780296269675-169390638617?w=1600&h=900&fit=crop&auto=format";

const stats = [
  { value: "500+", label: "Vehículos" },
  { value: "98%", label: "Satisfacción" },
  { value: "24/7", label: "Soporte" },
  { value: "19+", label: "Ciudades" },
];

const features = [
  { icon: Shield, label: "Seguro incluido" },
  { icon: Clock, label: "Recogida en 30 min" },
  { icon: Star, label: "Sin depósito" },
];



interface HeroScreenProps {
  userName?: string;
  onExplore: () => void;
  onLogin: () => void;
  onDashboard: () => void;
  onCompany: () => void;
  onDestinations: () => void;
  onAbout: () => void;
}

export function HeroScreen({ userName, onExplore, onLogin, onDashboard, onCompany, onDestinations, onAbout }: HeroScreenProps) {

  return (
    <div className="relative min-h-screen flex flex-col overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 z-0">
        <img
          src={HERO_IMG}
          alt="Vehículo de lujo negro en entorno urbano"
          className="w-full h-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0f] via-[#0a0a0f]/85 to-[#0a0a0f]/30" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0f] via-transparent to-[#0a0a0f]/50" />
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col flex-1 max-w-7xl mx-auto px-6 py-8 w-full">
        {/* Nav */}
        <nav className="flex items-center justify-between mb-20">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#c9a84c] rounded flex items-center justify-center">
              <span style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 700, fontSize: 14, color: "#0a0a0f" }}>R</span>
            </div>
            <span style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 600, fontSize: 18, color: "#f0ede8", letterSpacing: "0.05em" }}>RENTA</span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            {["Vehiculos", "Destinos", "Empresas", "Nosotros"].map((item) => (
              <button
                key={item}
                onClick={() => {
                  if (item === "Vehiculos") {
                    onExplore();
                  }
                  if (item === "Destinos") {
                    onDestinations();
                  }
                  if (item === "Empresas") {
                    onCompany();
                  }
                  if (item === "Nosotros") {
                    onAbout();
                  }
                }}
                style={{ fontFamily: "'Outfit', sans-serif", fontSize: 14, color: "#7a7890", letterSpacing: "0.05em" }}
                className="hover:text-[#f0ede8] transition-colors"
              >
                {item}
              </button>
            ))}
          </div>
          <button
            onClick={userName ? onDashboard : onLogin}
            style={{ fontFamily: "'Outfit', sans-serif", fontSize: 13, fontWeight: 600, color: "#0a0a0f", letterSpacing: "0.08em" }}
            className="bg-[#c9a84c] px-5 py-2.5 rounded-full hover:bg-[#d4b860] transition-colors"
          >
            {userName ? "MI CUENTA" : "INICIAR SESIÓN"}
          </button>
        </nav>

        {/* Hero text */}
        <div className="max-w-2xl mb-12">
          <div className="flex items-center gap-2 mb-6">
            <div className="h-px w-8 bg-[#c9a84c]" />
            <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: 12, color: "#c9a84c", letterSpacing: "0.2em", fontWeight: 500 }}>
              ALQUILER
            </span>
          </div>
          <h1
            style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, fontSize: "clamp(2.5rem, 5vw, 4rem)", color: "#f0ede8", lineHeight: 1.1 }}
            className="mb-6"
          >
            Tu próximo viaje,{" "}
            <span style={{ color: "#c9a84c", fontStyle: "italic" }}>sin límites</span>
          </h1>
          <p style={{ fontFamily: "'Outfit', sans-serif", fontSize: 17, color: "#7a7890", lineHeight: 1.7 }} className="mb-8 max-w-lg">Desde BMW de lujo hasta SUVs para aventura. Disponible en todo Ecuador con entrega en puerta.</p>

          {/* Feature pills */}
          <div className="flex flex-wrap gap-3 mb-12">
            {features.map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-2 bg-[#12121a]/80 border border-[#c9a84c]/20 rounded-full px-4 py-2">
                <Icon size={14} color="#c9a84c" />
                <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: 13, color: "#f0ede8" }}>{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="flex gap-12 mt-12">
          {stats.map(({ value, label }) => (
            <div key={label}>
              <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, fontWeight: 700, color: "#c9a84c" }}>{value}</div>
              <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 13, color: "#7a7890" }}>{label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
