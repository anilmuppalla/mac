var SpotifyWebApi = require('spotify-web-api-node');
var difflib = require('difflib');

var spotifyApi = new SpotifyWebApi({
  clientId : '5404d36c8bfe444cb1ca8ad56a3569c0',
  clientSecret : '0ac167a19f064eafa153e0f01dd8e2f0'
});

var arr =[{"Rap God" : "Eminem"},
{"Lose Yourself" : "Eminem"},
{"Hold Up" : "Beyoncé"},
{"One and Only" : "Adele"},
{"Beautiful" : "Eminem"},
{"Dream On" : "Aerosmith"},
{"Mark My Words" : "Justin Bieber"},
{"Fall" : "Justin Bieber"},
{"Lose Yourself (Soundtrack Version)" : "Eminem"},
{"With or Without You" : "U2"}];	

/*
[1, 3, 5, 7, 9].reduce((seq, n) => {
    return seq.then(() => {
        console.log(n);
        return new Promise(res => setTimeout(res, 1000));
    });
}, Promise.resolve()).then(
    () => console.log('done'),
    (e) => console.log(e)
);
*/


function matcher(artist, data){
	for (var track of data.body.tracks.items){
			// if (difflib.SequenceMatcher(data.body.tracks.items[item].artists[0]['name']){
			for( var spArtist of track.artists){
				var s = new difflib.SequenceMatcher(null, spArtist.name, artist);
				// console.log(track.name, ":", spArtist.name, ":" , artist, ":", s.ratio());
				if( s.ratio() > 0.5){
				console.log(spArtist.name);
				}
			}
				
		}
}

arr.reduce((seq, n) => {
	console.log("Processing : ", n);
    return seq.then(() => {
    	var track_name = Object.keys(n);
        return spotifyApi.searchTracks(track_name, {"limit" : 10})
        .then(matcher.bind(null, n[track_name]));
    });
}, Promise.resolve()).then(
    () => console.log('done'),
    (e) => console.log(e)
);


/*
	
arr.reduce(function(spotifyApi, url){
	return spotifyApi.searchTracks("Shake That", {"limit" : 10})
	.then(function(data){
		// console.log(data.body.tracks.items)
		for (var track of data.body.tracks.items){
			// if (difflib.SequenceMatcher(data.body.tracks.items[item].artists[0]['name']){
			var s = new difflib.SequenceMatcher(null, track.artists[0].name, "Eminem");
			console.log(track.name, ":", track.artists[0].name, ":" , "Eminem", ":", s.ratio())
			if( s.ratio() > 0.5){
				console.log(track.artists[0].name);
			}
		}
	}, function(err){
		console.log(err);
	});
})

/*
spotifyApi.searchTracks("Shake That", {"limit" : 10})
	.then(function(data){
		// console.log(data.body.tracks.items)
		for (var track of data.body.tracks.items){
			// if (difflib.SequenceMatcher(data.body.tracks.items[item].artists[0]['name']){
			var s = new difflib.SequenceMatcher(null, track.artists[0].name, "Eminem");
			console.log(track.name, ":", track.artists[0].name, ":" , "Eminem", ":", s.ratio())
			if( s.ratio() > 0.5){
				console.log(track.artists[0].name);
			}
		}
	}, function(err){
		console.log(err);
	});
*/