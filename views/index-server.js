var WebTor  = function(m)
{
	
	
	var WebTorrent = require('webtorrent');
	
	var client = new WebTorrent();
	
	var testing = false;
	
	var trackers = '&tr=wss%3A%2F%2Ftracker.btorrent.xyz&tr=wss%3A%2F%2Ftracker.fastcast.nz&tr=wss%3A%2F%2Ftracker.openwebtorrent.com&tr=wss%3A%2F%2Ftracker.webtorrent.io';
	
	var test_magnet = "magnet:?xt=urn:btih:6a9759bffd5c0af65319979fb7832189f4f3c35d&dn=sintel.mp4";
	
	var torrentId = test_magnet+trackers;
	
	if (!testing)
	{
		torrentId = m+trackers; 
	};
	
	
	
	client.add(torrentId, function (torrent) {
		// Torrents can contain many files. Let's use the first.
		var file = torrent.files[0];
		
		// Display the file by adding it to the DOM.
		// Supports video, audio, image files, and more!
		//file.appendTo('body');
		file.appendTo('#viewer');
		
	});
	
};

window.WT = WebTor;
