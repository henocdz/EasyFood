var mysql = require('mysql');
var _ = require("underscore");
var sanitize = require("validator").sanitize;

function crearConexion(){
	return mysql.createConnection({user: 'root', password: '', database: 'easy_food' });
}


exports.estado = function(req,res){
	var db = crearConexion();

	var e = req.query['e'];
	var id = req.query['id'];
	var qry = 'UPDATE orden_platillo SET estado = '+e+' WHERE platillo_id_timestamp="'+id+'"';

	db.query(qry,function(err,data){

		if(err){
			console.log('Cambio de estado incorrecto')
		}

		res.setHeader('Content-Type', 'application/json');
		res.send( req.query['callback'] + '( '+ JSON.stringify(data) +' )')

	})
}

exports.platillos = function(req,res,m){
	var db = crearConexion();

	var rs;
	var qry = 'SELECT * FROM platillo';



	if(req.query['tipo'])
		qry += ' WHERE tipo = ' + req.query['tipo'];

	res.setHeader('Content-Type', 'application/json');

	db.query(qry,function(err,data){
		rs = data;
		res.send( req.query['callback'] + '( '+ JSON.stringify(data) +' )')
	})
}

exports.ordenes = function(req,res){
	var db = crearConexion();
}

exports.registrar_mesa = function(req,res){
	var db = crearConexion();


	var usr = req.query['user'];
	var pwd = req.query['pwd'];

	var no_mesa = req.query['no_mesa'];
	var capacidad = req.query['capacidad'];


	res.setHeader('Content-Type', 'application/json');


	if(usr == '' || pwd == '' || no_mesa == '' || capacidad <= 0){
		var J_son = JSON.stringify({st: false });
		res.send( req.query['callback'] + '( '+ JSON.stringify(J_son) +' )') 
		return;
	}

	db.query('SELECT * FROM empleado WHERE usuario = "' + usr + '" AND password = "'+ pwd +'" AND tipo = 0',function(err,data){
		if(data.length == 0){
			var J_son = JSON.stringify({st: false });
			res.send( req.query['callback'] + '( '+ JSON.stringify(J_son) +' )') 
			return;
		}

		db.query('INSERT INTO mesa VALUES('+ no_mesa +','+ capacidad +',0)',function(err,rs){
			if(err || no_mesa == null || capacidad == null )
				var J_son = JSON.stringify({st: false });

			console.log(" <<= REGISTRO: "+JSON.stringify(rs));
			//console.log()
			
			var J_son = JSON.stringify({st: true });
			res.send( req.query['callback'] + '( '+ JSON.stringify(J_son) +' )');

		})

	})

}