const {
    registrarPago,
    obtenerPagos
} = require("../services/pago.service");



const crearPago = async (req, res) => {

    try {

        await registrarPago(req.body);


        res.json({
            mensaje: "Pago registrado correctamente"
        });


    } catch (error) {

        console.log("ERROR:", error.message);


        res.status(500).json({
            mensaje: error.message
        });

    }

};


const listarPagos = async (req, res) => {

    try {

        const pagos = await obtenerPagos();


        res.json(pagos);


    } catch (error) {

        console.log("ERROR:", error.message);


        res.status(500).json({
            mensaje: error.message
        });

    }

};



module.exports = {
    crearPago,
    listarPagos
};
