const express = require("express");

const router = express.Router();


const {
    obtenerUsuarios
} = require("../controllers/usuario.controller");


router.get("/", obtenerUsuarios);


module.exports = router;