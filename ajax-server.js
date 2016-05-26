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
	var p = query.page;
	var offset = (p-1) * 10;
	var db_req = "SELECT * FROM data WHERE UPPER(caption) LIKE '%"+request+"%' ORDER BY caption LIMIT 10 OFFSET "+String(offset);
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

app.listen(port);
