const express = require("express");
const router = express.Router();
const mainController = require("../controller/mainController.js");
const printerController= require("../controller/printerController.js")

router.get("/", mainController.Home);
router.get("/buscar", mainController.BuscarProducto);
router.get("/retirarItem",mainController.eliminarItem);
router.get("/imprimir",printerController.printReceipt);

router.post("/agregarPresupuesto",mainController.Agregarpresupuesto);
router.post("/retirarItem",mainController.eliminarItem);



module.exports = router;