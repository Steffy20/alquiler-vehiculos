import { ChevronLeft, MapPin, Navigation, Plane, Building2 } from "lucide-react";

const GUAYAQUIL_IMG =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 900 600'%3E%3Cdefs%3E%3ClinearGradient id='sky' x1='0' y1='0' x2='1' y2='1'%3E%3Cstop offset='0' stop-color='%23103b55'/%3E%3Cstop offset='0.52' stop-color='%23176b70'/%3E%3Cstop offset='1' stop-color='%23c9a84c'/%3E%3C/linearGradient%3E%3ClinearGradient id='water' x1='0' y1='0' x2='1' y2='0'%3E%3Cstop offset='0' stop-color='%230b1d2a'/%3E%3Cstop offset='1' stop-color='%231f6f78'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='900' height='600' fill='url(%23sky)'/%3E%3Ccircle cx='720' cy='130' r='70' fill='%23f5d77c' opacity='0.9'/%3E%3Cpath d='M0 365 C120 330 225 388 350 348 C500 300 610 365 735 325 C820 298 870 308 900 296 L900 600 L0 600 Z' fill='url(%23water)'/%3E%3Cpath d='M0 390 C145 430 260 372 410 415 C560 460 690 384 900 428 L900 600 L0 600 Z' fill='%23071320' opacity='0.72'/%3E%3Cpath d='M70 325 L125 325 L125 245 L170 245 L170 325 L230 325 L230 210 L285 210 L285 325 L350 325 L350 270 L400 270 L400 325 L465 325 L465 190 L520 190 L520 325 L590 325 L590 235 L635 235 L635 325 L710 325 L710 255 L765 255 L765 325 L835 325 L835 220 L880 220 L880 405 L70 405 Z' fill='%230a0a0f' opacity='0.88'/%3E%3Cpath d='M115 430 C210 390 310 390 420 430 S650 470 810 420' fill='none' stroke='%23f0ede8' stroke-width='12' opacity='0.26'/%3E%3Cpath d='M80 455 C210 420 310 420 430 455 S665 495 845 445' fill='none' stroke='%23c9a84c' stroke-width='8' opacity='0.48'/%3E%3Ctext x='56' y='95' fill='%23f0ede8' font-size='56' font-family='Arial, sans-serif' font-weight='700'%3EGuayaquil%3C/text%3E%3Ctext x='60' y='140' fill='%23f0ede8' opacity='0.78' font-size='25' font-family='Arial, sans-serif'%3ETerminal y zona hotelera%3C/text%3E%3C/svg%3E";

const destinations = [
  {
    city: "Manta",
    place: "Hotel Oro Verde",
    image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=900&h=600&fit=crop&auto=format",
    description: "Entrega rapida para viajes de playa, negocios y recorridos por la Ruta del Spondylus.",
  },
  {
    city: "Quito",
    place: "Aeropuerto Mariscal Sucre",
    image: "https://images.unsplash.com/photo-1580674684081-7617fbf3d745?w=900&h=600&fit=crop&auto=format",
    description: "Vehiculos listos para moverte entre el aeropuerto, el centro historico y los valles.",
  },
  {
    city: "Guayaquil",
    place: "Terminal y zona hotelera",
    image: GUAYAQUIL_IMG,
    description: "Opciones comodas para traslados ejecutivos, turismo urbano y salidas por carretera.",
  },
  {
    city: "Cuenca",
    place: "Centro historico",
    image: "https://images.unsplash.com/photo-1603052875302-d376b7c0638a?w=900&h=600&fit=crop&auto=format",
    description: "Recoge tu auto cerca del centro y explora la ciudad con mayor libertad.",
  },
];

interface DestinationsScreenProps {
  onBack: () => void;
  onExplore: () => void;
}

export function DestinationsScreen({ onBack, onExplore }: DestinationsScreenProps) {
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

      <main className="max-w-7xl mx-auto px-6 py-12">
        <div className="max-w-3xl mb-10">
          <div className="flex items-center gap-2 mb-4">
            <div className="h-px w-8 bg-[#c9a84c]" />
            <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: 12, color: "#c9a84c", letterSpacing: "0.2em", fontWeight: 600 }}>
              DESTINOS
            </span>
          </div>
          <h1
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: "clamp(2.2rem, 5vw, 3.6rem)",
              fontWeight: 700,
              color: "#f0ede8",
              lineHeight: 1.1,
              marginBottom: 18,
            }}
          >
            Puntos de entrega en Ecuador
          </h1>
          <p style={{ fontFamily: "'Outfit', sans-serif", fontSize: 16, color: "#9b98a8", lineHeight: 1.8 }}>
            Elige una ciudad, revisa los puntos principales y explora la flota disponible. Puedes navegar esta
            seccion sin iniciar sesion; solo te pediremos acceso cuando quieras confirmar una reserva.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5 mb-12">
          {destinations.map((destination) => (
            <article
              key={destination.city}
              className="bg-[#12121a] border border-[#c9a84c]/15 rounded-2xl overflow-hidden hover:border-[#c9a84c]/40 transition-colors"
            >
              <div className="relative h-48">
                <img src={destination.image} alt={destination.city} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#12121a] via-transparent to-transparent" />
                <div className="absolute left-4 bottom-4 flex items-center gap-2">
                  <MapPin size={15} color="#c9a84c" />
                  <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: 13, color: "#c9a84c", fontWeight: 700 }}>
                    {destination.city}
                  </span>
                </div>
              </div>
              <div className="p-5">
                <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 700, color: "#f0ede8", marginBottom: 6 }}>
                  {destination.place}
                </h2>
                <p style={{ fontFamily: "'Outfit', sans-serif", fontSize: 14, color: "#7a7890", lineHeight: 1.65 }}>
                  {destination.description}
                </p>
              </div>
            </article>
          ))}
        </div>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-12">
          {[
            { icon: Plane, title: "Aeropuertos", text: "Recogida coordinada para llegadas nacionales e internacionales." },
            { icon: Building2, title: "Hoteles", text: "Entrega en zonas hoteleras principales y centros corporativos." },
            { icon: Navigation, title: "Ruta libre", text: "Elige tu punto de salida y continua hacia la flota disponible." },
          ].map(({ icon: Icon, title, text }) => (
            <div key={title} className="bg-[#12121a] border border-[#c9a84c]/15 rounded-2xl p-6">
              <div className="w-10 h-10 rounded-xl bg-[#c9a84c]/12 flex items-center justify-center mb-4">
                <Icon size={20} color="#c9a84c" />
              </div>
              <h3 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 16, fontWeight: 700, color: "#f0ede8", marginBottom: 8 }}>
                {title}
              </h3>
              <p style={{ fontFamily: "'Outfit', sans-serif", fontSize: 14, color: "#7a7890", lineHeight: 1.7 }}>{text}</p>
            </div>
          ))}
        </section>

        <button
          onClick={onExplore}
          className="bg-[#c9a84c] hover:bg-[#d4b860] text-[#0a0a0f] px-8 py-4 rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98]"
          style={{ fontFamily: "'Outfit', sans-serif", fontSize: 14, fontWeight: 700, letterSpacing: "0.06em" }}
        >
          VER VEHICULOS
        </button>
      </main>
    </div>
  );
}
