var mysql = require("mysql");
var _ = require("underscore");

var Connect = function(config){

	var default_config = {
		"host": "127.0.0.1",
		"port": "",
		"user": "root",
		"password": ""
	}


	var db_info;
	_.extend(db_info,config,default_config);

	console.log(db_info)

}