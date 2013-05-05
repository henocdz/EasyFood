exports.Caja = function (){
	this.efectivo = 0;
	this.registrarPago = function(){

	}
	this.ventasRealizadas = function(){

	}
}

exports.Platillo = function(nombre,tipo){
	this.ingredientes = [];
	this.nombre = nombre;
	this.tipo = tipo
	this.disponible = false;
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
	this.eliminarPlatillo = function(){

	}
	this.agregarPlatillo = function(){

	}
	this.cerrarOrden = function(){

	}
}

exports.Cliente = function(nombre,obj_mesa){
	this.orden = null;
	this.socket_id = null;
	this.mesa = obj_mesa;
	this.nombre = nombre;

	this.crearOrden = function(){
		this.orden = new exports.Orden(1);
		return {'status': true, 'id': 1}
	}
	this.cerrarOrden = function(){

	}
	this.agregarPlatillo = function(){

	}
}


exports.Empleado = function(nombre){
	this.nss = null;
	this.checarEntrada = function(){

	}
	this.checarSalida = function(){

	}
}

exports.Cocinero = function(){

}

exports.Recepcionista = function(socket_id){
	this.socket_id = socket_id;
	exports.Empleado.call(this);
}

exports.Recepcionista.prototype = new exports.Empleado();
exports.Recepcionista.prototype.constructor = exports.Recepcionista;