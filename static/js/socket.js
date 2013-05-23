var socket;
var node = 'http://127.0.0.1:3000';
//var node = 'http://192.168.43.2:3000'
try{
	socket = io.connect(node);
}catch(e){
	socket = null;
	console.log(e)
}