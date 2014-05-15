function soundboardServer(io){
    this.fs              = require('fs');
    this.path            = require('path');
    this.user_sound_dir  = "usersounds";
    this.user_config_dir = "userconfig";
    this.client_room_map = {};  // format: {"client_name" : [ {room : "roomname"}, { room: "room_2_name"}] }
    this.io              = io;
    this.players         = []; // { }

    this.inspect = require('util').inspect;


    var _this = this;
    function listen(){
        _this.io.sockets.on('connection', function(socket){


            // data = {user : username}. Loadconfig loads the user JSON config
            socket.on('bootstrap', function(data){
                _this.loadConfig(socket, data.user);
                socket.emit('update config', socket.config);
            });

            socket.on('update config', function(data){
                _this.loadConfig(socket, socket.config.user);
                socket.emit('update config', socket.config);
                if(socket.player){
                    socket.player.emit('load sounds', { 'config' : socket.config})
                }

            });

            socket.on( 'disconnect',   function(){
                _this.clientDisconnect(socket);
            });
            
            // add the player to the list of players
            socket.on('player logon', function(data){
                var player = data.player;
                _this.players.push( { 'name' : player,
                                       'socket' : socket} );
                console.log('player ['+_this.players.slice(-1)[0].name+'] logged on');
            });


            socket.on( 'user to player signup', function(data){
                //search for the player in the list
                // if not there, return nothing, client doesn't update player if it gets no server response
                console.log('user to player signup');
                _this.players.forEach(function(player){
                    if (player.name == data.player){
                        console.log('player.name ['+player.name+'] == ['+data.player+'] data.player');

                        socket.player = player.socket;
                        socket.emit('user to player signup', data);
                        console.log('user config: '+ _this.inspect(socket.config));
                        socket.player.emit('load sounds', { 'config' : socket.config})
                    }
                });
            });

            socket.on( 'play', function(data){
                console.log('Playing ['+data.sound+']');
                if(socket.player){
                    socket.player.emit('play', {sound : data.sound});

                }
            });
            
            socket.on( 'lulz', function(data){
                console.log('got lulz ['+data.lulz+']');
            });

        });
    }

    listen();
}



soundboardServer.prototype.clientDisconnect = function(socket){
        console.log('connection Broken');
}

soundboardServer.prototype.sendConfig = function(sendto_socket, sendfrom_socket){


}

soundboardServer.prototype.loadConfig = function(socket, user){
    var user_dir = this.path.join(this.user_sound_dir, user),
    user_config  = this.path.join(this.user_config_dir, user+'.json');

    // Create user config file if it's not there
    try{
        stats = this.fs.statSync( user_config);     // check if the file exists 
        console.log('['+user_config + '] already exists');
    } catch (err) {
        var bare_user_config    = {};
        bare_user_config.user   = user;
        bare_user_config.sounds = [];
            
        console.log('creating file ['+user_config + ']');
        this.fs.writeFileSync(user_config, JSON.stringify(bare_user_config));
    }
    
    socket.config = JSON.parse(this.fs.readFileSync(user_config));

    // Create user dir if it's not there
    try{
        var stats = this.fs.statSync( user_dir); 
        if ( stats.isDirectory() ) {
            console.log('user dir already exists, nothing to do.');
        } else {
            console.log('file with name ['+user_dir+'] already exists, but'+
                        ' is not a directory')
        }
    } catch (err){
        console.log('creating user dir ['+user_dir+']');
        this.fs.mkdir(user_dir);   
    }

}

soundboardServer.prototype.initUser = function(socket, user){
    var user_dir    = path.join(this.user_sound_dir, user),
        user_config = path.join(this.user_config_dir, user+'.json');



}

module.exports  = soundboardServer; 
