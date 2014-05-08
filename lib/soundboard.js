function soundboardServer(io){
    var _this   = this;
    _this.numActiveClients   = 0;
    _this.activeClients      = [];
    _this.io                 = io;

    function listen(){
        _this.io.sockets.on('connection', function(socket){
            console.log('connection established');
            console.log('numActClients: '+_this.numActiveClients);
            _this.numActiveClients += 1;
            _this.activeClients.push(socket);

            // send # of clients to the new client
            socket.emit(    'message',       { clients : _this.numActiveClients } );
            //send # of clients to all other clients except the new one
            socket.broadcast.emit('message', { clients : _this.numActiveClients } );
            socket.on(      'disconnect',   function(){
                                                clientDisconnect(socket)
                                            });
            
            socket.on('click event', function(data){clientClicked( data)});

        });
    }

    function clientDisconnect(socket){
        console.log('connection Broken');
        _this.numActiveClients   -= 1;
        socket.broadcast.emit('message',    { clients : _this.numActiveClients } );
    }

    function clientClicked(data){
        console.log('a socket sent the event ['+data+']');
        _this.activeClients.forEach( function(socket) { 
            socket.emit('click event',      { button : data } );
        });
    }
    
    listen();
}

module.exports  = soundboardServer; 
