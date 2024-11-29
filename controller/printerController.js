const escpos = require('escpos');

// Crear un dispositivo USB con el VID y PID específicos
const device = new escpos.USB(0x04F2, 0xB729); // Reemplaza con los valores de tu impresora
const printer = new escpos.Printer(device);

module.exports = {
  printReceipt: (req, res) => {
    device.open(function(error) {
      if (error) {
        console.error('Error al abrir la impresora:', error);
        return res.status(500).send('Error al conectar con la impresora');
      }

      printer
        .text('Hello World')  // Imprime el texto
        .feed()  // Avanza una línea
        .cut()   // Corta el papel
        .close(() => {
          console.log('Impresión completada');
        });

      res.send('Impresión completada.');
    });
  }
};
