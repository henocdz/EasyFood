var mysql = require('mysql');
var _ = require("underscore");
var sanitize = require("validator").sanitize;

function crearConexion(){
	return mysql.createConnection({user: 'root', password: '', database: 'easy_food' });
}


exports.cerrar_orden = function(ido,propina,callback){


	var db = crearConexion();
	var qry = 'UPDATE orden SET estado = 2,propina= 0.10 WHERE id="'+ido+'"';

	db.query(qry,function(err,data){
		if(err){
			callback(0);
		}


		callback(1);
	})

}


exports.info_pago = function(req,res){
	var db = crearConexion();

	var orden = req.query['orden_id'];

	var qry = "SELECT (SUM(precio)+(SUM(precio)*orden.propina)) AS total, orden.propina AS propina,nombre AS n ,COUNT(platillo.id) AS q FROM platillo,orden_platillo,orden WHERE orden_id="+orden+" AND orden_platillo.estado>=1 AND platillo.id = orden_platillo.platillo_id AND orden.id = orden_platillo.orden_id GROUP BY platillo.id";

	db.query(qry,function(err,data){

		if(err){

		}

		var platillos = [];
		var total = 0, propina=0;

		for(p in data){
			var v = data[p];
			total += v.total;
			propina = v.propina;
			v.total = v.total/(1+v.propina);
			platillos.push(v);
		}

		var tsend = {'platillos': platillos,'total': total, 'propina': propina}

		res.setHeader('Content-Type', 'application/json');
		res.send( req.query['callback'] + '( '+ JSON.stringify(tsend) +' )')
	})

}

function monto_total(orden,callback){
	var db = crearConexion();
	var qry = "SELECT (SUM(precio)+(SUM(precio)*orden.propina)) AS total, orden.propina AS propina,nombre AS n ,COUNT(platillo.id) AS q FROM platillo,orden_platillo,orden WHERE orden_id="+orden+" AND orden_platillo.estado>=1 AND platillo.id = orden_platillo.platillo_id AND orden.id = orden_platillo.orden_id GROUP BY platillo.id";

	db.query(qry,function(err,data){

		if(err){

		}

		var total = 0;

		for(p in data){
			total += data[p].total;
		}

		callback(total)
	})
}

exports.registrar_pago = function(orden,callback){
	monto_total(orden,function(total){

		var db = crearConexion();

		var qry = "INSERT INTO pago VALUES("+orden+","+total+",NOW(),'DIHH931005MX')";


		db.query(qry,function(err,data){
			var e = 1;
			if(err){
				e = 0;
				callback(e)
			}

			db.query('UPDATE orden SET estado = 0 WHERE id = '+orden,function(err,dta){
				var e = 1;
				if(err){
					e = 0;
				}

				callback(e);
			})
		})

	})
}

exports.ordenes = function(req,res){
	var db = crearConexion();

	var qry = "SELECT cliente.nombre AS Cn, orden.id AS Oid FROM orden,cliente WHERE orden.cliente_id = cliente.id AND orden.estado = 2";

	db.query(qry,function(err,data){

		res.setHeader('Content-Type', 'application/json');
		res.send( req.query['callback'] + '( '+ JSON.stringify(data) +' )')

	})
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
/*
exports.ordenes = function(req,res){
	var db = crearConexion();
}
*/
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