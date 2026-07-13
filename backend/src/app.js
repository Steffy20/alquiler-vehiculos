const express = require('express');
const cors = require('cors');

const app = express();

const allowedOrigins = (process.env.FRONTEND_URL || "http://localhost:5173")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error("Origen no permitido por CORS"));
  }
}));
app.use(express.json());


const vehiculoRoutes = require("./routes/vehiculo.routes");
const usuarioRoutes = require("./routes/usuario.routes");
const reservaRoutes = require("./routes/reserva.routes");
const pagoRoutes = require("./routes/pago.routes");

app.use("/api/vehiculos", vehiculoRoutes);
app.use("/api/usuarios", usuarioRoutes);
app.use("/api/reservas", reservaRoutes);
app.use("/api/pagos", pagoRoutes);

app.get('/', (req, res) => {
  res.json({
    mensaje: "API funcionando"
  });
});

app.get('/api/health', (req, res) => {
  res.json({ status: "ok" });
});

module.exports = app;
