function maybe_upper(str,  flag)
{
	 var result = "";
	 if (!flag)
	 {
		 result = str;
	 }
	 else
	 {
		 result = str.toUpperCase();
	 };
	 //console.log(result);
	 return result;
}

function like(str, delim, field, notmodifier, oper, umode){ 
	if (str != "")
	{
  
	return "("+str.split(delim).map(function(v){
		if (umode)
		{
			return 	" ( UPPER("+field+") "+notmodifier+ " LIKE '%"+maybe_upper(v, umode)+"%' )  ";
		}
		else
		{
			return 	" ( "+field+" "+notmodifier+ " LIKE '%"+maybe_upper(v, umode)+"%' )  ";
		};			
	}).join(oper)+")";
	}
	else
	{
		return "";
	};
	
};

function like_wrapper(str, delim, field, umode)
{
	
	var AND_NOT_part = str.split(delim).filter( function(x) {return (x.charAt(0)=='-');}).map(function(v) {return v.substring(1);}).join(delim);
	var OR_part = str.split(delim).filter( function(x) {return ((x.charAt(0)!='-')&&(x.charAt(0)!='+'));}).join(delim);
	var AND_part = str.split(delim).filter( function(x) {return (x.charAt(0)=='+');}).map(function(v) { return v.substring(1);}).join(delim);
	var result = "";	
	var p = [];
	var q;
	q = like(AND_NOT_part, delim, field, ' NOT ', ' AND ', umode);
	if (q != "") { p.push("(" + q + ")"); };
	q = like(OR_part, delim, field, ' ', ' OR ', umode);	
	if (q != "") { p.push("(" + q + ")"); };
	q = like(AND_part, delim, field, ' ', ' AND ', umode);
	if (q != "") { p.push("(" + q + ")"); };
  result = p.join(' AND ');
	console.log('['+result+']');
	return result;
};

function wh_constr(caption, labels, category)
{
		var result = "";
		if (caption != "")
			{
					result = caption;
			};
		if (labels != "")
		{
			 if (result!="")
			 {result = result + ' AND ' + labels}
			 else
			 {
				 result = labels;
			 };
		};
		if (category != "")
		{
			if (result!="")
			{
				result = result + ' AND ' + category;
			}
			else
			{
				result = category;
			};
		};
		return result;
}

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
var upper_mode = false;
var cache = {};


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

app.use('/views', express.static(__dirname + '/views'));
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

var cache_save = function()
{
	fs.writeFile('./cache.json', JSON.stringify(cache) , 'utf-8');
}

var cache_restore = function()
{
	cache = JSON.parse(fs.readFileSync('./cache.json', 'utf8'));
	console.log('cache loaded');
}

function fileExists(filePath)
{
	try
	{
		return fs.statSync(filePath).isFile();
	}
	catch (err)
	{
		return false;
	}
}

var restore_cache_safe = function()
{
	if (fileExists('./cache.json'))
	{
		console.log('cache file:ok');
		cache_restore();
	};
}

app.get('/cache/save', function(req, res)
{
	cache_save();
	res.send('The cache was saved');
});

app.get('/cache/restore', function(req, res)
{
	restore_cache_safe();
	res.send('The cache was restored');
});

restore_cache_safe();

app.get('/ajax', function(req, res){

	
	
	var url_parts = url.parse(req.url, true);
	var query = url_parts.query;	
	var request = "";
	if ('search' in query)
	{
	//console.log(query.search);
	request = maybe_upper(query.search, upper_mode);
	console.log(request);
	};
	var labels = "";
	if ('labels' in query) 
	{
	//console.log(query.labels);
  labels = maybe_upper(query.labels, upper_mode);
	};	
	var category = "";
	if ('category' in query) 
	{
	//console.log(query.category);
	category = maybe_upper( query.category, upper_mode);
	};
	
	var p = 1;
	if ('page' in query)
	{
	p = parseInt(query.page);
	};	
	var limit = 256;
	var offset = (p-1) * limit;
	var labels_part = "";
	var category_part = "";
	var caption_part = "";
	var ordering_part = " ORDER BY caption ";
	
	if (labels != "")
	{
		labels_part = like_wrapper(labels, ',', 'labels', upper_mode);		
	};
	
	if (request != "")
	{
		caption_part = like_wrapper(request, ',', 'caption', upper_mode);
		if (caption_part == "") { caption_part = " (1=1) "; };
	};	
	
	if (category != "")
	{
		category_part = like_wrapper(category, ',', 'category', upper_mode);	  
	};	
	
	
	
	
	var whc = wh_constr(caption_part, labels_part, category_part);
	if (whc.trim() == "") {whc = " ( 1=1 ) ";};
	var db_req = "SELECT * FROM data WHERE " + whc + ordering_part +" LIMIT "+String(limit)+" OFFSET "+String(offset);
	
	if (db_req in cache)
	{
		console.log('send from cache');
		res.send(cache[db_req]);
	}
	else
	{ // real request to database
	//console.log(request);
	//console.log(offset);
	//console.log(db_req);
	
	
  var Render = new fetching(request);  
  var func = Render.getFetcher(Render); 
	
    Render.counter = 0;
    Render.done = false;
    db.all(db_req, 
            function(err, rows) {
                
                    rows.forEach(
                                    Render.getFetcher()
                                );
										
										cache[db_req] = JSON.stringify(Render.rows.getRows());
										cache_save();
										res.send(cache[db_req]);
                
                
            });		
	};		
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
