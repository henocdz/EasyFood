var socket;
try{
	socket = io.connect("127.0.0.1:3000");
}catch(e){
	socket = null;
	console.log(e)
}