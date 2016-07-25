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
	console.log('/search string - request to database');
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
	if (row)
	{
	//console.log(row);
	add_result(row);			
	console.log('Record No '+String(results.length));
	console.log('Category: ' + row.category);
	console.log('Caption: '+ row.caption);
	console.log('Labels: '+ row.labels);
	console.log('Hash: '+ row.hash);
	}
	else
	{
		//console.log('ERROR:no rows');
	};
}

function build_sql_request(){
	offset = limit*(p-1);				
	var op = "SELECT * FROM data WHERE ";
	var labels_part = "";
	var category_part = "";
	var caption_part = " ( caption LIKE '%"+request+"%') ";
	var order_part = "  ORDER BY caption ";
	var limit_part = " LIMIT "+String(limit);
	var offset_part = " OFFSET "+String(offset);	
	
	if (labels != ""){	
		labels_part = " OR (labels LIKE '%"+labels+"%') ";
	};
	
	if (category != ""){
		category_part = "  AND ( category LIKE '%"+category+"%' ) ";
	}
	
	sql = op+caption_part+labels_part+category_part+ order_part+limit_part+offset_part;
  //console.log('builded:', sql);
}	

function make_request(db)
{
	
	console.log('use sql:', sql);
	
	db.serialize(function() { 						
		
		db.each(sql, function(err, row) {	
			//console.log(row);
			row_handler(row);
		});
	});
	
	
}

var actionOnQuit = function(){
	process.exit();
}

var actionOnHelp = function(){
	show_help();
}

var actionOnLimit = function(){
	limit = parseInt(request.split(' ')[1]);
	request = last_req;
}

var actionOnLabels = function(){
	labels = request.split(' ')[1];			
}

var actionOnCategory = function(){
	category = request.split(' ')[1];
}

var actionOnDownload = function(){
	var downloadId = request.split(' ').slice(1).map( (x) => parseInt(x-1) );									
	console.log(results.length);			
	console.log(downloadId);
	for (var i=0;i<downloadId.length;i++){
		console.log("qbittorrent magnet:?xt=urn:btih:"+results[downloadId[i]].hash); 			
		exec("qbittorrent magnet:?xt=urn:btih:"+results[downloadId[i]].hash); 			
	};
	request = last_req;			
}	

var actionOnNext = function(f){
	return function(){
	p = p + 1;
	request = last_req;
	f();
	};
}

var actionOnPrev = function(f){
	return function(){
	p = p - 1;
	if (p<=0) {p = 1;};
	request = last_req;		
	f();
	};
}

var actionOnSearch = function(){
	
	request = request.slice("/search".length+1);
	
	console.log('search:', request);
	
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
}

var prepareRequest = function(d, checks){
	request = d.toString().trim();	
	
	if (request.indexOf('/search') > -1){
		last_req = request;
	};
	
	checks();
}

var actions = {
	"/quit" : actionOnQuit,
	"/help" : actionOnHelp,
	"/limit" : actionOnLimit,
	"/labels" : actionOnLabels,
	"/category" : actionOnCategory,
	"/prev"     : actionOnPrev(actionOnSearch),
	"/next"     : actionOnNext(actionOnSearch),
	"/search"   : actionOnSearch,
	"/download" : actionOnDownload
}

var checkAction = function(){
	//console.log('Request is:', request);
	for (var i in actions){
		//console.log(i);
		if (request.indexOf(i)>-1){
				//console.log('found:', i);
				actions[i]();
				break;
		};
	};	
}


var main_listener = function(d){		
	prepareRequest(d, checkAction);					
}

function waitRequests(){		
	var stdin = process.openStdin();
	stdin.addListener("data", function(d) {
		main_listener(d);		
	});
}

show_help();
waitRequests();
