const readline = require('readline');
var sqlite3 = require("sqlite3").verbose();
var db = new sqlite3.Database('main-sqlite.db');
var p = 1;
var limit = 10;
var last_req = "";
var results = [];
var category = "";
var sql = "";
var labels = "";
var cache = {};
var cached = false;

var exec = require('child_process').exec;

function show_help(){
	console.log('/prev - previous page');
	console.log('/next - next page');
	console.log('/category name - set category');
	console.log('/limit number - change limit of records at one page');
	console.log('/labels string - add labels to request');
	console.log('/quit - exit app');
	console.log('other string - request to database');
}

function add_cache(){
	cache[sql] = results;
}

function in_cache(sql){
	if (sql in cache){
		return cache[sql]
	}
	else
	{
		return false;
	};		
}

function add_result(row){
	results.push(row);	
}

function row_handler(row){
	add_result(row);			
	console.log('Record No '+String(results.length));
	console.log('Category: ' + row.category);
	console.log('Caption: '+ row.caption);
	console.log('Labels: '+ row.labels);
	console.log('Hash: '+ row.hash);
}

function build_sql_request(request){
	offset = limit*(p-1);				
	
	var labels_part = "OR (labels LIKE '%"+labels+"%')";
	
	sql = "SELECT * FROM data WHERE ( caption LIKE '%"+request+"%') " + labels_part + "  ORDER BY caption LIMIT "+String(limit)+" OFFSET "+String(offset);
	
	if (category != ""){
		sql = "SELECT * FROM data WHERE ( caption LIKE '%"+request+"%') " +labels_part+ "  AND ( category LIKE '%"+category+"%' ) ORDER BY caption LIMIT "+String(limit)+" OFFSET "+String(offset);
	};	
}	

function make_request(db)
{
	
	db.serialize(function() { 						
		
		db.each(sql, function(err, row) {			
			row_handler(row);
		});
	});
	
	
}

function performRequest()
{
	
	var request = "";
	var stdin = process.openStdin();
	stdin.addListener("data", function(d) {
		request = d.toString().trim();	
		if ((request.charAt(0) != '!') && (request.charAt(0) != '/'))
		{
			last_req = request;
		};
		
		if (request == '/quit') 
		{
			process.exit();
		}
		else if (request == '/help') 
		{
			show_help();
		}
		else
		{
			if (request.indexOf('/limit') > -1)
			{
				limit = parseInt(request.split(' ')[1]);
				request = last_req;
			};
			
			if (request.indexOf('/labels') > -1)
			{
				labels = request.split(' ')[1];			
			};
			
			if (request.indexOf('/category') > -1)
			{
				category = request.split(' ')[1];			
			};
			
			if (request.indexOf('/download') > -1)
			{
				var downloadId = request.split(' ').slice(1).map( (x) => parseInt(x-1) );									
				console.log(results.length);			
				console.log(downloadId);
				for (var i=0;i<downloadId.length;i++)
				{
					console.log("qbittorrent magnet:?xt=urn:btih:"+results[downloadId[i]].hash); 			
					exec("qbittorrent magnet:?xt=urn:btih:"+results[downloadId[i]].hash); 			
				};
				request = last_req;			
			};
			
			if (request == '/next'){
				p = p + 1;
				request = last_req;
			}
			else if (request == '/prev'){
				p = p - 1;
				if (p<=0) {p = 1;};
										request = last_req;								
			};							
			if (request != "")
			{
				build_sql_request();
				
				console.log('- Page '+String(p)+ ' -');
				results = [];
				cached = in_cache(sql);				
				console.log('in cache:', (cached != false));
				console.log('total cache:');
				var t = 0;
				for (var i in cache) { t++ };
				console.log(t);							
				if (cached == false){											
						make_request(db);
						add_cache();
				}
				else
				{					
					console.log('from cache');
					cached.map( (row) => row_handler(row) );
				};
				//console.log(results.length);
				
			};
		}
	});
}

show_help();
performRequest();
