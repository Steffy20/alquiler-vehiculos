const pool = require("../config/database");


const obtenerUsuarios = async (req, res) => {

    try {

        const resultado = await pool.query(
            "SELECT * FROM usuario"
        );


        res.json(resultado.rows);


    } catch (error) {

        console.log("ERROR SQL:", error.message);

        res.status(500).json({
            mensaje: error.message
        });

    }

};


module.exports = {
    obtenerUsuarios
};