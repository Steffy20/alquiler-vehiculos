const pool = require("../config/database");


const registrarReserva = async (datos) => {

    const {
        id_cliente,
        id_vehiculo,
        id_sucursal_entrega,
        id_sucursal_devolucion,
        fecha_inicio,
        fecha_fin,
        total,
        observaciones
    } = datos;


    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        await client.query(
            `CALL registrar_reserva($1,$2,$3,$4,$5,$6,$7,$8)`,
            [
                id_cliente,
                id_vehiculo,
                id_sucursal_entrega,
                id_sucursal_devolucion,
                fecha_inicio,
                fecha_fin,
                total,
                observaciones
            ]
        );
        const res = await client.query("SELECT currval('reserva_id_reserva_seq') AS id");
        const id_reserva = res.rows[0].id;
        await client.query('COMMIT');
        return { id_reserva };
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }

};

const cancelarReserva = async (id_reserva) => {

    const resultado = await pool.query(
        "CALL cancelar_reserva($1)",
        [id_reserva]
    );


    return resultado;

};


module.exports = {
    registrarReserva,
    cancelarReserva
};