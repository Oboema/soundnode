var express = require('express'),
    app     = express(), 
    server  = require('http').createServer(app), // socket.io expects a server, which express does not return anymore since version 3.x
    io      = require('socket.io').listen(server),
    fs      = require('fs'),
    path    = require('path'),
    os      = require('os');

var inspect = require('util').inspect;
var Busboy  = require('busboy');

require('jade');
app.set('view engine', 'jade');
app.set('view options', {layout: false});

//app.use(express.bodyParser());
app.use(express.json());
app.use(express.urlencoded());


function formHandler(req, res){

    var busboy  = new Busboy( {headers: req.headers}); 
    var title;

    busboy.on('file', function(fieldname, file, filename, encoding, mimetype){
        //saving the file
        if (!title) {
            console.log('title not found! ['+title+']');
            title   = path.basename(filename);

        }
        title               = path.join(os.tmpDir(), title);

        file.pipe(fs.createWriteStream(title));

        console.log('File [' + fieldname + ']: filename: ' + filename + ', encoding: ' + encoding);
        file.on('data', function(data){
            console.log('File [' + fieldname + '] got ' + data.length + ' bytes');
        });
        file.on('end', function(){
            console.log('File [' + fieldname + '] Finished');
        });


    });

    busboy.on('field', function(fieldname, val, fieldnameTruncated, valTruncated){
        console.log('Field ['+fieldname+']: value: '+inspect(val));
        if (fieldname == 'title'){
            console.log('setting title = '+val);
            title = val;
        }
    });

    busboy.on('finish', function(){
        console.log('Done parsing form!');
        res.send('done uploading sent from server');
        //res.writeHead(303, {Connection: 'close', Location : '/'});
        //res.end();
    });

    req.pipe(busboy);
}


/*
function formHandler(req, res){
    var file,
        file_size,
        uploaded_size,
        title;

    console.log(req.headers);
    req.on('field',
}
*/



// serve public js and css
app.get('/*.(js|css)', function(req,res){
    res.sendfile("./public"+req.url);
});

// route to index page
app.get('/', function(req, res){
    res.render('index');
});

// Start of Form Testing
// to pass form data, you need app.use(express.bodyParser())
// bodyParser is deprecated as it enables an attacker to fill your disk by
// using lots of POST requests
app.get('/form', function(req,res){
    res.render('edit-form');
});

app.post('/user', express.bodyParser(), function(req, res){
    console.log(req.body);
    res.render('user',{
        name: req.body.name,
        email: req.body.email,
        age: req.body.age
    });
});
// End of Form testing

app.get('/userboard', function(req,res){
    res.render('userboard');
});

app.post('/soundupload',  function(req,res){
    formHandler(req, res);

});
    

var numActiveClients = 0;
var activeClients   = [];


io.sockets.on('connection', function(client){
    console.log('connection established');
    numActiveClients += 1;
    activeClients.push(client);
    client.emit('message', {clients:numActiveClients});
    client.broadcast.emit('message', {clients:numActiveClients});
    client.on('disconnect', function(){clientDisconnect(client)});
    
    // New shit below
    client.on('click event', function(data){clientClicked( data)});

});


function clientDisconnect(client){
    console.log('connection Broken');
    numActiveClients   -= 1;
    client.broadcast.emit('message', {clients:numActiveClients});
}

function clientClicked(data){
    console.log('a client sent the event ['+data+']');
    activeClients.forEach( function(client) { 
        client.emit('click event', {button:data});
    });
}



// Start the server
var port = 8080;
server.listen(port, function(){
    console.log('Listening on port %d', server.address().port);
});
