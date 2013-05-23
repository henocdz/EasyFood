var mysql = require('mysql');

function crearConexion(){
	return mysql.createConnection({user: 'root', password: '', database: 'easy_food' });
}

exports.Caja = function (){
	this.efectivo = 0;
	this.registrarPago = function(){

	}
	this.ventasRealizadas = function(){

	}
}

exports.Platillo = function(id,nombre,tipo,obs){
	//this.ingredientes = [];
	this.id = id;
	this.nombre = nombre;
	this.tipo = 0;
	this.disponible = true;
	this.observaciones = obs;
}

exports.Mesa = function(num,edo,_id,cap){
	this.numero = num;
	this.estado = edo;
	this.capacidad = cap;
	this.socket_id = _id;
}

exports.Menu = function (){
	this.platillos = [];
	this.crearPlatillo = function(){
		
	}
	this.eliminarPlatillo = function(){
		
	}
}

exports.Orden = function(no_orden){
	this.numero = no_orden;
	this.platillos = [];
	var self = this;
	this.eliminarPlatillo = function(){

	}
	this.agregarPlatillo = function(p,plat,sendCocina){
		//this.platillos.push(plat);

		var plat_id = p.split('_')[0];
		var db = crearConexion();

		db.query('INSERT INTO orden_platillo VALUES('+this.numero+','+plat_id+',"'+p+'",'+(plat[0]!=null?"'"+plat[0]+"'":'NULL')+',0)',function(err,data){

			if(err){
				sendCocina(0,plat);
				return;
			}

			var pla = new exports.Platillo(plat_id,plat[1],0,(plat[0]!=null?plat[0]:'-'));
			(self.platillos).push(pla);

			console.log('=>> PLATILLO AGREGADO A ORDEN: '+self.numero+' PLATILLO: '+pla.observaciones);

			sendCocina(1,pla);

		})
	}
	this.cerrarOrden = function(){

	}
}

exports.Cliente = function(nombre,obj_mesa){

	var db = crearConexion();

	this.orden = null;
	this.socket_id = null;
	this.mesa = obj_mesa;
	this.nombre = nombre;
	this.id = null;
	var self = this;

	this.crearOrden = function(callback){

		var qry = "INSERT INTO cliente(mesa_numero,nombre) VALUES ("+(this.mesa).numero+",'"+this.nombre+"')";
		var rdn=0,s=true,clt,f=false;

		//console.log("INSERT INTO cliente(mesa_numero,nombre) VALUES ("+(this.mesa).numero+",'"+this.nombre+"')")

		 db.query(qry,function(err,rs){
			if(err){
				s= {'status': false}
				callback(s);
			}



			console.log("\t <<<<<<< CLIENTE CREAD@"+rs.insertId);
			clt =rs.insertId;
			var qry_orden = "INSERT INTO orden(fecha,cliente_id,estado) VALUES(NOW(),"+rs.insertId+",1)";

			//console.log("INSERT INTO orden(fecha,cliente_id,estado) VALUES(NOW(),"+rs.insertId+",1)")

			db.query(qry_orden,function(err,rs1){

				if(err){
					s= {'status': false}
					callback(s);
				}

				rdn = rs1.insertId;
				console.log("\t <<<<<<< ORDEN CREADA "+rs1.insertId);
				self.orden = new exports.Orden(rdn);
				self.id = clt;
				s = {'status': s, 'id': rdn}

				callback(s);

			})
		})
	}

	this.cerrarOrden = function(){

	}
	this.agregarPlatillo = function(p,plat,callback){
		console.log('ERROR AL AGREGAR PLATILLO');
		this.orden.agregarPlatillo(p,plat,callback);
	}
}


exports.Empleado = function(nombre){
	this.nss = null;
	this.checarEntrada = function(){

	}
	this.checarSalida = function(){

	}
}

exports.Cocinero = function(socket){
	this.socket_id = socket;
}

exports.Recepcionista = function(socket_id){
	this.socket_id = socket_id;
	exports.Empleado.call(this);
}

exports.Recepcionista.prototype = new exports.Empleado();
exports.Recepcionista.prototype.constructor = exports.Recepcionista;