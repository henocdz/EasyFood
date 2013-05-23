
/**
 * Module dependencies.
 */
var mesas = {};
var express = require('express')
  , routes = require('./routes')
  , user = require('./routes/user')
  , http = require('http')
  , path = require('path')
  , _ = require('underscore')
  , mysql = require('mysql')
  , io = require('socket.io')
  , core = require('./static/js/clases')
  , brain = require('./routes/brain');


var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.get('/',routes.index);
//app.get('/',routes.index);
app.get('/users', user.list);
app.get('/get_platillos', brain.platillos )
app.get('/get_ordenes', brain.ordenes )
app.get('/registrar.json', function(req,res){

  //console.log(mesas[]?true:false)

  var r = false;
  for(e in mesas)
	if(e == req.query['no_mesa'])
	  r = true;
  


  if(r){
	var J_son = JSON.stringify({st: false });
	res.send( req.query['callback'] + '( '+ JSON.stringify(J_son) +' )') 
	return;
  }

  brain.registrar_mesa(req,res);
})

app.get('/estado_platillo',brain.estado);

var a = http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});


//Clientes con #orden, platillos y socket donde están
var clientes = {};
//Almacena objetos mesa con estado y socket al cual comunicar

//Solo debe existir un 'cliente' (techterm) como 'recepcion' al cual comunicar
var recepcion;
var cocina;

//Poner a escuchar en el mismo puerto que la aplicacion
var sio = io.listen(a);


sio.sockets.on('connection',function(socket){


  socket.on('disconnect',function(){
	//console.log()
	//sio.sockets.socket(recepcion.socket_id).emit('mesa_rm',{'mesa': JSON.stringify( mesas )});

	for(m in mesas){

	  console.log(' DELETE ==>> '  + mesas[m].numero);
	  if(socket.id === mesas[m].socket_id && recepcion){
		sio.sockets.socket(recepcion.socket_id).emit('mesa_rm',{'mesa':mesas[m].numero});
		delete mesas[m];
		break;
	  }

	}

  })

  //Registrar nueva mesa
  socket.on('new_mesa',function(info){
	console.log('\n==> NUEVA MESA:  ' +  info.numero );

	var exists = mesas[info.numero]?true:false;


	console.log(JSON.stringify(mesas))
	//Si la mesa ya existe devuelve el objeto con la informacion que se tiene
	if(exists){
	  //Actualiza el socket de cual se comunica la mesa
	  mesas[info.numero].socket_id = socket.id;
	  //Convierte a cadena el objeto
	  var string_mesa = JSON.stringify(mesas[info.numero])
	  socket.emit('mesa_created',{'status': false,'obj': string_mesa})
	}else{ //No se tiene registro de esa mesa

	  var new_mesa = new core.Mesa(info.numero,info.estado,socket.id);
	  //Numero de mesa que se desea registrar
	  mesas[info.numero] = new_mesa;
	  var string_mesa = JSON.stringify(new_mesa)
	  socket.emit('mesa_created',{'status': true,'obj': string_mesa });

	  //Guardar en base de datos

	  //Si existe recepcion le envía todas las mesas
	  if(recepcion){
		sio.sockets.socket(recepcion.socket_id).emit('mesa_added',{'mesas': JSON.stringify( mesas )});
		console.log(' |<| << MESAS ENVIADAS A RECEPCION  >>|>| ');
	  }


	  //console.log(JSON.stringify(mesas))
	}
  })

  //Se ha establecido el nombre del cliente (Creado un nuevo cliente)
  socket.on('new_cliente',function(info){

	var orden_creada = true;
	var mesa = JSON.parse(info.mesa);
	var cliente = new core.Cliente(info.nombre,mesa);
	
	console.log('Creando cliente')

	mesas[mesa.numero].estado = 1;
	cliente.socket_id = socket.id;

	//Abrir orden en la base de datos

	cliente.crearOrden(function(orden){


	  //Si se registro el cliente en la base de datos
	  if(orden.status){
	   
		//Crea el id del cliente compuesto (solo a nivel logico para el servidor)
		var id_cliente = cliente.nombre + '_' + orden.id;
		//Guarda el objeto cliente en el id_compuesto
		clientes[id_cliente] = cliente;
		sio.sockets.socket(recepcion.socket_id).emit('mesa_status_changed',{'mesa': JSON.stringify(mesas[mesa.numero])})
		socket.emit('cliente_created',{'orden': orden.id });
	  }

	   console.log('CLIENTES => ' + JSON.stringify(clientes))

	}); //Falta implementar la funcion
	

  })

  //Se agregan platillo(s) a la orden del cliente
  socket.on('add_platillo', function(info){

	  var plats = JSON.parse(info.platillos);
	  console.log(" \t\n <<<< AGREGAR PLATILLOS " + info.cliente );

	 var contados=0,enviados=0;

	  for(p in plats){
	  	contados++;

		if(clientes[info.cliente]){

		  clientes[info.cliente].agregarPlatillo(p,plats[p],function(estado,platillo){
		  	enviados++;

		  	if(estado == 0){
		  		console.log('ERROR AL AGREGAR PLATILLO_1');
		  		return;
		  	}
		  	
		  	if(contados==enviados){
		  		console.log('finfinfinfin')
		  		socket.emit('platillos_agregados',{});
		  	}

		  	//console.log(clientes[info.cliente].orden)

		  	if(cocina){
		  		sio.sockets.socket(cocina.socket_id).emit('new_platillo',{'platillo_id':p,'platillo':JSON.stringify(platillo),'orden': clientes[info.cliente].orden.numero })
		  	}


		  	console.log('\n |<| << PLATILLO ENVIADO A COCINA  >>|>| \n');
		  });
		}else{
			console.log(clientes)
		  console.log('NO EXISTE EL CLIENTE');
		}
	  }



  })

  socket.on('mesa_socket',function(info){
	mesas[info.mesa_id].socket_id = socket.id; 
  })


  socket.on('pick',function(d){ 
	console.log('\nPICKED ==> ' + mesas[d.id].socket_id);
	sio.sockets.socket(mesas[d.id].socket_id).emit('picked',{});
  })

  //El cliente cambia de socket (Permite mantener conexion con el cliente independiente de la vista)
  socket.on('mesa_socket_changed',function(info){
	//Intenta buscar al cliente 
	try{
	  clientes[info.cliente].socket_id = socket.id;
	  socket.emit('mesa_socket_changed_ok',{'cliente': clientes[info.cliente] })
	}catch(e){
	  socket.emit('mesa_socket_changed_ok',{'cliente': null })
	}
  })

  //Se registra un nuevo socket 'recepcion'
  socket.on('recepcion', function(d){
	recepcion = new core.Recepcionista(socket.id);
	sio.sockets.socket(recepcion.socket_id).emit('mesa_added',{'mesas': JSON.stringify( mesas )});
	console.log("\n\n => Recepcion =>> " +  JSON.stringify(recepcion))
  })


  socket.on('cocina', function(d){
	cocina = new core.Recepcionista(socket.id);
	//sio.sockets.socket(cocina.socket_id).emit('mesa_added',{'mesas': JSON.stringify( mesas )});
	console.log("\n\n => COCINA =>> " +  JSON.stringify(recepcion))
  })

})



