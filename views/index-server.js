var WebTor  = function(m)
{
	
	
	var WebTorrent = require('webtorrent');
	
	var client = new WebTorrent();
	
	var testing = true;
	
	var torrentId = 'magnet:?xt=urn:btih:6a9759bffd5c0af65319979fb7832189f4f3c35d&dn=sintel.mp4&tr=wss%3A%2F%2Ftracker.btorrent.xyz&tr=wss%3A%2F%2Ftracker.fastcast.nz&tr=wss%3A%2F%2Ftracker.openwebtorrent.com&tr=wss%3A%2F%2Ftracker.webtorrent.io&ws=https%3A%2F%2Fwebtorrent.io%2Ftorrents%2Fsintel-1024-surround.mp4';
	
	if (!testing)
	{
	
	torrentId = m+"&tr=udp%3A%2F%2Ftracker.publicbt.com:80&tr=udp%3A%2F%2Ftracker.openbittorrent.com:80&tr=http%3A%2F%2Fretracker.local%2Fannounce"; 
	
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
