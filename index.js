const readline = require('readline');
var sqlite3 = require("sqlite3").verbose();
var db = new sqlite3.Database('main-sqlite.db');


function make_request(db, request)
{

	db.serialize(function() { 


		db.each("SELECT * FROM data WHERE caption LIKE '%"+request+"%' ORDER BY caption LIMIT 10 ", function(err, row) {			
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
		if (request == '!quit') 
		{
			process.exit();
		}
		else
		{
		make_request(db, request);		
		};
	});
}


performRequest();
