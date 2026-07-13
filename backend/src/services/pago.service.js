const pool = require("../config/database");


const registrarPago = async (datos) => {

    const {
        id_reserva,
        monto,
        metodo_pago,
        referencia,
        estado
    } = datos;


    const resultado = await pool.query(
        `CALL registrar_pago($1, $2, $3, $4, $5)`,
        [
            id_reserva,
            monto,
            metodo_pago,
            referencia,
            estado
        ]
    );


    return resultado;

};


const obtenerPagos = async () => {

    const resultado = await pool.query(
        "SELECT * FROM pago"
    );


    return resultado.rows;

};


module.exports = {
    registrarPago,
    obtenerPagos
};
