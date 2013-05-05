var mysql = require('mysql');
var _ = require("underscore");
var sanitize = require("validator").sanitize;


exports.platillos = function(req,res){
	var db = mysql.createConnection({user: 'root', password: '', database: 'easy_food' });

	var rs;
	db.query('SELECT * FROM platillo',function(err,data){
		rs = data;
		res.send(rs);
	})
}

exports.registrar_mesa = function(req,res){
	var db = mysql.createConnection({user: 'root', password: '', database: 'easy_food' });

	var usr = req.query['user'];
	var pwd = req.query['pwd'];

	var no_mesa = req.query['no_mesa'];
	var capacidad = req.query['capacidad'];

	res.setHeader('Content-Type', 'application/json');

	db.query('SELECT * FROM empleado WHERE usuario = "' + usr + '" AND password = "'+ pwd +'" AND tipo = 0',function(err,data){
		if(data.length == 0){
			var J_son = JSON.stringify({st: false });
			res.send( req.query['callback'] + '( '+ JSON.stringify(J_son) +' )') 
			return;
		}

		db.query('INSERT INTO mesa VALUES('+ no_mesa +','+ capacidad +',0)',function(err,rs){
			if(err || no_mesa == null || capacidad == null )
				var J_son = JSON.stringify({st: false });
			
			var J_son = JSON.stringify({st: true });
			res.send( req.query['callback'] + '( '+ JSON.stringify(J_son) +' )');

		})



	})

}