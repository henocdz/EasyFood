var socket;
var orden_n = {};
var node = 'http://127.0.0.1:3000';
//var node = '192.168.1.119:3000';
try{
	socket = io.connect(node);
}catch(e){
	socket = null;
	console.log(e)
}