if (!process.env.token) {
	console.log('Error: Specify token in environment');
	process.exit(1);
}

var Botkit = require('botkit');
var os = require('os');
var SpotifyWebApi = require('spotify-web-api-node');
var request = require('request')
var difflib = require('difflib');

var controller = Botkit.slackbot({
	debug: false,
});

var bot = controller.spawn({
	token: process.env.token
}).startRTM();

var spotifyApi = new SpotifyWebApi({
  clientId : '5404d36c8bfe444cb1ca8ad56a3569c0',
  clientSecret : '0ac167a19f064eafa153e0f01dd8e2f0'
});

var encodeQueryFromArgs = function(args){
			var result="?", counter = 1;
			// create enconded URL from args
			for (var key in args) {
				var keyValue = "";
				if ( args[key] instanceof Array )  { 
					/* 
					 * We are dealing with an array in the query string  ?key=Value0&key=Value1 
					 * That a REST application translates into key=[Value0, Value1]
					 */
					for ( var ii=0, sizeArray = args[key].length; ii < sizeArray; ii++ ) {
						result = result.concat((counter > 1 ? "&": "") + key + "=" + encodeURIComponent(args[key][ii]));
						counter++;
					}
				} else { //No array, just a single &key=value
				   keyValue = key + "=" + encodeURIComponent(args[key]);
				   result = result.concat((counter > 1 ? "&":"") + keyValue);
				}
				
				counter++;
			}

			return result;
		}
		
var matcher = function(artist, bot, message, data){
	var trackUrls = {};
	for (var track of data.body.tracks.items) {
		for (var spArtist of track.artists) {
			var s = new difflib.SequenceMatcher(null, spArtist.name, artist);
			// console.log(track.name, ":", spArtist.name, ":" , artist, ":", s.ratio());
			if (s.ratio() == 1) {
				// trackUrls.push(track);
				// console.log(track.external_urls.spotify);
				trackUrls[track.name] = track.external_urls.spotify;
			}
		}
	}

	/*
	trackUrls.sort(function(a,b) {
		if(a.popularity < b.popularity)
			return 1;
		if(a.popularity > b.popularity)
			return -1;
		return 0;
	});
	// console.log(trackUrls);
	*/
	for (var track in trackUrls){
		// console.log(trackUrls[track]);
		bot.reply(message, trackUrls[track]);
	}
}

controller.hears('.*', ['direct_message', 'direct_mention', 'mention'], function(bot, message) {
	var input = message.text;
	params = {"apikey": 'eddca3beccf778ab522216a01e6bc3f4',
					  "f_has_lyrics": 1,
					  "format": "json",
					  "page" : 1,
					  "page_size" : 5,
					  "s_track_rating":"desc",
						"q_lyrics" : input}
	
	query = "http://api.musixmatch.com/ws/1.1/track.search" + encodeQueryFromArgs(params)

	request.get(query, function(error, response, body){
		parsed = JSON.parse(body)
		track_list = parsed["message"]["body"]["track_list"]
		
		var tracks = [];
		for(item in track_list){
			var item = track_list[item]["track"];
			var track_name = item["track_name"];
			var artist = item["artist_name"];
			var data = {};
			data[track_name] = artist;
			tracks.push(data);
			// console.log(item["track_name"], ":", item["artist_name"]);
		}
		// console.log(tracks);
		
		tracks.reduce((seq, n) => {
				// console.log("Processing key: "value",  ", n);
				return seq.then(() => {
					var track_name = Object.keys(n);
					return spotifyApi.searchTracks(track_name, {
							"limit": 10
						})
						.then(matcher.bind(null, n[track_name], bot, message));
				});
			}, Promise.resolve()).then(
				() => console.log("done"),
				(e) => console.log(e)
			);
			/*spotifyApi.searchTracks(track_name, {"limit" : 	10})
			.then(function(data){
				// console.log(data.body.tracks.items)
				for (var track of data.body.tracks.items){
					// if (difflib.SequenceMatcher(data.body.tracks.items[item].artists[0]['name']){
					var s = new difflib.SequenceMatcher(null, track.artists[0].name, artist);
					console.log(track.name, ":", track.artists[0].name, ":" , artist, ":", s.ratio())
					if( s.ratio() > 0.5){
						console.log(track.artists[0].name);
					}
				}
			}, function(err){
				console.log(err);
			});*/
	});

	// bot.reply(message,'Hello yourself.');

});