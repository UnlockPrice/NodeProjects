// var http = require('http');
 // http.globalAgent.maxSockets = 64;
var crawler = require('crawler');
var scrapobj = require('./amazon_scrapobj.js').obj;
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

//var flipkartAdapterObj = {"brand":"model","processor":"processor","systemmemory":"ram","hddcapacity":"hdd","operatingsystem":"os","graphicscard":"graphics"}
 var finalObj = {};
 
var crawlerObj = new crawler({
	maxConnections:50,
	callback: function(){}
});
//console.log(scrapobj.laptops);


exports.scrapByCrawler=function(productIndex,url,ProductDetails,category, callback){
//console.log('getSpecifications Test');
   crawlerObj.queue({
            uri: url,
			userAgent: 'Mozilla/5.0 (Windows; U; Windows NT 10.10; labnol;) ctrlq.org',
        callback: function(err, resp, $){
		if(!err)
	    {
			//var url = $("#og-url").attr("content");							
            //console.log(url);
				if(url)
				{
					var temp = url.split("/");
					var productid = temp[temp.length-1].replace(/\s/g, '');
					console.log(url + ":"+productid);
					var obj = {};
					$("div.pdTab table tr").each(function(index,item)
					{
						var key = $(this).children("td:nth-child(1)").text();	
						key = key.replace(/\s/g, '').toLowerCase();
						
						if(scrapobj[category].hasOwnProperty(key) && !obj.hasOwnProperty(scrapobj[category][key]))
						{
							var value = $(this).children("td:nth-child(2)").text();
							value = value.replace(/\s/g, '').toLowerCase();
							obj[scrapobj[category][key]]=value;	
						}					
					});	
					
					for(var key in scrapobj[category])
					{
					   //console.log(key+' test data '+ProductDetails[key]);
					   if(ProductDetails.hasOwnProperty(key))	
					   {
						   console.log(key+' test data '+ProductDetails[key][0]);
						   obj[key]=ProductDetails[key][0];
					   }
					}	
					//console.log(ProductDetails);
							
					var saleprice = $("#priceblock_saleprice").text();
					var ourprice = $("#priceblock_ourprice").text();
					
					var price ;
					
					if(saleprice)
					{
						price = saleprice;
					}
					else if(ourprice)
					{
						price = ourprice;
					}
					else
					{
						price =$(".a-color-price").first().text();
					}
										
					var mrp = $('#currencyINR').next().text();
					var emi =$("#inemi_feature_div").clone().children().remove().end().text().trim();
					var stock = $("#availability").clone().children().remove().end().text().trim();
					var cod = $("#saleprice_shippingmessage").clone().children().remove().end().text().trim();
					
					if(!stock)
					{
					 stock =$("#availability :first-child").text().trim();
					}
					
					var discount ;
					$('#price table tr').each(function(index,item)
					{
						//console.log('discutn');
						discount = $(this).children("td:nth-child(2)").text().trim();	
					});
					
					//console.log('price:'+ price);
					//console.log('mrp:'+ mrp);
					//console.log('emi:'+ emi);
					//console.log('stock:'+ stock);
					//console.log('cod:'+ cod);
					//console.log('discount:'+ discount);
				
				
					var productdetails ={'ProductId':productid ,'Price': price , 'MRP': mrp,'Delivery':'No','COD':cod,'EMI':emi,'Offers':$(".ClsOfferText").text(),'Discount':discount,'STOCK':stock};	
								
			console.log(obj);
			callback(productIndex, 2);
			return; 
		}
	}
	}
	});
}
   