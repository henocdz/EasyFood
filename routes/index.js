
/*
 * GET home page.
 */
var mysql = require('mysql');
var _ = require("underscore");
var sanitize = require("validator").sanitize;

var db = mysql.createConnection({user: 'root', password: '', database: 'roofdier_qg' });

exports.index = function(req, res){

	db.query('SELECT * FROM miembro',function(err,results,r){
		rs = []
		_.each(results, function(dir,index){
			var d = {}
			_.each(dir,function(val,key){
				d[key] = sanitize(val).entityDecode();
			})

			rs[index] = (d);
		})


		res.render('index',{'titulo':'Hola'});
	})

  

};