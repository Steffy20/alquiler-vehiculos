const express = require("express");

const router = express.Router();


const {
    crearReserva,
    cancelar
} = require("../controllers/reserva.controller");


router.post("/", crearReserva);

router.put("/:id/cancelar", cancelar);


module.exports = router;