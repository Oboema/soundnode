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

function validateName(name){
    console.log('validating name ['+name+']');
    if(typeof(name) === typeof('jemoeder')){
        return name.match(/^[a-z][a-z-_]+$/i);
    }else{
        return false;
    }
}

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

// the route for a soundboard user
app.get('/userboard/?', function(req,res){
    res.render('userboard', {jade_data : {'user' : null, 'player' : null} });
});

/*
app.get('/userboard/:user/?', function(req,res){
    var valid_user = validateName(req.params.user),
        jade_data  = { 'user'   : null,
                       'player' : null };

    if(valid_user){
        jade_data.user = req.params.user;
        res.render('userboard', {   user:req.params.user,
                                    player:null});
    }else{
        res.redirect('/userboard');
    }
});
*/

app.get('/userboard/:user/:player?/?', function(req,res){
    var user            = req.params.user,
        player          = req.params.player,
        valid_user      = validateName(user),
        valid_player    = validateName(player),
        jade_data       = {   'user'  : null,
                            'player'  : null},
        url             = '/userboard';

    console.log('/userboard/:user/ route: user ['+user+']');
    if(!valid_user){ //if no valid user, try again
        res.redirect(url); //, {jade_data : jade_data});
    }else if(!valid_player){//if only valid user, redirect to user route
        jade_data.user  = user;
        res.render('userboard', { jade_data : jade_data }); 
    }else{
        jade_data.user      = user;
        jade_data.player    = player;
        res.render('userboard',{ jade_data : jade_data  });
    }
});



app.get('/player', function(req, res){
    res.render('player');
});

// sound file upload handler
app.use( require('./lib/soundupload.js')); 

// setup soundboard stuff
soundboard  = new soundboard(io);

app.get('/test/:opt1?/filler/:opt2?', function(req, res){
    var jade_data ={ 'opt1' : null, 'opt2': null};
    jade_data.opt1 = req.params.opt1;
    jade_data.opt2 = req.params.opt2;

    res.render('test', {jade_data : jade_data});
});

// app.get('/test/:sitename/?', function(req, res){
//     res.render('test', {sitename:req.params.sitename, 
//                         page_title:req.params.sitename,
//                         passed_var : 'hoerr'});
// });

// Start the server
console.log('config: [%s]', config.port);
var port = config.port;
server.listen(port, function(){
    console.log('Listening on port %d', server.address().port);
});
