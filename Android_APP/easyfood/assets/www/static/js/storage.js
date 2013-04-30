var db = window.localStorage;

function initStorage(mesa){
	db['mesa'] = mesa;
	db['platillos']  = null;
}

function createSession(orden,cliente){
	db['logged'] = true;
	db['orden'] = orden;
	db['cliente'] = cliente;
	db['estado'] = 1;
	db['platillos']  = {}
}

function destroySession(){
	db['logged'] = false;
	db['orden'] = null;
	db['cliente'] = null;
	db['estado'] = 0;
	db['platillos'] = null;
}

function closeDevice(){
	db['orden'] = null;
	db['cliente'] = null;
	db['estado'] = 0;
	db['platillos'] = null;
}