const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors());
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

module.exports = app;