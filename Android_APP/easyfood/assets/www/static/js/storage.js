var db = window.localStorage;

function initStorage(mesa){
	db['mesa'] = mesa;
	db['logged'] = false;
	db['platillos']  = null;
	db['serverDown'] = false;
	db['logged'] = false;
}

function createSession(orden,cliente){
	db['logged'] = true;
	db['orden'] = orden;
	db['cliente'] = cliente;
	db['estado'] = 1;
	db['platillos']  = JSON.stringify({});
}

function destroySession(){
	delete db['logged'];
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