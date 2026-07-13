import { Calendar, Car, Download, MapPin, ReceiptText } from "lucide-react";
import { downloadInvoicePDF } from "../utils/invoiceGenerator";

export function MyReservationsScreen({ reservations, userEmail, userRole = "client", onExplore }: { reservations: any[]; userEmail: string; userRole?: "client" | "secretary"; onExplore: () => void }) {
  const mine = reservations.filter((reservation) => userRole === "client" ? reservation.clientEmail === userEmail : reservation.createdByEmail === userEmail || (!reservation.createdByEmail && reservation.userRole === "secretary"));
  const statusColor: Record<string, string> = { activa: "#c9a84c", cancelada: "#d4183d", completada: "#4caf84", finalizada: "#f59e0b" };

  return (
    <main className="min-h-screen max-w-6xl mx-auto px-6 py-10 pb-28">
      <div className="flex items-end justify-between gap-4 mb-8 flex-wrap">
        <div>
          <div className="flex items-center gap-2 mb-2 text-[#c9a84c] text-xs tracking-[0.18em]"><ReceiptText size={14} /> {userRole === "secretary" ? "RESERVAS REALIZADAS" : "MIS RESERVAS"}</div>
          <h1 className="text-[#f0ede8] text-4xl" style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700 }}>{userRole === "secretary" ? "Reservas registradas" : "Historial de alquileres"}</h1>
          <p className="text-[#7a7890] mt-2">{userRole === "secretary" ? "Consulta las reservas que registraste para tus clientes y descarga sus facturas." : "Consulta tus vehículos reservados y descarga las facturas de cada operación."}</p>
        </div>
        <button onClick={onExplore} className="bg-[#c9a84c] text-[#0a0a0f] px-5 py-3 rounded-xl font-semibold hover:bg-[#d4b860] transition-colors">NUEVA RESERVA</button>
      </div>

      {mine.length === 0 ? (
        <div className="bg-[#12121a] border border-[#c9a84c]/15 rounded-3xl py-16 px-6 text-center">
          <Car size={38} color="#7a7890" className="mx-auto mb-4" />
          <h2 className="text-[#f0ede8] text-xl font-semibold">{userRole === "secretary" ? "Todavía no registraste reservas" : "Todavía no tienes reservas"}</h2>
          <p className="text-[#7a7890] mt-2 mb-6">Explora los vehículos disponibles para realizar tu primer alquiler.</p>
          <button onClick={onExplore} className="text-[#c9a84c] border border-[#c9a84c]/40 px-5 py-2.5 rounded-xl">VER VEHÍCULOS</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {mine.map((reservation) => (
            <article key={reservation.id} className="bg-[#12121a] border border-[#c9a84c]/15 rounded-2xl overflow-hidden">
              <div className="h-40 bg-[#1a1a24]"><img src={reservation.img} alt={reservation.vehicle} className="w-full h-full object-cover" /></div>
              <div className="p-5">
                <div className="flex justify-between gap-3 mb-4">
                  <div><h2 className="text-[#f0ede8] font-semibold text-lg">{reservation.vehicle}</h2><div className="text-[#7a7890] text-xs font-mono">{reservation.groupId || reservation.id}</div></div>
                  <span className="text-xs font-semibold" style={{ color: statusColor[reservation.status] || "#7a7890" }}>{String(reservation.status || "").toUpperCase()}</span>
                </div>
                <div className="space-y-2 text-sm text-[#7a7890] mb-5">
                  {userRole === "secretary" && <div className="text-[#f0ede8]">Cliente: {reservation.clientName} · {reservation.clientEmail}</div>}
                  <div className="flex gap-2"><Calendar size={14} color="#c9a84c" />{reservation.pickup} → {reservation.dropoff}</div>
                  <div className="flex gap-2"><MapPin size={14} color="#c9a84c" />{reservation.location}</div>
                </div>
                <div className="flex items-center justify-between border-t border-[#c9a84c]/10 pt-4">
                  <strong className="text-[#c9a84c] text-xl">${reservation.total}</strong>
                  {reservation.invoice && <button onClick={() => downloadInvoicePDF(reservation.invoice)} className="flex items-center gap-2 border border-[#c9a84c]/35 text-[#c9a84c] px-4 py-2 rounded-xl hover:bg-[#c9a84c]/10"><Download size={14} /> FACTURA</button>}
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </main>
  );
}
