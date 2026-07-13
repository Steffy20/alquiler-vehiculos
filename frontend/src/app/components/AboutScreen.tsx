import { Award, ChevronLeft, Headphones, MapPin, ShieldCheck, UsersRound } from "lucide-react";

const ABOUT_IMG = "https://images.unsplash.com/photo-1556761175-b413da4baf72?w=1600&h=900&fit=crop&auto=format";

interface AboutScreenProps {
  onBack: () => void;
  onExplore: () => void;
}

export function AboutScreen({ onBack, onExplore }: AboutScreenProps) {
  const values = [
    {
      icon: ShieldCheck,
      title: "Transparencia",
      description: "Reservas claras, precios visibles y condiciones explicadas desde el primer paso.",
    },
    {
      icon: Headphones,
      title: "Acompanamiento",
      description: "Atencion antes, durante y despues de cada alquiler para resolver cualquier necesidad.",
    },
    {
      icon: Award,
      title: "Calidad",
      description: "Vehiculos revisados, limpios y listos para viajes urbanos, familiares o ejecutivos.",
    },
    {
      icon: MapPin,
      title: "Cobertura",
      description: "Presencia en puntos clave para que recoger tu vehiculo sea simple y rapido.",
    },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      <div className="sticky top-0 z-40 bg-[#0a0a0f] border-b border-[#c9a84c]/10 px-6 py-4 flex items-center max-w-7xl mx-auto w-full">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-[#7a7890] hover:text-[#f0ede8] transition-colors"
          style={{ fontFamily: "'Outfit', sans-serif", fontSize: 14, fontWeight: 600 }}
        >
          <ChevronLeft size={20} />
          Volver
        </button>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-12">
        <section className="grid grid-cols-1 lg:grid-cols-[1.05fr_0.95fr] gap-10 items-center mb-16">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="h-px w-8 bg-[#c9a84c]" />
              <span
                style={{
                  fontFamily: "'Outfit', sans-serif",
                  fontSize: 12,
                  color: "#c9a84c",
                  letterSpacing: "0.2em",
                  fontWeight: 600,
                }}
              >
                NOSOTROS
              </span>
            </div>
            <h1
              style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: "clamp(2.2rem, 5vw, 4rem)",
                fontWeight: 700,
                color: "#f0ede8",
                lineHeight: 1.1,
                marginBottom: 24,
              }}
            >
              Movilidad premium con trato cercano
            </h1>
            <p
              style={{
                fontFamily: "'Outfit', sans-serif",
                fontSize: 17,
                color: "#b8b4aa",
                lineHeight: 1.8,
                marginBottom: 28,
              }}
            >
              Somos un equipo ecuatoriano enfocado en que alquilar un vehiculo sea una experiencia simple,
              confiable y elegante. Combinamos una flota cuidada con atencion personalizada para que cada viaje
              empiece sin fricciones.
            </p>
            <button
              onClick={onExplore}
              className="bg-[#c9a84c] hover:bg-[#d4b860] text-[#0a0a0f] px-7 py-3.5 rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98]"
              style={{ fontFamily: "'Outfit', sans-serif", fontSize: 14, fontWeight: 700, letterSpacing: "0.06em" }}
            >
              VER FLOTA
            </button>
          </div>

          <div className="relative min-h-[320px] rounded-2xl overflow-hidden border border-[#c9a84c]/15">
            <img src={ABOUT_IMG} alt="Equipo de atencion al cliente" className="absolute inset-0 w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0f]/75 via-transparent to-transparent" />
            <div className="absolute bottom-5 left-5 right-5 flex items-center gap-3 bg-[#0a0a0f]/75 border border-[#c9a84c]/20 rounded-2xl p-4 backdrop-blur-sm">
              <div className="w-11 h-11 rounded-xl bg-[#c9a84c]/15 flex items-center justify-center">
                <UsersRound size={22} color="#c9a84c" />
              </div>
              <div>
                <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 15, fontWeight: 700, color: "#f0ede8" }}>
                  Atencion humana
                </div>
                <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 13, color: "#9b98a8" }}>
                  Soporte real para cada reserva
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-16">
          {[
            { value: "500+", label: "vehiculos gestionados" },
            { value: "24/7", label: "asistencia disponible" },
            { value: "19+", label: "ciudades conectadas" },
          ].map((stat) => (
            <div key={stat.label} className="bg-[#12121a] border border-[#c9a84c]/15 rounded-2xl p-7">
              <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 32, fontWeight: 700, color: "#c9a84c" }}>
                {stat.value}
              </div>
              <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 13, color: "#7a7890", marginTop: 6 }}>
                {stat.label}
              </div>
            </div>
          ))}
        </section>

        <section>
          <h2
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: 30,
              fontWeight: 700,
              color: "#f0ede8",
              marginBottom: 24,
            }}
          >
            Lo que cuidamos en cada viaje
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {values.map(({ icon: Icon, title, description }) => (
              <div key={title} className="bg-[#12121a] border border-[#c9a84c]/15 rounded-2xl p-6">
                <div className="w-10 h-10 rounded-xl bg-[#c9a84c]/12 flex items-center justify-center mb-4">
                  <Icon size={20} color="#c9a84c" />
                </div>
                <h3 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 17, fontWeight: 700, color: "#f0ede8", marginBottom: 8 }}>
                  {title}
                </h3>
                <p style={{ fontFamily: "'Outfit', sans-serif", fontSize: 14, color: "#7a7890", lineHeight: 1.7 }}>
                  {description}
                </p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
