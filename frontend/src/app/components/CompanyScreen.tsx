import { ChevronLeft } from "lucide-react";

const COMPANY_IMG = "https://images.unsplash.com/photo-1780296269675-169390638617?w=1600&h=900&fit=crop&auto=format";

interface CompanyScreenProps {
  onBack: () => void;
}

export function CompanyScreen({ onBack }: CompanyScreenProps) {
  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      {/* Header */}
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

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Hero Image */}
        <div className="w-full h-96 rounded-3xl overflow-hidden mb-12 border border-[#c9a84c]/10">
          <img src={COMPANY_IMG} alt="Nuestra empresa" className="w-full h-full object-cover" />
        </div>

        {/* Title */}
        <h1
          style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: "clamp(2rem, 5vw, 3.5rem)",
            fontWeight: 700,
            color: "#c9a84c",
            marginBottom: 32,
            lineHeight: 1.2,
          }}
        >
          Nuestra Empresa
        </h1>

        {/* Main Content */}
        <div className="space-y-8 mb-16">
          <p
            style={{
              fontFamily: "'Outfit', sans-serif",
              fontSize: 17,
              color: "#f0ede8",
              lineHeight: 1.9,
            }}
          >
            Nuestra empresa cuenta con una amplia experiencia en el sector de arrendamiento de vehículos y con locaciones estratégicamente ubicadas en los principales aeropuertos y ciudades del territorio ecuatoriano.
          </p>

          <p
            style={{
              fontFamily: "'Outfit', sans-serif",
              fontSize: 17,
              color: "#f0ede8",
              lineHeight: 1.9,
            }}
          >
            Nuestro alto estándar de calidad y servicio supera todas las expectativas de nuestros clientes y convierte la experiencia de rentar un vehículo en un proceso simple, claro, agradable y libre de estrés.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          {[
            { label: "Experiencia", value: "20+ años", description: "en el sector" },
            { label: "Ubicaciones", value: "19+ ciudades", description: "en Ecuador" },
            { label: "Satisfacción", value: "98%", description: "de clientes" },
          ].map((item) => (
            <div
              key={item.label}
              className="bg-[#12121a] border border-[#c9a84c]/20 rounded-2xl p-8 text-center hover:border-[#c9a84c]/40 transition-colors"
            >
              <div
                style={{
                  fontFamily: "'Playfair Display', serif",
                  fontSize: 28,
                  fontWeight: 700,
                  color: "#c9a84c",
                  marginBottom: 8,
                }}
              >
                {item.value}
              </div>
              <div
                style={{
                  fontFamily: "'Outfit', sans-serif",
                  fontSize: 13,
                  fontWeight: 600,
                  color: "#f0ede8",
                  marginBottom: 4,
                }}
              >
                {item.label}
              </div>
              <div
                style={{
                  fontFamily: "'Outfit', sans-serif",
                  fontSize: 12,
                  color: "#7a7890",
                }}
              >
                {item.description}
              </div>
            </div>
          ))}
        </div>

        {/* Values Section */}
        <div className="bg-gradient-to-br from-[#c9a84c]/8 to-[#c9a84c]/3 border border-[#c9a84c]/20 rounded-3xl p-12">
          <h2
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: 28,
              fontWeight: 700,
              color: "#c9a84c",
              marginBottom: 24,
            }}
          >
            Nuestros Valores
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[
              {
                title: "Calidad",
                description: "Mantenemos los más altos estándares de calidad en cada aspecto de nuestro servicio.",
              },
              {
                title: "Confiabilidad",
                description: "Puedes confiar en nosotros para ofrecerte un servicio consistente y profesional.",
              },
              {
                title: "Innovación",
                description: "Utilizamos la tecnología más avanzada para mejorar tu experiencia de alquiler.",
              },
              {
                title: "Compromiso",
                description: "Estamos comprometidos con la satisfacción total de nuestros clientes.",
              },
            ].map((value) => (
              <div key={value.title} className="bg-[#0a0a0f]/40 rounded-2xl p-6 border border-[#c9a84c]/10">
                <h3
                  style={{
                    fontFamily: "'Outfit', sans-serif",
                    fontSize: 16,
                    fontWeight: 700,
                    color: "#c9a84c",
                    marginBottom: 8,
                  }}
                >
                  {value.title}
                </h3>
                <p
                  style={{
                    fontFamily: "'Outfit', sans-serif",
                    fontSize: 14,
                    color: "#7a7890",
                    lineHeight: 1.6,
                  }}
                >
                  {value.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-16 text-center">
          <h3
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: 24,
              fontWeight: 700,
              color: "#f0ede8",
              marginBottom: 16,
            }}
          >
            ¿Listo para tu próxima aventura?
          </h3>
          <button
            onClick={onBack}
            className="bg-[#c9a84c] hover:bg-[#d4b860] text-[#0a0a0f] px-8 py-4 rounded-xl transition-all hover:scale-105"
            style={{ fontFamily: "'Outfit', sans-serif", fontSize: 15, fontWeight: 700, letterSpacing: "0.05em" }}
          >
            EXPLORAR FLOTA
          </button>
        </div>
      </div>
    </div>
  );
}
