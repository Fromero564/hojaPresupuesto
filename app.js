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



//Templates con ejs
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

//Rutas

app.use("/", router);