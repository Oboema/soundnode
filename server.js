var express = require('express')
  , app     = express()
  , server  = require('http').createServer(app) // socket.io expects a server, which express does not return anymore since version 3.x
  , io      = require('socket.io').listen(server);

require('jade');
app.set('view engine', 'jade');
app.set('view options', {layout: false});



app.get('/*.(js|css)', function(req,res){
    res.sendfile("./public"+req.url);
});

/* using an html file
app.get('/', function(req, res){
    res.sendfile("index.html");
});
*/

// using jade
app.get('/', function(req, res){
    res.render('index');
});


var activeClients = 0;


io.sockets.on('connection', function(client){
    console.log('connection established');
    activeClients += 1;
    client.emit('message', {clients:activeClients});
    client.broadcast.emit('message', {clients:activeClients});
    client.on('disconnect', function(){clientDisconnect(client)});
});

function clientDisconnect(client){
    console.log('connection Broken');
    activeClients   -= 1;
    client.broadcast.emit('message', {clients:activeClients});
}



// Start the server
var port = 8080;
server.listen(port, function(){
    console.log('Listening on port %d', server.address().port);
});
