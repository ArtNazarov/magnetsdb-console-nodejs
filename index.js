const readline = require('readline');
var sqlite3 = require("sqlite3").verbose();
var db = new sqlite3.Database('main-sqlite.db');
var p = 1;
var limit = 10;
var last_req = "";
var results = [];

var exec = require('child_process').exec;

function show_help(){
	console.log('/prev - previous page');
	console.log('/next - next page');
	console.log('/limit number - change limit of records at one page');
	console.log('!quit - exit app');
}

function add_result(row){
	results.push(row);	
}

function make_request(db, request)
{
  
	db.serialize(function() { 		
		offset = limit*(p-1);				
		db.each("SELECT * FROM data WHERE caption LIKE '%"+request+"%' ORDER BY caption LIMIT "+String(limit)+" OFFSET "+String(offset), function(err, row) {			
			add_result(row);			
			console.log('Record No '+String(results.length));
			console.log('Category: ' + row.category);
			console.log('Caption: '+ row.caption);
			console.log('Labels: '+ row.labels);
			console.log('Hash: '+ row.hash);
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
		
		if (request == '!quit') 
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
		
		if (request.indexOf('/download') > -1)
		{
			var downloadId = parseInt(request.split(' ')[1]);						
			downloadId --;
			console.log(results.length);
			console.log('downloadId '+ downloadId);
			console.log(results[downloadId]);
			if (results.length>0)
			{
			console.log("qbittorrent magnet:?xt=urn:btih:"+results[downloadId].hash); 			
			exec("qbittorrent magnet:?xt=urn:btih:"+results[downloadId].hash); 			
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
				console.log('- Page '+String(p)+ ' -');
				results = [];
				make_request(db, request);				
				console.log(results.length);
			};
		}
	});
}


performRequest();
