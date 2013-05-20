var socket;
//var node = '127.0.0.1:3000';
var node = 'http://192.168.173.1:3000'
try{
	socket = io.connect(node);
}catch(e){
	socket = null;
	console.log(e)
}