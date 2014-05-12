function soundboardServer(io){
        this.fs               = require('fs');
        this.user_sound_dir       = "usersounds",
        this.user_config_dir      = "userconfig";
        this.client_room_map = {};  // format: {"client_name" : [ {room : "roomname"}, { room: "room_2_name"}] }
        this.io              = io;



    var _this = this;
    function listen(){
        _this.io.sockets.on('connection', function(socket){
            console.log('connection established');
            
            socket.emit('bootstrap', {username: 'tell me yours'});


            socket.on('bootstrap', function(data){
                console.log('got ['+data.user+']');
                socket.user = data.user;
                _this.sendConfig(socket);
            });

            socket.on( 'disconnect',   function(){
                _this.clientDisconnect(socket);
            });
            

        });
    }


    
    listen();
}

soundboardServer.prototype.sendConfig = function(socket){
    var config_json = JSON.parse(this.fs.readFileSync(this.user_config_dir+'/'+socket.user+'.json'));
    socket.emit('config', config_json);
}

soundboardServer.prototype.clientDisconnect = function(socket){
        console.log('connection Broken');
}


module.exports  = soundboardServer; 
