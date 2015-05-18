var http = require('https');
var fs = require('fs');
var flipkart_scrap = require('./flipkart_scrap.js');
var flipkart_savespec = require('./flipkart_savespec.js');
var config = require('../../config/config.js');
var mysql = require('mysql');

var data='';
var count=0;
var productList=[];
var respCounter=[];
var productSpecId={};
var productLength=0;
var productCounter=0;
var startTime;
var productStartIndex=0;

var affiliateId = '';
var response_type = '';
var token = '';
var path = '/affiliate/api/';
var host = 'affiliate-api.flipkart.net';
var section = '';
var pool = '';
var nextURL ='';

exports.initialize = function(aId, tok, rtype,sec)
{
	//console.log('initialize');
	affiliateId = aId;
	token = tok;
	response_type = rtype;
	path = path + aId + "." + rtype;
	section = sec;
	
	pool      =    mysql.createPool({
		//connectionLimit : 30, //important
		host     : config.host, 
		user     : config.user, 
		password : config.password,  
		database : config.database,
		multipleStatements:true
	});
	
	
	flipkart_savespec.initialize();
};


exports.requestModule = function(){
	//console.log('requestModule');
	var options = {
		host: host,
		port: 443,
		path: path,
		method: 'GET',
		headers: {
			'Content-Type': 'application/'+response_type,
			'Fk-Affiliate-Id': affiliateId,
			'Fk-Affiliate-Token': token
		}
	};
	sendRequest(options,parseModules);
}

function sendRequest(options,callback){
	//console.log('sendRequest');
	var req = http.request(options, callback);
	//req.write(data);
	req.end();
}

function parseModules(res){
	//console.log('parseModules');
	res.on('data', function (chunk) {
		data+=chunk;
	});
	res.on('end',function(){
		var jsonData = JSON.parse(data);
		var productURL = jsonData.apiGroups.affiliate.apiListings[section].availableVariants['v0.1.0'].get;
	//	console.log(productURL);
		requestProduct(productURL);
		
	});
}



function requestProduct(url){
	//console.log(url);
	var index = url.indexOf('https://');
	url = url.substring(8);
	
	var urlArr = url.split('/');
	var host = urlArr.splice(0,1)[0];
	var path = urlArr.join('/');
	
	var options = {
		host: host,
		port: 443,
		path : '/'+path,
		method: 'GET',
		headers: {
			'Content-Type': 'application/'+response_type,
			'Fk-Affiliate-Id': affiliateId,
			'Fk-Affiliate-Token': token
		}
	};
	
	sendRequest(options, parseProduct);
}

function parseProduct(res){
	//console.log('parseProduct');
	var data='';
	res.on('data', function (chunk) {
		data+=chunk;
	});
	res.on('end',function(){
		var jsonData = JSON.parse(data);
		//console.log('nexturl:'+jsonData.nextUrl)
		productList = productList.concat(jsonData.productInfoList);
		productLength = productList.length;
		console.log(productLength);
		nextURL = jsonData.nextUrl;
			//console.log(nextURL);
			requestProduct(nextURL);
		}
	});
	
}

function getSpecCallBack(productIndex, obj,category){
	//console.log('final obj:');
	//console.log(obj);
	
	if(obj)
		flipkart_savespec.saveSpecifications(productIndex,obj,category, saveSpecCallBack);
}

function saveSpecCallBack(productIndex, specId,primeId,excluded){
	
	//console.log(specId);
	//return;
	//productCounter++;
	//console.log('saveSpeccall');
	var time = new Date();
	var jsonDate = time.toJSON();
	var specIdStr = specId;
	//console.log('specStr'+specIdStr);
	//console.log('totalSpecsId:'+productSpecId);
	//console.log('productIndex:'+productIndex);
	var productIdentifier = productList[productIndex].productBaseInfo.productIdentifier;
	var productAttributes = productList[productIndex].productBaseInfo.productAttributes;
	var productShippingBaseInfo = productList[productIndex].productShippingBaseInfo;
	var sql = 'insert into `sepp_product_flipkart` (`product_identifier`,`model_id`,`spec_id`,`prime_id`,`product_brand`,`title`,`inStock`,`manufacturer_id`,`shipping`,`mrp`,`selling_price`,`date_added`,`date_modified`,`viewed`,`emi_available`,`cod_available`,`image`,`discount_percentage`,`product_url`) values ('+mysql.escape(productIdentifier.productId)+','+mysql.escape(excluded)+','+mysql.escape(specIdStr)+','+mysql.escape(primeId)+','+mysql.escape(productAttributes.productBrand)+','+mysql.escape(productAttributes.title)+','+mysql.escape(productAttributes.inStock)+','+1+','+1+','+productAttributes.maximumRetailPrice.amount+','+productAttributes.sellingPrice.amount+','+mysql.escape(jsonDate)+','+mysql.escape(jsonDate)+','+1+','+productAttributes.emiAvailable+','+productAttributes.codAvailable+','+mysql.escape(productAttributes.imageUrls["400x400"])+','+productAttributes.discountPercentage+','+mysql.escape(productAttributes.productUrl)+')';
	//console.log(sql);
	//pool.getConnection(function(err,connection){
	//	if (err) {
	//		console.log('ERROR: '+err);
	//		connection.release();
	//		res.json({"code" : 100, "status" : "Error in connection database"});
	//		return;
	//	}
		pool.query(sql, function(err, rows, fields) 
		{
			
			if (err) 
			console.log(err);
			
			console.log('inserted:'+productIndex);
			productCounter++;
			
			if(productCounter==productLength){
				//connection.release();
				var d = new Date();
				var stopTime = d.getTime();
				var elapsedTime = stopTime - startTime;
				console.log('completed in '+elapsedTime);
				if (nextURL)
					requestProduct(nextURL)
				else
				process.exit(0);
				return;
			}
			
			
		});
		
//});
	//if(productCounter==productLength){
	//	connection.release();
	//	var d = new Date();
	//	var stopTime = d.getTime();
	//	var elapsedTime = stopTime - startTime;
	//	console.log('completed in '+elapsedTime);
//}
//}
}

function sortFunc(a,b){
	return a-b;
	}									