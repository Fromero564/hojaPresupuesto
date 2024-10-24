const path = require("path");
const readXlsxFile = require('read-excel-file/node');
const fs = require('fs');


module.exports = {
    Home:async(req,res)=>{
  
        try {
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

          

    // Renderizar la vista pasando la cabecera y los datos modificados
    res.render("index", { cabecera, datos: datosModificados,presupuestoActual:[] });

        } catch (err) {
            // Manejo de errores en caso de que la lectura del archivo falle
            console.error("Error al leer el archivo Excel:", err);
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

            // Renderizar la vista con los productos filtrados y el contenido de la sesión
            res.render("index", {
                cabecera,
                datos: datosModificados,
                presupuestoActual:[],
                datosProducto: req.session.datosProducto || []  // Mantener los productos agregados
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
    
        // Asegúrate de que el archivo existe y está inicializado correctamente
        if (!fs.existsSync(jsonPath)) {
            // Si no existe, crear un archivo vacío con un array vacío
            fs.writeFileSync(jsonPath, JSON.stringify([], null, 2), 'utf8');
        }
    
        try {
            const data = await fs.promises.readFile(jsonPath, 'utf8');
    
            // Inicializa presupuestoActual como un array vacío
            let presupuestoActual = [];
    
            // Verificar si el archivo no está vacío antes de parsear
            if (data) {
                // Parsear el JSON solo si hay contenido
                presupuestoActual = JSON.parse(data);
            }
    
            // Crear el nuevo objeto
            const nuevoPresupuesto = {
                codigo,
                nombre,
                precio,
                index
            };
    
            // Agregar el nuevo objeto al array existente
            presupuestoActual.push(nuevoPresupuesto);
    
            // Escribir el archivo actualizado
            await fs.promises.writeFile(jsonPath, JSON.stringify(presupuestoActual, null, 2));
    
     
    
            // Ruta completa del archivo Excel en la carpeta 'public'
            const filePath = path.join(__dirname, '../public/articulos_inventados.xlsx');
    
            // Usamos await para esperar a que se lean todas las filas antes de seguir
            const filas = await readXlsxFile(filePath);
    
            // Separar la cabecera del resto de las filas
            const cabecera = filas[0];  // Primera fila como cabecera
            const datos = filas.slice(1);  // El resto de las filas son los datos
    
            // Iterar sobre los datos y dividir el precio (supongamos que está en la tercera columna, índice 2)
            const datosModificados = datos.map(fila => {
                if (fila[2] && typeof fila[2] === 'number') {
                    fila[2] = (fila[2] / 0.7).toFixed(2);  // Dividir el precio por 0.7
                }
                return fila;
            });
    
            // Renderizar la vista
            res.render("index", {
                cabecera,
                datos: datosModificados,
                presupuestoActual, 
  
            });
    
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
    
          
    
            // Responder al cliente confirmando que se eliminó el item y renderiza la vista
            res.render("index", {
                cabecera,
                datos: datosModificados,
                presupuestoActual: updatedPresupuesto, 
             
            });
        } catch (error) {
            // Manejar errores
            console.error(error);
            res.status(500).json({ success: false, message: 'Error eliminando el producto' });
        }
    }


     
}