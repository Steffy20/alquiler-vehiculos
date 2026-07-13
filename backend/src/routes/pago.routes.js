const express = require("express");

const router = express.Router();


const {
    crearPago,
    listarPagos
} = require("../controllers/pago.controller");



router.post("/", crearPago);

router.get("/", listarPagos);



module.exports = router;
