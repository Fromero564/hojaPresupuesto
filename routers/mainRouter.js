const express = require("express");
const router = express.Router();
const mainController = require("../controller/mainController.js");

router.get("/", mainController.Home);
router.get("/buscar", mainController.BuscarProducto);
// router.get("/presupuesto",mainController.Mostrarpresupuesto);

router.post("/agregarPresupuesto",mainController.Agregarpresupuesto);



module.exports = router;