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
  	// console.log(data.callback_id);
    // res.writeHead(200, {'Content-Type': 'text/html'});
    res.json(
    		{
  "replace_original": true,
  "text": "https://open.spotify.com/track/" + data.callback_id,
  "unfurl_media":true

	}
);

    // res.end('https://open.spotify.com/track/' + data.callback_id);
});

// app.listen(port);
app.listen(process.env.PORT || 3000, function(){
  console.log("Express server listening on port %d in %s mode", this.address().port, app.settings.env);
});
console.log('Listening at heroku');

// app.get('/', function(req, res){
//   res.render('form');// if jade
//   // You should use one of line depending on type of frontend you are with
//   res.sendFile(__dirname + '/form.html'); //if html file is root directory
//  res.sendFile("index.html"); //if html file is within public directory
// });

// app.post('/',function(req,res){
//    var username = req.body.username;
//    var htmlData = 'Hello:' + username;
//    res.send(htmlData);
//    console.log(htmlData);
// });

// app.listen(port);




// https = require('https');
// // fs = require('fs');
// server = https.createServer( function(req, res) {

//     console.dir(req.param);

//     if (req.method == 'POST') {
//         console.log("POST");
//         var body = '';
//         req.on('data', function (data) {
//             body += data;
//             console.log("Partial body: " + body);
//         });
//         req.on('end', function () {
//             console.log("Body: " + body);
//         });
//         res.writeHead(200, {'Content-Type': 'text/html'});
//         res.end('post received');
//     }
//     else
//     {
//         console.log("GET");
//         //var html = '<html><body><form method="post" action="https://localhost:3000">Name: <input type="text" name="name" /><input type="submit" value="Submit" /></form></body>';
//         var html = fs.readFileSync('index.html');
//         res.writeHead(200, {'Content-Type': 'text/html'});
//         res.end(html);
//     }

// });

// port=Number(process.env.PORT || 3000);
// host = '127.0.0.1';
// server.listen(port, host);
// console.log('Listening at https://' + host + ':' + port);


