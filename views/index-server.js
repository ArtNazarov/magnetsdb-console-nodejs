var WebTor  = function(m)
{
	console.log('playbtn clicked');
	var WebTorrent = require('webtorrent');
	var client = new WebTorrent();
	//client.dht=true;
	//client.dhtPort=6881;	
	var torrentId = m;
	console.log('bundle.js:getting '+torrentId);
	client.add(torrentId, function (torrent) {
		console.log('Client is downloading:', torrent.infoHash);		
		torrent.files.forEach(function (file) {
			// Display the file by appending it to the DOM. Supports video, audio, images, and
			// more. Specify a container element (CSS selector or reference to DOM node).
			file.appendTo('body');
		});
		
	});
};

window.WT = WebTor;
