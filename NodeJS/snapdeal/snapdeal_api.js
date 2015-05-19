//var querystring = require('querystring');
var http = require('https');
var fs = require('fs');
var xml2js = require('xml2js');
var snapdeal_scrap = require('./snapdeal_scrap.js');
var snapdeal_savespec = require('./snapdeal_savespec.js');
var config = require('../../config/config.js');
var mysql      = require('mysql');

var xmlparser = new xml2js.Parser();
var data='';
var count=0;
var productList=[];
var respCounter=[];
var productObj = [];
var productSpecId={};
var productLength=0;
var productCounter=0;
var startTime;
var productStartIndex=0;
var pool = '';
var category = '';

exports.initialize = function()
{
	pool      =    mysql.createPool({
		//	connectionLimit : 30, //important
		host     : config.host, 
		user     : config.user, 
		password : config.password,  
		database : config.database,
		multipleStatements:true
	});
	snapdeal_savespec.initialize();
}

exports.requestModule = function(cat,url){
	category= cat;
	var index = url.indexOf('http://');
	url = url.substring(7);
	
	var urlArr = url.split('/');
	var host = urlArr.splice(0,1)[0];
	var path = urlArr.join('/');
	
	var options = {
		host: host,
		port: 443,
		//path: '/affiliate/api/adminunlo.json',
		path : '/'+path,
		method: 'GET',
		//qs: {'expiresAt':'1424566055483', 'sig':'66630c0e5af3b46c135aebb23b2b74f7'},
		headers: {
			'User-Agent': 'Mozilla/5.0 (Windows; U; Windows NT 10.10; labnol;) ctrlq.org'
		}
	};
	
	sendRequest(options, parseProduct);
}	

function sendRequest(options,callback){
	console.log('sendRequest');
	var req = http.request(options, callback);
	//req.write(data);
	req.end();
}

function parseProduct(res){
	console.log('parseProduct');
	var data='';
	res.on('data', function (chunk) {
        data+=chunk;
	});
	res.on('end',function(){
		xmlparser.parseString(data, function (err, result) {
			if(err)
			{
				console.log("Error in xml file parsing:"+err);
			}
			else
			{
				var d = new Date();
				startTime = d.getTime();
				
				var xmlurl = result.urlset.url;
				var count = xmlurl.length;
				productLength = count;
				for(var i=0;i<count;i++)
				{
					snapdeal_scrap.scrapByCrawler(i, xmlurl[i].loc[0], category,getSpecCallBack);
				}	
			}
		});
	});
	
}

function getSpecCallBack(productIndex, obj,category, productDetails){
	productList[productIndex] = productDetails;
	productObj[productIndex] = obj;
	snapdeal_savespec.saveSpecifications(productIndex,obj,category, saveSpecCallBack);
}

function saveSpecCallBack(productIndex, specId,primeId,excluded)
{
	var time = new Date();
	var jsonDate = time.toJSON();
	var titleArr = snapdeal_scrap.productdetails_arr;
	var productAttributes = productList[productIndex];
	var productObject = productObj[productIndex];
	//console.log(productAttributes[titleArr[0]], productAttributes[titleArr[1]],productAttributes[titleArr[6]],productAttributes[titleArr[8]]);
	//var productShippingBaseInfo = productList[productIndex].productShippingBaseInfo;
	var sql = 'insert into `sepp_product_snapdeal` (`product_identifier`,`spec_id`,`prime_id`	,`product_brand`,`title`,`inStock`,`manufacturer_id`,`shipping`,`mrp`,`selling_price`,`date_added`,`date_modified`,`viewed`,`emi_available`,`cod_available`,`image`,`discount_percentage`,`product_url`) values ('+mysql.escape(productAttributes[titleArr[0]])+','+mysql.escape(specId)+','+mysql.escape(primeId)+','+mysql.escape(productObject['brand'])+','+mysql.escape(productAttributes[titleArr[9]])+','+mysql.escape(productAttributes[titleArr[8]])+','+mysql.escape(productObject['brand'])+','+mysql.escape(productAttributes[titleArr[3]])+','+productAttributes[titleArr[2]]+','+productAttributes[titleArr[1]]+','+mysql.escape(jsonDate)+','+mysql.escape(jsonDate)+','+1+','+mysql.escape(productAttributes[titleArr[5]])+','+mysql.escape(productAttributes[titleArr[4]])+','+mysql.escape('NA')+','+mysql.escape(productAttributes[titleArr[7]])+','+mysql.escape(productAttributes[titleArr[10]])+')';
	//console.log(sql);
	pool.query(sql, function(err, rows, fields) 
	{
		if (err) console.log(err);
		productCounter++;
		console.log('insserted:'+productIndex);
		if(productCounter==productLength){
			var d = new Date();
			var stopTime = d.getTime();
			var elapsedTime = stopTime - startTime;
			console.log('completed in '+elapsedTime);
			process.exit(0);
			return;
		}
		
	});
	
//}
}

function sortFunc(a,b){
	return a-b;
	}			