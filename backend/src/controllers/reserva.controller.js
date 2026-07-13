const {
    registrarReserva,
    cancelarReserva
} = require("../services/reserva.service");



const crearReserva = async (req, res) => {

    try {

        const { id_reserva } = await registrarReserva(req.body);


        res.json({
            mensaje: "Reserva registrada correctamente",
            id_reserva
        });


    } catch (error) {

        console.log("ERROR:", error.message);


        res.status(500).json({
            mensaje: error.message
        });

    }

};


const cancelar = async (req, res) => {

    try {

        const { id } = req.params;


        await cancelarReserva(id);


        res.json({
            mensaje: "Reserva cancelada correctamente"
        });


    } catch (error) {

        console.log("ERROR:", error.message);


        res.status(500).json({
            mensaje: error.message
        });

    }

};



module.exports = {
    crearReserva,
    cancelar
};