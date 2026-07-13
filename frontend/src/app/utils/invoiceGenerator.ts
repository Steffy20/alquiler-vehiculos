export interface Invoice {
  id: string;
  reservationId: string;
  date: string;
  dueDate: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  vehicle: string;
  category: string;
  location: string;
  pickupDate: string;
  dropoffDate: string;
  durationDays: number;
  ratePerDay: number;
  subtotal: number;
  extras: Array<{ name: string; price: number; quantity: number; total: number }>;
  total: number;
  items?: InvoiceItem[];
}

export type InvoiceItem = Pick<Invoice, "vehicle" | "category" | "location" | "pickupDate" | "dropoffDate" | "durationDays" | "ratePerDay" | "subtotal" | "extras" | "total"> & {
  reservationId?: string;
  cancelled?: boolean;
};

const generateInvoiceId = () => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const random = Math.floor(Math.random() * 10000);
  return `INV-${year}${month}-${String(random).padStart(5, "0")}`;
};

const formatDate = (dateString: string): string => {
  const [year, month, day] = dateString.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  return new Intl.DateTimeFormat("es-EC", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
};

export const generateInvoice = (
  reservationId: string,
  clientName: string,
  clientEmail: string,
  clientPhone: string,
  vehicle: string,
  category: string,
  location: string,
  pickupDate: string,
  dropoffDate: string,
  durationDays: number,
  ratePerDay: number,
  extras: Array<{ name: string; price: number; quantity: number }>,
  total: number
): Invoice => {
  const now = new Date();
  const dueDate = new Date(now);
  dueDate.setDate(dueDate.getDate() + 15);

  const extrasWithTotal = extras.map((e) => ({
    name: e.name,
    price: e.price,
    quantity: e.quantity,
    total: Number((e.price * e.quantity).toFixed(2)),
  }));

  const subtotal = Number(
    (ratePerDay * durationDays + extrasWithTotal.reduce((sum, e) => sum + e.total, 0)).toFixed(2)
  );

  return {
    id: generateInvoiceId(),
    reservationId,
    date: formatDate(`${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`),
    dueDate: formatDate(`${dueDate.getFullYear()}-${String(dueDate.getMonth() + 1).padStart(2, "0")}-${String(dueDate.getDate()).padStart(2, "0")}`),
    clientName,
    clientEmail,
    clientPhone,
    vehicle,
    category,
    location,
    pickupDate,
    dropoffDate,
    durationDays,
    ratePerDay,
    subtotal,
    extras: extrasWithTotal,
    total,
  };
};

export const generateConsolidatedInvoice = (reservationId: string, invoices: Invoice[]): Invoice => {
  if (invoices.length === 0) throw new Error("Se requiere al menos una factura");
  const first = invoices[0];
  const items: InvoiceItem[] = invoices.map(({ reservationId: itemReservationId, vehicle, category, location, pickupDate, dropoffDate, durationDays, ratePerDay, subtotal, extras, total }) => ({
    reservationId: itemReservationId, vehicle, category, location, pickupDate, dropoffDate, durationDays, ratePerDay, subtotal, extras, total,
  }));
  return {
    ...first,
    id: generateInvoiceId(),
    reservationId,
    vehicle: `${items.length} vehículos`,
    category: "Reserva múltiple",
    location: "Varias sucursales",
    subtotal: Number(items.reduce((sum, item) => sum + item.subtotal, 0).toFixed(2)),
    total: Number(items.reduce((sum, item) => sum + item.total, 0).toFixed(2)),
    extras: [],
    items,
  };
};

export const cancelInvoiceItem = (invoice: Invoice, reservationId: string, fallbackIndex = -1): Invoice => {
  const items: InvoiceItem[] = invoice.items
    ? invoice.items.map((item) => ({ ...item, extras: item.extras.map((extra) => ({ ...extra })) }))
    : [{ reservationId: invoice.reservationId, vehicle: invoice.vehicle, category: invoice.category, location: invoice.location, pickupDate: invoice.pickupDate, dropoffDate: invoice.dropoffDate, durationDays: invoice.durationDays, ratePerDay: invoice.ratePerDay, subtotal: invoice.subtotal, extras: invoice.extras.map((extra) => ({ ...extra })), total: invoice.total }];

  let targetIndex = items.findIndex((item) => item.reservationId === reservationId);
  if (targetIndex < 0) targetIndex = fallbackIndex;
  if (targetIndex < 0 && items.length === 1) targetIndex = 0;
  const updatedItems = items.map((item, index) => index === targetIndex ? { ...item, reservationId, cancelled: true } : item);
  const activeItems = updatedItems.filter((item) => !item.cancelled);

  return { ...invoice, subtotal: Number(activeItems.reduce((sum, item) => sum + item.subtotal, 0).toFixed(2)), total: Number(activeItems.reduce((sum, item) => sum + item.total, 0).toFixed(2)), items: updatedItems };
};

export const downloadInvoicePDF = (invoice: Invoice) => {
  const html = generateInvoiceHTML(invoice);
  const printWindow = window.open("", "_blank", "width=420,height=760");

  if (!printWindow) {
    const blob = new Blob([html], { type: "text/html" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${invoice.id}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
    return;
  }

  printWindow.document.open();
  printWindow.document.write(html);
  printWindow.document.close();
  printWindow.focus();
};

const currency = (value: number) => `$${value.toFixed(2)}`;

const generateInvoiceHTML = (invoice: Invoice): string => {
  const items: InvoiceItem[] = invoice.items || [{ vehicle: invoice.vehicle, category: invoice.category, location: invoice.location, pickupDate: invoice.pickupDate, dropoffDate: invoice.dropoffDate, durationDays: invoice.durationDays, ratePerDay: invoice.ratePerDay, subtotal: invoice.subtotal, extras: invoice.extras, total: invoice.total }];
  const activeItems = items.filter((item) => !item.cancelled);
  const vehicleTotal = Number(activeItems.reduce((sum, item) => sum + item.ratePerDay * item.durationDays, 0).toFixed(2));
  const extrasTotal = Number(activeItems.reduce((sum, item) => sum + item.extras.reduce((extraSum, extra) => extraSum + extra.total, 0), 0).toFixed(2));
  const storedIva = Number((invoice.total - invoice.subtotal).toFixed(2));
  const ivaTotal = storedIva > 0 ? storedIva : Number((invoice.subtotal * 0.15).toFixed(2));
  const invoiceTotal = storedIva > 0 ? invoice.total : Number((invoice.subtotal + ivaTotal).toFixed(2));
  const itemRows = items.map((item, index) => `
            <tr class="${item.cancelled ? "cancelled-item" : ""}"><td colspan="4">${item.cancelled ? '<div class="cancelled-label">CANCELADO</div>' : ""}<div class="item-name">Vehículo ${index + 1}: ${item.vehicle}</div><div class="item-meta">${item.category}<br><strong>Sucursal de retiro:</strong> ${item.location}<br><strong>Periodo:</strong> ${item.pickupDate} - ${item.dropoffDate}</div></td></tr>
            <tr class="${item.cancelled ? "cancelled-charge" : ""}"><td class="col-desc">Alquiler</td><td class="col-days">${item.durationDays}</td><td class="col-price">${currency(item.ratePerDay)}</td><td class="col-total">${currency(item.ratePerDay * item.durationDays)}</td></tr>
            ${item.extras.map((extra) => `<tr class="${item.cancelled ? "cancelled-charge" : ""}"><td class="col-desc"><div class="item-name">${extra.name}</div><div class="item-meta">Extra vehículo ${index + 1}</div></td><td class="col-days">${extra.quantity}</td><td class="col-price">${currency(extra.price)}</td><td class="col-total">${currency(extra.total)}</td></tr>`).join("")}
  `).join("");

  return `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Factura ${invoice.id}</title>
      <style>
        * {
          box-sizing: border-box;
        }
        @page {
          size: 80mm auto;
          margin: 4mm;
        }
        body {
          margin: 0;
          background: #e8e8e8;
          color: #111;
          font-family: Arial, Helvetica, sans-serif;
          font-size: 11px;
          line-height: 1.35;
        }
        .toolbar {
          display: flex;
          justify-content: center;
          gap: 8px;
          padding: 12px;
        }
        .toolbar button {
          border: 0;
          border-radius: 6px;
          padding: 9px 12px;
          background: #c9a84c;
          color: #111;
          font-weight: 700;
          cursor: pointer;
        }
        .ticket {
          width: 80mm;
          min-height: 100mm;
          margin: 0 auto 24px;
          background: #fff;
          padding: 5mm;
          box-shadow: 0 2px 12px rgba(0,0,0,0.18);
        }
        .center {
          text-align: center;
        }
        .brand {
          font-size: 20px;
          font-weight: 800;
          letter-spacing: 0.08em;
        }
        .muted {
          color: #555;
        }
        .mono {
          font-family: "Courier New", monospace;
        }
        .divider {
          border-top: 1px dashed #999;
          margin: 10px 0;
        }
        .row {
          display: flex;
          justify-content: space-between;
          gap: 10px;
          margin: 2px 0;
        }
        .label {
          font-weight: 700;
        }
        .section-title {
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          margin-bottom: 5px;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          table-layout: fixed;
        }
        th {
          border-bottom: 1px solid #111;
          padding: 4px 0;
          text-align: left;
          font-size: 9px;
          text-transform: uppercase;
        }
        td {
          border-bottom: 1px dotted #bbb;
          padding: 5px 0;
          vertical-align: top;
        }
        .col-desc {
          width: 43%;
        }
        .col-days {
          width: 18%;
          text-align: center;
        }
        .col-price,
        .col-total {
          width: 19.5%;
          text-align: right;
        }
        .item-name {
          font-weight: 700;
        }
        .item-meta {
          color: #555;
          font-size: 9px;
        }
        .cancelled-item td {
          border: 2px solid #d4183d;
          border-bottom: 0;
          padding: 7px;
          background: #fff3f5;
        }
        .cancelled-label {
          color: #d4183d;
          font-size: 11px;
          font-weight: 900;
          letter-spacing: 0.12em;
          margin-bottom: 3px;
        }
        .cancelled-charge td {
          color: #8f1530;
          background: #fff3f5;
          text-decoration: line-through;
        }
        .cancelled-charge td:first-child { border-left: 2px solid #d4183d; padding-left: 7px; }
        .cancelled-charge td:last-child { border-right: 2px solid #d4183d; padding-right: 7px; }
        .cancelled-charge:last-of-type td { border-bottom: 2px solid #d4183d; }
        .totals {
          margin-top: 8px;
        }
        .total-pay {
          border-top: 1px solid #111;
          border-bottom: 1px solid #111;
          padding: 6px 0;
          margin-top: 5px;
          font-size: 14px;
          font-weight: 800;
        }
        .terms {
          font-size: 9px;
        }
        @media print {
          body {
            background: #fff;
          }
          .toolbar {
            display: none;
          }
          .ticket {
            width: 72mm;
            margin: 0;
            padding: 0;
            box-shadow: none;
          }
        }
      </style>
    </head>
    <body>
      <div class="toolbar">
        <button onclick="window.print()">Imprimir ticket</button>
      </div>

      <main class="ticket">
        <header class="center">
          <div class="brand">RENTA</div>
          <div class="muted">Sistema de alquiler de vehiculos</div>
          <div class="divider"></div>
          <div class="label">FACTURA</div>
          <div class="mono">${invoice.id}</div>
          <div class="mono">${invoice.reservationId}</div>
        </header>

        <div class="divider"></div>
        <section>
          <div class="row">
            <span>Fecha</span>
            <strong>${invoice.date}</strong>
          </div>
          <div class="row">
            <span>Vence</span>
            <strong>${invoice.dueDate}</strong>
          </div>
        </section>

        <div class="divider"></div>
        <section>
          <div class="section-title">Cliente</div>
          <div><strong>${invoice.clientName}</strong></div>
          <div>${invoice.clientEmail || "Sin correo"}</div>
          <div>${invoice.clientPhone || "Sin telefono"}</div>
        </section>

        <div class="divider"></div>
        <section>
          <div class="section-title">Datos de recogida</div>
          <div><span class="label">${items.length === 1 ? "Sucursal de retiro:" : "Sucursales involucradas:"}</span> <strong>${items.length === 1 ? invoice.location : Array.from(new Set(items.map((item) => item.location))).join(", ")}</strong></div>
          <div>${items.length === 1 ? `${invoice.pickupDate} - ${invoice.dropoffDate}` : "Consulta las fechas de cada vehículo en el detalle"}</div>
        </section>

        <div class="divider"></div>
        <table>
          <thead>
            <tr>
              <th class="col-desc">Descripcion</th>
              <th class="col-days">Dias de alquiler</th>
              <th class="col-price">Precio</th>
              <th class="col-total">Total</th>
            </tr>
          </thead>
          <tbody>
            ${itemRows}
          </tbody>
        </table>

        <section class="totals">
          <div class="row">
            <span>Vehiculo</span>
            <strong>${currency(vehicleTotal)}</strong>
          </div>
          <div class="row">
            <span>Costos adicionales</span>
            <strong>${currency(extrasTotal)}</strong>
          </div>
          <div class="row">
            <span>Subtotal</span>
            <strong>${currency(invoice.subtotal)}</strong>
          </div>
          <div class="row">
            <span>IVA (15%)</span>
            <strong>${currency(ivaTotal)}</strong>
          </div>
          <div class="row total-pay">
            <span>Total</span>
            <span>${currency(invoiceTotal)}</span>
          </div>
        </section>

        <div class="divider"></div>
        <section class="terms">
          <strong>Terminos y condiciones</strong><br>
          - El cliente es responsable del vehiculo desde la recogida hasta la devolucion.<br>
          - Se aplicaran cargos por danos, gasolina faltante y multas de trafico.<br>
          - Cancelacion gratuita hasta 24 horas antes de la recogida.
        </section>

        <div class="divider"></div>
        <footer class="center muted">
          Gracias por elegir RENTA<br>
          Documento generado automaticamente
        </footer>
      </main>
    </body>
    </html>
  `;
};
