const express = require("express");

const router = express.Router();


const {
    obtenerVehiculo
} = require("../controllers/vehiculo.controller");



router.get("/", obtenerVehiculo);



module.exports = router;