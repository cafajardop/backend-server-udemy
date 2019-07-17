var express = require('express');
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');

var SEED = require('../config/config').SEED;

var app = express();
var Usuario = require('../models/usuario');


var GOOGLE_CLIENT_ID = require('../config/config').GOOGLE_CLIENT_ID; // revisa y cambia tu configarion del google client id
const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(GOOGLE_CLIENT_ID);

// Auth GOOGLE
async function verify(token) {
	var ticket = await client.verifyIdToken({
		idToken: token,
		audience: GOOGLE_CLIENT_ID
	});

	var payload = ticket.getPayload();

	return {
		nombre: payload.name,
		email: payload.email,
		img: payload.picture,
		google: true
	};
}


// funcion para autenticar
app.post('/google', async (req, res) => {
  var token = req.body.token;

	try {
		var googleUser = await verify(token);
	} catch (error) {
		res.status(403).json({
			ok: false,
			mensaje: 'Token de google inválido',
			errors: { message: 'Token de google inválido' }
		});
		return;
	}

// devuelvo el return si no hay error
  return res.status(200).json({
	 	ok: true,
		mensaje: 'OK',
		googleUser: googleUser
	});
});



// post normal

app.post('/',(req,res)=>{

    var body = req.body;

     Usuario.findOne({ email: body.email}, (err, usuarioDB)=>{
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar usuario',
                errors: err
            });
        }

        if (!usuarioDB) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Credenciales incorrectas - email',
                errors: err
            });
        }

        if(!bcrypt.compareSync(body.password, usuarioDB.password)){
            return res.status(400).json({
                ok: false,
                mensaje: 'Credenciales incorrectas - password',
                errors: err
            });
        }

        // Crear un token
        usuarioDB.password = ':)';
        var token = jwt.sign({ usuario: usuarioDB}, SEED, { expiresIn:14400 }); //4 horas

        res.status(200).json({
            ok: true,
            usuario: usuarioDB,
            token: token,
            id: usuarioDB._id
        });
     });


});


module.exports = app;
