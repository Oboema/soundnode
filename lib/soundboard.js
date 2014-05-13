function soundboardServer(io){
    this.fs              = require('fs');
    this.path            = require('path');
    this.user_sound_dir  = "usersounds";
    this.user_config_dir = "userconfig";
    this.client_room_map = {};  // format: {"client_name" : [ {room : "roomname"}, { room: "room_2_name"}] }
    this.io              = io;



    var _this = this;
    function listen(){
        _this.io.sockets.on('connection', function(socket){
            console.log('connection established');
            

            // right moment for sending bootstrap event is handled at client.
            //socket.emit('bootstrap', {username: 'tell me yours'});


            socket.on('bootstrap', function(data){
                console.log('got ['+data.user+']');
                _this.loadConfig(socket, data.user);
                socket.emit('update config', socket.config);
            });

            socket.on('update config', function(data){
                _this.loadConfig(socket, socket.config.user);
                socket.emit('update config', socket.config);
            })
            socket.on( 'disconnect',   function(){
                _this.clientDisconnect(socket);
            });
            

        });
    }

    listen();
}

/*
soundboardServer.prototype.sendConfig = function(socket){
    //var config_json = JSON.parse(this.fs.readFileSync(this.user_config_dir+'/'+socket.user+'.json'));
    socket.emit('update config', socket.config); //config_json);
}
*/
soundboardServer.prototype.clientDisconnect = function(socket){
        console.log('connection Broken');
}


soundboardServer.prototype.loadConfig = function(socket, user){
    console.log('this.user_sound_dir ['+this.user_sound_dir+'], user: ['+user+']');
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
