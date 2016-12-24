var Botkit = require('botkit');
var env = require('./env.js')
var os = require('os');
var SpotifyWebApi = require('spotify-web-api-node');
var request = require('request')
var difflib = require('difflib');

if (!process.env.slackClientId || !process.env.slackClientSecret || !process.env.port || !process.env.redirectUri) {
  console.log('Error: Specify clientId clientSecret redirectUri and port in environment');
  process.exit(1);
}

var controller = Botkit.slackbot({
  json_file_store: './db_slackbutton_bot/',
  // rtm_receive_messages: false, // disable rtm_receive_messages if you enable events api
}).configureSlackApp({
  clientId: process.env.slackClientId,
  clientSecret: process.env.slackClientSecret,
  redirectUri: process.env.redirectUri,
  scopes: ['bot'],
});

var spotifyApi = new SpotifyWebApi({
  clientId: process.env.spotifyClientId,
  clientSecret: process.env.spotifyClientSecret
});

var encodeQueryFromArgs = function(args) {
  var result = "?",
    counter = 1;
  // create enconded URL from args
  for (var key in args) {
    var keyValue = "";
    if (args[key] instanceof Array) {
      /* 
       * We are dealing with an array in the query string  ?key=Value0&key=Value1 
       * That a REST application translates into key=[Value0, Value1]
       */
      for (var ii = 0, sizeArray = args[key].length; ii < sizeArray; ii++) {
        result = result.concat((counter > 1 ? "&" : "") + key + "=" + encodeURIComponent(args[key][ii]));
        counter++;
      }
    } else { //No array, just a single &key=value
      keyValue = key + "=" + encodeURIComponent(args[key]);
      result = result.concat((counter > 1 ? "&" : "") + keyValue);
    }
    counter++;
  }
  return result;
}

controller.setupWebserver(process.env.port, function(err, webserver) {
  controller.createWebhookEndpoints(controller.webserver);
  controller.createOauthEndpoints(controller.webserver, function(err, req, res) {
    if (err) {
      res.status(500).send('ERROR: ' + err);
    } else {
      res.send('Success!');
    }
  });
});

// just a simple way to make sure we don't
// connect to the RTM twice for the same team
var _bots = {};

function trackBot(bot) {
  _bots[bot.config.token] = bot;
}

controller.on('create_bot', function(bot, config) {

  if (_bots[bot.config.token]) {
    // already online! do nothing.
  } else {
    bot.startRTM(function(err) {
      if (!err) {
        trackBot(bot);
      }
      bot.startPrivateConversation({
        user: config.createdBy
      }, function(err, convo) {
        if (err) {
          console.log(err);
        } else {
          convo.say('I am a bot that has just joined your team');
          convo.say('You must now /invite me to a channel so that I can be of use!');
        }
      });
    });
  }
});

// Handle events related to the websocket connection to Slack
controller.on('rtm_open', function(bot) {
  console.log('** The RTM api just connected!');
});

params = {
  "apikey": process.env.musixkey,
  "f_has_lyrics": 1,
  "format": "json",
  "page": 1,
  "page_size": 5,
  "s_track_rating": "desc"
}

var sortByPopularity = function(dict){
 
// Create items array
var items = Object.keys(dict).map(function(key) {
    return [key, dict[key]];
});

// Sort the array based on the second element
items.sort(function(first, second) {
    return second[1] - first[1];
});

// Create a new array with only the first 5 items
var items = items.slice(0,7)
// console.log(items.length);

var returnDict = {};

for( var item of items){
  // console.log();
  returnDict[item[0]] = item[1]; 
}
// console.log(returnDict);
return returnDict;
}


controller.hears('.*', ['direct_message', 'direct_mention', 'mention'], function(bot, message) {
  var input = message.text;
  params["q_lyrics"] = input;
  query = "http://api.musixmatch.com/ws/1.1/track.search" + encodeQueryFromArgs(params)
  request.get(query, function(error, response, body) {
    parsed = JSON.parse(body)
    track_list = parsed["message"]["body"]["track_list"]
    var tracks = [];
    for (item in track_list) {
      var item = track_list[item]["track"];
      var track_name = item["track_name"];
      var artist = item["artist_name"];
      // console.log("Info:", track_name, ":", artist);
      var data = {};
      data[track_name] = artist;
      tracks.push(data);
    }
    var trackUrls = {};
    var popularity = {};
    tracks.reduce((seq, n) => {
      return seq.then(() => {
        var track_name = Object.keys(n);
        console.log("info :", track_name, n[track_name]);
        return spotifyApi.searchTracks(track_name, {
            "limit": 10
          })
          .then(
            function(data) {
              for (var track of data.body.tracks.items) {
                for (var spArtist of track.artists) {
                  var s = new difflib.SequenceMatcher(null, spArtist.name.toLowerCase(), n[track_name].toLowerCase());
                  if (s.ratio() >= 0.5) {
                    // console.log("Info:", track.name, ":", spArtist.name.toLowerCase(), ":", n[track_name].toLowerCase(), ":", s.ratio());
                    trackUrls[track.name] = track;
                    popularity[track.name] = track.popularity;
                  }
                }
              }
            },
            function(err) {
              console.error(err);
            }
          );
      });
    }, Promise.resolve()).then(
      () => {
        /*console.log("Info Spotify output:", Object.keys(trackData));
        console.log("Info SequenceMatcher output:", Object.keys(trackUrls));
        */
        // var tracksByPopularity = sortByPopularity(popularity);
        var tracksByPopularity = trackUrls;
        // console.log(tracksByPopularity);
        var reply_message = {
          "attachments": [],
          "reponse_type" : "ephemeral"
        };
        for (var track in tracksByPopularity) {
          console.log(trackUrls[track].name, ":", trackUrls[track].artists[0].name,":", trackUrls[track].popularity);
          reply_message["attachments"].push({
            "text": trackUrls[track].name,
            "fallback": "Unable to play track",
            "callback_id": trackUrls[track].id,
            "color": "#3AA3E3",
            "attachment_type": "default",
            "reponse_type" : "ephemeral",
            "image_url": trackUrls[track].album.images[2].url,
            "actions": [{
              "name": "pick",
              "text": "pick",
              "type": "button",
              "value": "pick"
            }]
          });
        }
        bot.reply(message, reply_message);
        console.log("done");
      },
      (e) => console.log(e)
    );
  });
});

controller.storage.teams.all(function(err, teams) {
  if (err) {
    throw new Error(err);
  }
  for (var t in teams) {
    if (teams[t].bot) {
      controller.spawn(teams[t]).startRTM(function(err, bot) {
        if (err) {
          console.log('Error connecting bot to Slack:', err);
        } else {
          trackBot(bot);
        }
      });
    }
  }
});