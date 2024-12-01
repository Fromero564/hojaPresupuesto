const path = require("path");
const session = require('express-session');
const readXlsxFile = require('read-excel-file/node');
const fs = require('fs');


module.exports = {
    Home: async (req, res) => {
        try {
            const filePath = path.join(__dirname, '../public/articulos_inventados.xlsx');
            const filas = await readXlsxFile(filePath);
            const cabecera = filas[0];
            const datos = filas.slice(1);
    
            const datosModificados = datos.map(fila => {
                if (fila[2] && typeof fila[2] === 'number') {
                    fila[2] = (fila[2] / 0.7).toFixed(2);
                }
                return fila;
            });
    
            const presupuestoActual = req.session.presupuestoActual || [];
            const alertMessage = req.session.alertMessage || null;
    
            req.session.alertMessage = null; // Limpiar el mensaje después de usarlo
    
            res.render('index', { cabecera, datos: datosModificados, presupuestoActual, alertMessage });
        } catch (err) {
            console.error("Error al cargar la vista principal:", err);
            res.status(500).send("Error al cargar los datos");
        }
    },

    
   
    BuscarProducto: async (req, res) => {
        try {
            // Obtener el término de búsqueda desde el query string
            const query = req.query.query.toLowerCase(); // Convertir a minúsculas para búsqueda no sensible a mayúsculas
    
            // Leer los datos del archivo Excel
            const filePath = path.join(__dirname, '../public/articulos_inventados.xlsx');
            const filas = await readXlsxFile(filePath);
    
            // Separar la cabecera del resto de las filas
            const cabecera = filas[0];
            const datos = filas.slice(1);
    
            // Filtrar los productos que coincidan con el código o el nombre
            const productosFiltrados = datos.filter(fila => {
                const codigo = fila[0].toString().toLowerCase();
                const nombre = fila[1].toString().toLowerCase();
                return codigo.includes(query) || nombre.includes(query);
            });

             // Iterar sobre los datos y dividir el precio (supongamos que está en la tercera columna, índice 2)
          const datosModificados = await productosFiltrados.map(fila => {
            if (fila[2] && typeof fila[2] === 'number') {
         fila[2] = (fila[2] / 0.7).toFixed(2);  // Dividir el precio por 0.7
          }
           return fila;
         });
         let alertMessage;
         if (productosFiltrados.length === 0) {
            req.session.alertMessage = 'No se encontraron productos que coincidan con la búsqueda.';
            alertMessage = req.session.alertMessage
        }
            // Renderizar la vista con los productos filtrados y el contenido de la sesión
            res.render("index", {
                cabecera,
                datos: datosModificados,
                presupuestoActual:[],
                datosProducto: req.session.datosProducto || [],  // Mantener los productos agregados
                alertMessage,
            });
        } catch (err) {
            console.error("Error al realizar la búsqueda:", err);
            res.status(500).send("Error al buscar los productos");
        }
    },
    Agregarpresupuesto: async (req, res) => {
        let codigo = req.body.codigo;
        let nombre = req.body.nombre;
        let precio = req.body.precio;
        let index = req.body.index;
    
        const jsonPath = path.join(__dirname, '..', 'public', 'json', 'presupuesto.json');
        
        if (!fs.existsSync(jsonPath)) {
            fs.writeFileSync(jsonPath, JSON.stringify([], null, 2), 'utf8');
        }
    
        try {
            const data = await fs.promises.readFile(jsonPath, 'utf8');
            let presupuestoActual = [];
            if (data) {
                presupuestoActual = JSON.parse(data);
            }
    
            // Verificar si el producto ya existe en el presupuestoActual
            const productoExistente = presupuestoActual.find(item => item.codigo === codigo);
    
            if (productoExistente) {
                // Si el producto ya existe, actualizar la cantidad
                productoExistente.cantidad = (productoExistente.cantidad || 0) + 1;
                productoExistente.precioTotal = (productoExistente.precio * productoExistente.cantidad).toFixed(2);
    
                req.session.presupuestoActual = presupuestoActual;
                req.session.alertMessage = 'El producto ya está en el presupuesto y se ha actualizado la cantidad.';
                return res.redirect('/');
            } else {
                // Si no existe, agregar un nuevo producto
                const nuevoPresupuesto = {
                    codigo,
                    nombre,
                    precio,
                    cantidad: 1,  // Inicializamos la cantidad a 1 al agregarlo
                    precioTotal: precio,  // El precio total es igual al precio unitario
                    index
                };
    
                presupuestoActual.push(nuevoPresupuesto);
                await fs.promises.writeFile(jsonPath, JSON.stringify(presupuestoActual, null, 2));
    
                req.session.alertMessage = 'Producto agregado al presupuesto con éxito.';
                res.redirect('/');
            }
        } catch (err) {
            console.error('Error:', err);
            res.status(500).json({ message: 'Error procesando la solicitud' });
        }
    },
    

    eliminarItem:async(req,res)=>{
        const indexToDelete = req.body.index; // El índice pasado desde el frontend
    
        const jsonPath = path.join(__dirname, '..', 'public', 'json', 'presupuesto.json');
        
          // Ruta completa del archivo Excel en la carpeta 'public'
          const filePath = path.join(__dirname, '../public/articulos_inventados.xlsx');
            
          // Usamos await para esperar a que se lean todas las filas antes de seguir
          const filas = await readXlsxFile(filePath);
          
           // Separar la cabecera del resto de las filas
           const cabecera = filas[0];  // Primera fila como cabecera
           const datos = filas.slice(1);  // El resto de las filas son los datos
                
    
           // Iterar sobre los datos y dividir el precio (supongamos que está en la tercera columna, índice 2)
          const datosModificados = await datos.map(fila => {
             if (fila[2] && typeof fila[2] === 'number') {
          fila[2] = (fila[2] / 0.7).toFixed(2);  // Dividir el precio por 0.7
           }
            return fila;
          });


      
        try {
            // Lee el archivo JSON
            const data = await fs.promises.readFile(jsonPath, 'utf8');
            
            let presupuestoActual = [];
    
            // Si el archivo tiene contenido, parsea el JSON
            if (data) {
                presupuestoActual = JSON.parse(data);
            }
    
            // Encuentra el índice del objeto con el mismo 'index'
            const updatedPresupuesto = presupuestoActual.filter(item => item.index !== indexToDelete);
    
            // Sobrescribe el archivo JSON con el nuevo array actualizado
            await fs.promises.writeFile(jsonPath, JSON.stringify(updatedPresupuesto, null, 2), 'utf8');
    
            req.session.alertMessage = 'Producto eliminado correctamente del presupuesto.';
            let alertMessage =  req.session.alertMessage;
            // Responder al cliente confirmando que se eliminó el item y renderiza la vista
            res.render("index", {
                cabecera,
                datos: datosModificados,
                presupuestoActual: updatedPresupuesto, 
                alertMessage,
            });
        } catch (error) {
            // Manejar errores
            console.error(error);
            req.session.alertMessage = 'Error eliminando el producto.';
            res.status(500).json({ success: false, message: 'Error eliminando el producto' });
        }
    }


     
}