var express = require('express');
const fileUpload = require('express-fileupload');
var fs = require('fs');
var app = express();

//Importar modelos
var Usuario = require('../models/usuario');
var Medico = require('../models/medico');
var Hospital = require('../models/hospital');

// default options
app.use(fileUpload());

//Rutas
app.put('/:tipo/:id',(req, res, next) =>{

    var tipo = req.params.tipo;
    var id = req.params.id;

    //tipos de colección
    var tiposValidos = ['hospitales','medicos','usuarios'];
    if (tiposValidos.indexOf(tipo) <0){
        return res.status(400).json({
            ok: false,
            mensaje: 'Tipo de colección no es válida',
            errors: { mensaje: 'Tipo de colección no es válida'}
        });
    }


    if(!req.files){
        return res.status(400).json({
            ok: false,
            mensaje: 'No selecciono nada',
            errors: { mensaje: 'Debe de seleccionar una imagen'}
        });
    }

    //Obtener nombre del archivo
    var archivo = req.files.imagen;
    var nombreCortado = archivo.name.split('.');
    var extensionArchivo = nombreCortado[nombreCortado.length -1]

    //Solo estas extensiones aceptamos
    var extensionesValidas = ['png','jpg','gif','jpg'];
    if (extensionesValidas.indexOf(extensionArchivo)<0){
        return res.status(400).json({
            ok: false,
            mensaje: 'Extensión no válida',
            errors: { mensaje: 'Las extensiones válidas son: ' + extensionesValidas.join(', ')}
        });
    }

    //Nombre de archivo personalizado
    //12313213-123.png
    var nombreArchivo = `${ id }+${ new Date().getUTCMilliseconds()}.${ extensionArchivo}`;

    //Mover el archivo a un path especifico 
    var path = `./uploads/${ tipo }/${ nombreArchivo }`;

    archivo.mv( path,err=>{
        if(err){
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al mover archivo ',
                errors: err
            });
        }

        subirPorTipo( tipo, id, nombreArchivo, res);

        
    });    
});

function subirPorTipo( tipo, id, nombreArchivo, res){
    if( tipo === 'usuarios'){
        Usuario.findById( id, (err, usuario)=>{
            if (!usuario){
                return res.status(400).json({
                    Ok: true,
                    mensaje: 'Usuario no existe',
                    errors : { message: 'Usuario no existe'}
                });
            }

            //Sirve para borrar la imagen vieja cargada
            var pathViejo = './uploads/usuarios' + usuario.img;
            //Si existe, elimina la imagen anterior
            if (fs.existsSync(pathViejo)){
                    fs.unlink(pathViejo);
            }
            usuario.img = nombreArchivo;

            usuario.save((err,usuarioActualizado)=>{
               return res.status(200).json({
                Ok: true,
                mensaje: 'Imagen de usuario actualizada',
                usuario : usuarioActualizado
                });
            });
        });
    }
    if( tipo === 'medicos'){
        Medico.findById( id, (err, medico)=>{
            if (!medico){
                return res.status(400).json({
                    Ok: true,
                    mensaje: 'Médico no existe',
                    errors : { message: 'Médico no existe'}
                });
            }
            //Sirve para borrar la imagen vieja cargada
            var pathViejo = './uploads/medicos' + medico.img;
            //Si existe, elimina la imagen anterior
            if (fs.existsSync(pathViejo)){
                    fs.unlink(pathViejo);
            }
            medico.img = nombreArchivo;

            medico.save((err,medicoActualizado)=>{

               return res.status(200).json({
                Ok: true,
                mensaje: 'Imagen de medico actualizada',
                medico : medicoActualizado
                });
            });
        });

    }
    if( tipo === 'hospitales'){
        Hospital.findById( id, (err, hospital)=>{
            if (!hospital){
                return res.status(400).json({
                    Ok: true,
                    mensaje: 'Hospital no existe',
                    errors : { message: 'Hospital no existe'}
                });
            }
            //Sirve para borrar la imagen vieja cargada
            var pathViejo = './uploads/hospitales' + hospital.img;
            //Si existe, elimina la imagen anterior
            if (fs.existsSync(pathViejo)){
                    fs.unlink(pathViejo);
            }
            hospital.img = nombreArchivo;

            hospital.save((err,hospitalActualizado)=>{

               return res.status(200).json({
                Ok: true,
                mensaje: 'Imagen de hospital actualizada',
                hospital : hospitalActualizado
                });
            });
        });
    }

}

module.exports = app;