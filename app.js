const express = require('express')
const app = express();
const path = require("path");
const cors = require("cors");
const fs = require("fs");
const session = require('express-session');
const router = require("./routers/mainRouter.js");



const port = 3010

//SESSION
app.use(session({
  secret: 'Electronativo', 
  resave: false,
  saveUninitialized: true
}));


// Middleware para procesar datos del formulario (application/x-www-form-urlencoded)
app.use(express.urlencoded({ extended: true }));


app.listen(port, () => {
  console.log("se inicio servidor en puerto:" + port);
});


//utilizar cors
app.use(cors());
//Archivos estaticos
app.use(express.static(path.join(__dirname, "public")));

//Imprimir con impresora 
app.post('/imprimir', (req, res) => {
  const { presupuesto } = req.body;
  
  // Configura el dispositivo de la impresora (USB001 en este caso)
  const device = new escpos.USB(0x0b99, 0x3000); // Asegúrate de que los valores del proveedor y producto sean correctos

  const printer = new escpos.Printer(device);

  device.open(function () {
      printer
          .text(presupuesto) // Aquí puedes pasar el presupuesto que se recibe en el cuerpo de la solicitud
          .cut() // Corta el papel
          .close(); // Cierra la impresora

      // Responde con éxito
      res.json({ success: true });
  });
});




//Templates con ejs
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

//Rutas

app.use("/", router);