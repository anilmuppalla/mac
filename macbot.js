/*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
           ______     ______     ______   __  __     __     ______
          /\  == \   /\  __ \   /\__  _\ /\ \/ /    /\ \   /\__  _\
          \ \  __<   \ \ \/\ \  \/_/\ \/ \ \  _"-.  \ \ \  \/_/\ \/
           \ \_____\  \ \_____\    \ \_\  \ \_\ \_\  \ \_\    \ \_\
            \/_____/   \/_____/     \/_/   \/_/\/_/   \/_/     \/_/


This is a sample Slack Button application that adds a bot to one or many slack teams.

# RUN THE APP:
  Create a Slack app. Make sure to configure the bot user!
    -> https://api.slack.com/applications/new
    -> Add the Redirect URI: http://localhost:3000/oauth
  Run your bot from the command line:
    clientId=<my client id> clientSecret=<my client secret> port=3000 node slackbutton_bot.js
# USE THE APP
  Add the app to your Slack by visiting the login page:
    -> http://localhost:3000/login
  After you've added the app, try talking to your bot!
# EXTEND THE APP:
  Botkit has many features for building cool and useful bots!
  Read all about it here:
    -> http://howdy.ai/botkit
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/

/* Uses the slack button feature to offer a real time bot to multiple teams */
var Botkit = require('botkit');
var env = require('./env.js')
var os = require('os');
var SpotifyWebApi = require('spotify-web-api-node');
var request = require('request')
var difflib = require('difflib');


if (!process.env.clientId || !process.env.clientSecret || !process.env.port || !process.env.redirectUri) {
  console.log('Error: Specify clientId clientSecret redirectUri and port in environment');
  process.exit(1);
}


var controller = Botkit.slackbot({
  json_file_store: './db_slackbutton_bot/',
  // rtm_receive_messages: false, // disable rtm_receive_messages if you enable events api
}).configureSlackApp(
  {
    clientId: process.env.clientId,
    clientSecret: process.env.clientSecret,
    redirectUri: process.env.redirectUri,
    scopes: ['bot'],
  }
);

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

controller.setupWebserver(process.env.port,function(err,webserver) {
  controller.createWebhookEndpoints(controller.webserver);

  controller.createOauthEndpoints(controller.webserver,function(err,req,res) {
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

controller.on('create_bot',function(bot,config) {

  if (_bots[bot.config.token]) {
    // already online! do nothing.
  } else {
    bot.startRTM(function(err) {

      if (!err) {
        trackBot(bot);
      }

      bot.startPrivateConversation({user: config.createdBy},function(err,convo) {
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
controller.on('rtm_open',function(bot) {
  console.log('** The RTM api just connected!');
});

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
  });
});

controller.storage.teams.all(function(err,teams) {

  if (err) {
    throw new Error(err);
  }

  // connect all teams with bots up to slack!
  for (var t in teams) {
    if (teams[t].bot) {
      controller.spawn(teams[t]).startRTM(function(err, bot) {
        if (err) {
          console.log('Error connecting bot to Slack:',err);
        } else {
          trackBot(bot);
        }
      });
    }
  }

});


/*controller.on('rtm_close',function(bot) {
  console.log('** The RTM api just closed');
  bot.startRTM(function(err) {
      if (!err) {
        trackBot(bot);
      }
    });
});

controller.hears('hello','direct_message',function(bot,message) {
  bot.reply(message,'Hello!');
});

controller.hears('^stop','direct_message',function(bot,message) {
  bot.reply(message,'Goodbye');
  bot.rtm.close();
});
controller.on(['direct_message','mention','direct_mention'],function(bot,message) {
  bot.api.reactions.add({
    timestamp: message.ts,
    channel: message.channel,
    name: 'robot_face',
  },function(err) {
    if (err) { console.log(err) }
    bot.reply(message,'I heard you loud and clear boss.');
  });
});
*/