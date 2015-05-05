//var querystring = require('querystring');
var http = require('https');
var fs = require('fs');
var xml2js = require('xml2js');
var snapdeal_scrap = require('./snapdeal_scrap.js');
var snapdeal_savespec = require('./snapdeal_savespec.js');
var xmlparser = new xml2js.Parser();
var data='';
var count=0;
var productList=[];
var respCounter=[];
var productSpecId={};
var productLength=0;
var productCounter=0;
var startTime;
var productStartIndex=0;
snapdeal_savespec.initialize();
//snapdeal_spec.getSpecIdCallBack(9);
//getSpecifications(0,'http://dl.snapdeal.com/dl/sony-vaio-vpceb31en-laptop-1st-gen-pdc-2gb-320gb-win7-hb/p/itmczctntqcqrbav?pid=COMCV7N83NKWCHG5&affid=adminunlo', getSpecCallBack);
//requestModule();
requestProduct('http://www.snapdeal.com/sitemap/computers/computers-laptops/sitemap_computers-laptops_0.xml');
//snapdeal_scrap.scrapByCrawler(0, 'http://www.snapdeal.com/product/hp-15r249tu-notebook-l2z88pa-4th/687184709662', 'laptops',getSpecCallBack);
var mysql      = require('mysql');
	var pool      =    mysql.createPool({
		connectionLimit : 500, //important
		host     : 'localhost',  
		 user     : 'lexus',  
		 password : 'lexus',  
		database : 'lexus',
		multipleStatements:true
	});
	
function requestModule(){
console.log('requestModule');
	var options = {
		host: 'affiliate-api.snapdeal.net',
		port: 443,
		path: '/affiliate/api/adminunlo.json',
		method: 'GET',
		headers: {
			'Content-Type': 'application/Json',
			'Fk-Affiliate-Id':'adminunlo',
			'Fk-Affiliate-Token':'ffe2e97a293c4ead888f8016aa10950b'
		}
	};
	sendRequest(options,parseModules);
}

function sendRequest(options,callback){
console.log('sendRequest');
	var req = http.request(options, callback);
	//req.write(data);
	req.end();
}

function parseModules(res){
console.log('parseModules');
	res.on('data', function (chunk) {
        data+=chunk;
	});
	res.on('end',function(){
		var jsonData = JSON.parse(data);
		var productURL = jsonData.apiGroups.affiliate.apiListings.kitchen_appliances.availableVariants['v0.1.0'].get;
		
		requestProduct(productURL);
		console.log(productURL);
	});
}



function requestProduct(url){
console.log(url);
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

function parseProduct(res){
console.log('parseProduct');
var data='';
res.on('data', function (chunk) {
        data+=chunk;
		//console.log(chunk);
	});
	res.on('end',function(){
		//console.log(data);
		xmlparser.parseString(data, function (err, result) {
				if(err)
				{
					console.log("Error in xml file parsing:"+err);
				}
				else
				{
					var xmlurl = result.urlset.url;
					console.log(xmlurl);
					// return;
					var count = xmlurl.length;
					//console.log(count);
					for(var i=0;i<xmlurl.length;i++)
					{
						snapdeal_scrap.scrapByCrawler(i, xmlurl[i].loc[0], 'laptops',getSpecCallBack);
					}
					//file.end();
					
				}
			});
		//scrapByCrawler();
	});

}

function getSpecCallBack(productIndex, obj,category, productDetails){
	console.log('final obj:');
	//console.log(obj);
	//console.log(productDetails);
	//productCounter++;
	productList[productIndex] = productDetails;
	snapdeal_savespec.saveSpecifications(productIndex,obj,category, saveSpecCallBack);
}

function saveSpecCallBack(productIndex, specId){
	//productCounter++;
	console.log(saveSpecCallBack);
	console.log('specid'+specId);
	//return;
	var time = new Date();
	var jsonDate = time.toJSON();
		var specIdStr = specId;
		console.log('specStr'+specIdStr);
		//console.log('totalSpecsId:'+productSpecId);
		console.log('productIndex:'+productIndex);		
		
		var productIdentifier = productIndex;
		var productAttributes = productList[productIndex];
		
		var titleArr = ["Price","MRP","Delivery","COD","EMI","Offers","Discount","STOCK","URL","Title","ProductId"];
		
		//console.log(productAttributes[titleArr[0]], productAttributes[titleArr[1]],productAttributes[titleArr[6]],productAttributes[titleArr[8]]);
		//var productShippingBaseInfo = productList[productIndex].productShippingBaseInfo;
		var sql = 'insert into `sepp_product_snapdeal` (`product_identifier`,`spec_id`,`product_brand`,`title`,`inStock`,`manufacturer_id`,`shipping`,`mrp`,`selling_price`,`date_added`,`date_modified`,`viewed`,`emi_available`,`cod_available`,`image`,`discount_percentage`,`product_url`) values ('+mysql.escape(productAttributes[titleArr[10]])+','+mysql.escape(specIdStr)+','+mysql.escape('')+','+mysql.escape(productAttributes[titleArr[9]])+','+mysql.escape('yes')+','+1+','+1+','+productAttributes[titleArr[1]]+','+productAttributes[titleArr[0]]+','+mysql.escape(jsonDate)+','+mysql.escape(jsonDate)+','+1+','+mysql.escape('yes')+','+mysql.escape('yes')+','+mysql.escape('')+','+mysql.escape(productAttributes[titleArr[6]])+','+mysql.escape(productAttributes[titleArr[8]])+')';
		//console.log(sql);
		pool.query(sql, function(err, rows, fields) 
		{
			if (err) console.log(err);
			console.log('insserted:'+productIndex);
		});
		//if(productCounter==productLength){
		var d = new Date();
	    var stopTime = d.getTime();
		var elapsedTime = stopTime - startTime;
			console.log('completed in '+elapsedTime);
		//}
	//}
}

function sortFunc(a,b){
	return a-b;
}