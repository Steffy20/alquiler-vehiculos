require("dotenv").config();
const pool = require("./database");

async function test() {
  try {
    const res = await pool.query(
      "SELECT prosrc FROM pg_proc WHERE proname = 'cancelar_reserva';"
    );
    console.log("CANCELAR_RESERVA SOURCE:");
    console.log(res.rows[0].prosrc);
    process.exit();
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
}

test();