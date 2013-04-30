
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
  , core = require('./static/js/clases');


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


var a = http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});


var clientes = {};
var mesas = {};

var recepcion;

/*
var nM = new core.Mesa(1);
var nC = new core.Cliente('Juan',nM);
*/

//Poner a escuchar en el mismo puerto que la aplicacion
io = io.listen(a);

io.sockets.on('connection',function(socket){


  socket.on('new_mesa',function(info){
    var exists = mesas[info.numero]?true:false;
    if(exists)
      socket.emit('mesa_created',{'status': false,'obj': null})
    else{
      var new_mesa = new core.Mesa(info.numero,info.estado);
      mesas[info.numero] = new_mesa;
      socket.emit('mesa_created',{'status': true,'obj': new_mesa });

      //Guardar en base de datos
      //io.sockets(recepcion.socket_id).emit('mesa_added',{'mesas': mesas });
    }
  })

  socket.on('new_cliente',function(info){
    console.log(info.nombre)

    var orden_creada = true;
    var cliente = new core.Cliente(info.nombre,info.mesa);
    
    mesas[info.mesa.numero].estado = 1;

    

    cliente.socket_id = socket.id;

    var orden = cliente.crearOrden();

    if(orden.status){
      var id_cliente = cliente.nombre + '_' + orden.id;
      clientes[id_cliente] = cliente;
      socket.emit('cliente_created',{'orden': orden.id });
    }
  })

  socket.on('mesa_socket_changed',function(info){
    clientes[info.cliente].socket_id = socket.id;
    socket.emit('mesa_socket_changed_ok',{'cliente': clientes[info.cliente] })
  })

  io.sockets.on('recepcion', function(socket){
    recepcion = new core.Recepcionista(socket.id);
  })

})

