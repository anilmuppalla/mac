var express = require('express');
var bodyParser = require('body-parser');
var app = express();
var fs = require('fs');


app.set('port', (process.env.PORT || 5000));

app.use(express.static(__dirname + '/public'));

app.use(bodyParser.urlencoded({
   extended: false
}));

app.use(bodyParser.json());

app.get('/', function(req, res){
	res.json({ message : "hooray! "});
});


app.post('/', function(req, res){
    console.log('POST ');
    console.log(req.body['payload']);
    var data = JSON.parse(req.body['payload']);
    res.json(
        {

  "replace_original": true,

  "text": "https://open.spotify.com/track/" + data.callback_id,
  "unfurl_media":true,
  "ok":true,
  "ts": data.message_ts,
  "as_user":true
  });
});

app.listen(process.env.PORT || 3000, function(){
  console.log("Express server listening on port %d in %s mode", this.address().port, app.settings.env);
});

console.log('Listening at heroku');
