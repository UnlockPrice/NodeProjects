var	http = require('https');
var	mysql = require('mysql');
var config = require('../../config/config.js');

var specId = '';
var pool = '';

exports.initialize = function (){
	console.log('specification initialize');
	
	pool      =    mysql.createPool({
		connectionLimit : 30, //important
		host     : config.host, 
		user     : config.user, 
		password : config.password,  
		database : config.database,
		multipleStatements:true
	});
	
	
}
exports.saveSpecifications = function(productIndex,obj,category, callback){
	console.log('getSpecifications');
	var count=0;
	var counter=0;
	var index = 0;
	for(var key in obj){
		count++;
	}
	if(count==0){
		callback(productIndex, '');
		return;
	}
	pool.getConnection(function(err,connection){
		if (err) {
			console.log('ERROR: '+err);
			connection.release();
			res.json({"code" : 100, "status" : "Error in connection database"});
			return;
		}
		
		var specsArr=[];
		for(var key in obj){
			if(obj[key]=='X'){
				//console.log('got the x');
				specsArr[index]='X';
				index++;
				counter++
				continue;
			}
			var myparams = "'"+category+"','"+key+"','"+obj[key]+"'";
			connection.query("call sp_saveSpecification("+myparams+",@specid)", function(err, result) {
				if (err) {
					console.log('ERROR: '+err);
					connection.release();
					//res.json({"code" : 100, "status" : "Error in connection database"});
					return;
				}   
				counter++;
				
				//console.log('output'+parseSpecId(result));
				//console.log(result[0][0].specId);
				var specId = result[0][0].specId;
				specsArr[index]=specId;
				index++;
				if(count==counter){
					connection.release();
					console.log('connection released');
					var specIdStr = specsArr.join('_');
					callback(productIndex, specIdStr);
				}
				//console.log(outparam);
				console.log('query ended');	
			});
		}
	});
	//return specId;
}

parseSpecId = function(result){
	if(result && (Array.isArray(result) || typeof(result)=='object')){
		for(var index in result){
			if(index=='specId'){
				return result[index];
				}else{
				var retVal = parseSpecId(result[index]);
				if(retVal!=undefined){
					return retVal;
				}
			}
		}
	}
}

function testfun(productIndex, specIdStr){
	console.log('time'+specIdStr);
}
function sortFunc(a,b){
	return a-b;
	}							