var express     = require('express'),
    http        = require('http'), // socket.io expects a server, which express does not return anymore since version 3.x
    socketio    = require('socket.io'),
    jade        = require('jade'),
    Busboy      = require('busboy'),
    soundboard  = require('./lib/soundboard.js');



var app     = express(), 
    server  = http.createServer(app),
    io      = socketio.listen(server);


app.set('view engine', 'jade');
app.set('view options', {layout: false});

app.use(express.json());
app.use(express.urlencoded());


//serve the client js en css
app.get('/*.(js|css)', function(req,res){
    res.sendfile("./public"+req.url);
});

// route to index page
app.get('/', function(req, res){
    res.render('index');
});

// the page for a soundboard user
app.get('/userboard', function(req,res){
    res.render('userboard');
});

// sound file upload handler
app.use( require('./lib/soundupload.js')); 

// setup soundboard stuff
soundboard  = new soundboard(io);

// Start the server
var port = 8080;
server.listen(port, function(){
    console.log('Listening on port %d', server.address().port);
});
