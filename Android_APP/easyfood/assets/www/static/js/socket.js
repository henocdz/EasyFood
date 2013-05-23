var socket;
//var orden_n = {};
var node = 'http://127.0.0.1:3000';
//var node = 'http://192.168.43.2:3000';
try{
	socket = io.connect(node);
}catch(e){
	socket = null;
	console.log(e)
}

function JSONlength(obj){

	var l = 0;
	for(o in obj)
		l++;

	return l;
}