var express = require('express');
var app = express();

//Rutas
app.get('/',(req, res, next) =>{
    res.status(200).json({
        Ok: true,
        mensaje: 'Petición realizada correctamente'
    })
});


module.exports = app;