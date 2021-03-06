var express     = require('express'),
    http        = require('http'), // socket.io expects a server, which express does not return anymore since version 3.x
    socketio    = require('socket.io'),
    jade        = require('jade'),
    Busboy      = require('busboy'),
    soundboard  = require('./lib/soundboard.js'),
    fs          = require('fs');



var app     = express(), 
    server  = http.createServer(app),
    io      = socketio.listen(server),
    config  = JSON.parse(fs.readFileSync('config.json'), 'utf8'),
    clientConfig    = ''+
    'function ClientConfig(){'+
        'this.config = ' + JSON.stringify(config.clientConfig) + '}';
        



app.set('view engine', 'jade');
app.set('view options', {layout: false});

app.use(express.json());
app.use(express.urlencoded());


// Serve config.js. Needs to go above the other js serve route, or it won't work
app.get('/config.js', function(req,res){
    res.writeHead(200, {
    'Content-Length'    : clientConfig.length,
    'Content-Type'      : 'application/javascript' });
    res.end(clientConfig, 'utf-8');
});

//serve the client js en css other than config.js
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
