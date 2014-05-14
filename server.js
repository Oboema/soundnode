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

// Testing variables
app.get('/userboard/config/:user', function(req,res){
    console.log('getting file '+'[userconfig/'+req.params.user+'.json]');
    res.sendfile('userconfig/'+req.params.user+'.json');
});

app.get('/sound/:user/:sound', function(req, res){
    console.log('Serving Sound [usersounds/'+req.params.user+'/'+req.params.sound+']');
    res.sendfile('usersounds/'+req.params.user+'/'+req.params.sound);
});

// route to index page
app.get('/', function(req, res){
    res.render('index');
});

// the page for a soundboard user
app.get('/userboard', function(req,res){
    res.render('userboard');
});

app.get('/player', function(req, res){
    res.render('player');
});

// sound file upload handler
app.use( require('./lib/soundupload.js')); 

// setup soundboard stuff
soundboard  = new soundboard(io);

// Start the server
console.log('config: [%s]', config.port);
var port = config.port;
server.listen(port, function(){
    console.log('Listening on port %d', server.address().port);
});
