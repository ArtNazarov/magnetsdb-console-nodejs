function like(str, delim, field, notmodifier, oper){ 
	if (str != "")
	{
		
	return "("+str.split(delim).map(function(v){return " ( UPPER("+field+") "+notmodifier+ " LIKE '%"+v.toUpperCase()+"%' )  ";}).join(oper)+")";
	}
	else
	{
		return "";
	};
	
};

function like_wrapper(str, delim, field)
{
	
	var AND_NOT_part = str.split(delim).filter( function(x) {return (x.charAt(0)=='-');}).map(function(v) {return v.substring(1);}).join(delim);
	var OR_part = str.split(delim).filter( function(x) {return (x.charAt(0)!='-');}).join(delim);
	var result = "";	
	var left_side = like(AND_NOT_part, delim, field, ' NOT ', ' AND ');
	var right_side = like(OR_part, delim, field, '', ' OR ');	
	console.log(left_side);
	console.log(right_side);
  var result = "";
	if ((left_side != "") && (right_side != ""))
	{
			result = left_side + ' AND '+right_side;
	};
	if ((left_side != "") && (right_side == ""))
	{
		result = left_side;
	};
	if ((left_side == "") && (right_side != ""))
	{
		result = right_side;
	};
	return result;
};

/* Response */
var RowsCollection = function(a){this.rows = a;};
RowsCollection.prototype.add = function(row) {this.getRows().push(row);};
RowsCollection.prototype.getRows = function(){return this.rows;};
RowsCollection.prototype.setRows = function(aRows){this.rows = aRows;};

var sqlite3 = require("sqlite3").verbose();
var express = require('express');
var bodyParser = require('body-parser');
var fs = require('fs');
var db = new sqlite3.Database('main-sqlite.db');
var url = require('url');
var port = 44444;


var fetching = function (request)
                    {        
                        this.done = false;
												this.rows = new RowsCollection([]);                      
                    };        
                    
fetching.prototype.getFetcher = function()
{
    var h = this;
    var r =  function(row) {                                                                                      
       h.rows.add(row);                                                                                                                
    };
    return r;
}
 

var app = express();


app.use(bodyParser.urlencoded({ extended: false }))

app.get('/', function(req, res){
		
		fs.readFile('views/index-ajax.html',function (err, data){
			if (err) {
				res.writeHead(404, {'Content-Type': 'text/html'});
				res.write('404');
				res.end();  
				console.error(err);				
			}
			else
			{
		res.writeHead(200, {'Content-Type': 'text/html','Content-Length':data.length});
		res.write(data);
		res.end();  
			}
		});
 
});


app.get('/ajax', function(req, res){

	
	
	var url_parts = url.parse(req.url, true);
	var query = url_parts.query;
	//console.log(query); 
	var request = query.search.toUpperCase();	
  var labels = query.labels.toUpperCase();
	var category = query.category.toUpperCase();
	var p = query.page;
	var offset = (p-1) * 10;
	var labels_part = "";
	var category_part = "";
	var caption_part = "";
	var ordering_part = " ORDER BY caption ";
	
	if (labels != "")
	{
		labels_part = like_wrapper(labels, ',', 'labels');		
	};
	
	if (request != "")
	{
		caption_part = like_wrapper(request, ',', 'caption');
		if (caption_part != "") {caption_part = caption_part + " AND ";}
		else { caption_part = " (1=1) AND";};						
	};	
	
	if (category != "")
	{
		category_part = like_wrapper(category, ',', 'category');
	  if (category_part != "")
		{
				category_part = category_part + " AND ";
		};
	};	
	
	var db_req = "SELECT * FROM data WHERE "+ caption_part + category_part + labels_part + ordering_part +" LIMIT 10 OFFSET "+String(offset);
	console.log(request);
	console.log(offset);
	console.log(db_req);
  var Render = new fetching(request);  
  var func = Render.getFetcher(Render); 
	
    Render.counter = 0;
    Render.done = false;
    db.all(db_req, 
            function(err, rows) {
                
                    rows.forEach(
                                    Render.getFetcher()
                                );
  
										res.send(JSON.stringify(Render.rows.getRows()));
                
                
            });		
});

var server = app.listen(port);

var gracefulShutdown = function() {

	console.log("Received kill signal, shutting down gracefully.");
	server.close(function() {
		console.log("Closed out remaining connections.");
		db.close();
		process.exit()
	});
	

	setTimeout(function() {
		console.error("Could not close connections in time, forcefully shutting down");
		db.close();
		process.exit()
	}, 10*1000);
}


process.on ('SIGTERM', gracefulShutdown);


process.on ('SIGINT', gracefulShutdown);   
