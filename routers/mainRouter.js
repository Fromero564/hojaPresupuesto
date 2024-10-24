const express = require("express");
const router = express.Router();
const mainController = require("../controller/mainController.js");

router.get("/", mainController.Home);
router.get("/buscar", mainController.BuscarProducto);
router.get("/retirarItem",mainController.eliminarItem);

router.post("/agregarPresupuesto",mainController.Agregarpresupuesto);
router.post("/retirarItem",mainController.eliminarItem);



module.exports = router;