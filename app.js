
/**
 * Module dependencies.
 */

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
app.get('/registrar.json', brain.registrar_mesa )

var a = http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});


//Clientes con #orden, platillos y socket donde están
var clientes = {};
//Almacena objetos mesa con estado y socket al cual comunicar
var mesas = {};
//Solo debe existir un 'cliente' (techterm) como 'recepcion' al cual comunicar
var recepcion;

//Poner a escuchar en el mismo puerto que la aplicacion
var sio = io.listen(a);

sio.sockets.on('connection',function(socket){

  //Registrar nueva mesa
  socket.on('new_mesa',function(info){
    console.log('==> NUEVA MESA:  ' +  info.numero );

    var exists = mesas[info.numero]?true:false;

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
      if(recepcion)
        sio.sockets.socket(recepcion.socket_id).emit('mesa_added',{'mesas': JSON.stringify( mesas )});
    }
  })

  //Se ha establecido el nombre del cliente (Creado un nuevo cliente)
  socket.on('new_cliente',function(info){

    var orden_creada = true;
    var mesa = JSON.parse(info.mesa);
    var cliente = new core.Cliente(info.nombre,mesa);
    
    mesas[mesa.numero].estado = 1;
    cliente.socket_id = socket.id;

    //Abrir orden en la base de datos
    var orden = cliente.crearOrden(); //Falta implementar la funcion

    //Si se registro el cliente en la base de datos
    if(orden.status){
      //Crea el id del cliente compuesto (solo a nivel logico para el servidor)
      var id_cliente = cliente.nombre + '_' + orden.id;
      //Guarda el objeto cliente en el id_compuesto
      clientes[id_cliente] = cliente;
      sio.sockets.socket(recepcion.socket_id).emit('mesa_status_changed',{'mesa': JSON.stringify(mesas[mesa.numero])})
      socket.emit('cliente_created',{'orden': orden.id });
    }

  })

  //Se agregan platillo(s) a la orden del cliente
  socket.on('add_platillo', function(info){

  })

  socket.on('mesa_socket',function(info){
    mesas[info.mesa_id].socket_id = socket.id; 
  })


  socket.on('pick',function(d){ 
    console.log(' PICKED ==> ' + mesas[d.id].socket_id);
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

})

