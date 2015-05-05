// var http = require('http');
 // http.globalAgent.maxSockets = 64;
var crawler = require('crawler');
//var scrapobj = require('./flipkart_scrapobj.js').obj;
var url = require('url');
var request = require('request');
var cheerio = require('cheerio');
var mysql      = require('mysql');
//var fs = require('fs');
var respPending=0;
var productSpecId=0;
// file is included here:
//eval(fs.readFileSync('specificationClass.js')+'');

//var url = "http://www.snapdeal.com/product/dell-vostro-15-3546-laptop/1140111419";
//var url = "http://www.snapdeal.com/product/dell-vostro-15-3546-laptop/1140111419";

var count = 1;
var separateReqPool = {maxSockets: 50};

var titleArr = ["brand","modelname","modelid","processor","systemmemory","hddcapacity","ssdcapacity","operatingsystem","graphicprocessor","screentype"]; 
//Key-value pair --> Key represents flipkart page keyword and value represents unlockprice keyword
var snapdealAdapterObj = {"brand":"brand","modelname":"modelname","modelnumber":"modelid","processorname":"cpu","systemmemory":"ram","harddiskcapacity":"hdd","ssdcapacity":"ssd","operatingsystem":"os","graphicprocessor":"graphics","screentype":"touch"};


//var flipkartAdapterObj = {"brand":"model","processor":"processor","systemmemory":"ram","hddcapacity":"hdd","operatingsystem":"os","graphicscard":"graphics"}
 var finalObj = {};
 
var crawlerObj = new crawler({
	maxConnections:50,
	callback: function(){}
});
//console.log(scrapobj.laptops);
//scrapByCrawler(0, 'http://dl.flipkart.com/dl/sony-bravia-kdl-32w600a-80-cm-32-led-tv/p/itmdtmzftntyrywd?pid=TVSDTMZFNFRZD6AP&affid=adminunlo', 'televisions',getSpecIdCallBack);

exports.scrapByCrawler=function(productIndex,url,category, callback){
//console.log('getSpecifications');
   crawlerObj.queue({
            uri: url,
			userAgent: 'Mozilla/5.0 (Windows; U; Windows NT 10.10; labnol;) ctrlq.org',
        callback: function(err, resp, $){
		if(!err)
	    {
			var url = $("#og-url").attr("content");							
				console.log(count);
				if(url)
				{
					var temp = url.split("/");
					var productid = temp[temp.length-1].replace(/\s/g, '');
					//console.log(url + ":"+productid);
					var obj = {};
					$(".product-spec tr").each(function(index,item)
					{
						var key = $(this).children("td:nth-child(1)").text();
						var value = $(this).children("td:nth-child(2)").text();
						key = key.replace(/\s/g, '').toLowerCase();
						value = value.replace(/\s/g, '').toLowerCase();
						if(snapdealAdapterObj.hasOwnProperty(key) && !obj.hasOwnProperty(snapdealAdapterObj[key]))
						{
							obj[snapdealAdapterObj[key]]=value;
						}	
					});					
					
					var finalobj={}
					for(var key in snapdealAdapterObj){
						if(obj.hasOwnProperty(snapdealAdapterObj[key])){
							finalobj[snapdealAdapterObj[key]]=obj[snapdealAdapterObj[key]];
						}else{
							finalobj[snapdealAdapterObj[key]] = 'X'
						}
					}
					
					var stock = "";
					temp = $(".notifyMe-soldout").text();
					if(temp)
					stock = "Not Available";
					else
					stock = "Available";
				
					var productdetails ={'ProductId':productid ,'Price':$("#selling-price-id").text() , 'MRP': $("#original-price-id").text(),'Delivery':$(".standardDeliveryText").text(),'COD':$("#cod-outer-box").text().replace(/\s/g, ''),'EMI':$("#emi-outer-box").text().replace(/\s/g, ''),'Offers':$(".ClsOfferText").text(),'Discount':$("#discount-id").text(),'STOCK':stock};								
								
			console.log(obj);
			callback(productIndex, finalobj,category, productdetails);
			return; 
		}
	}
	}
	});
}
	function UpdateProduct(productdetails)
	{
		var titleArr = ["Price","Delivery","COD","EMI","Offers","Discount","STOCK"];	
		
		for(var i=0;i<titleArr.length;i++){
									//key[i]=obj[titleArr[i]]!=undefined?obj[titleArr[i]] : "X";
									if(productObj.hasOwnProperty(titleArr[i])){
									productObj										
										
									}
								}
	}
 
   