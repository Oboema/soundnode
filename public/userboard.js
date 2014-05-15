function UserboardInterface(){
    this.config  = new ClientConfig().config;
    this.host    = this.config.host;
    // this.hash    = window.location.hash;
    this.player  = null;
    this.user    = null;
    this.socket  = io.connect(this.host);


    this.usernameInputEl  = $('#input-username');
    // this.usernameInputContainerEl =$('#input-username-container');

    // fire our user check function when a username is put in the box
    var self    = this;
    this.usernameInputEl.change(function() { self.inputUser()}); //this.usernameInputEl) });
    $('#input-playername').change(function() { self.selectPlayer()});
    
    $('#user_input').click(function(){
        self.popupUserInput();
    });
    this.updateState();
    this.formHandler();
    this.socketListeners();
}

UserboardInterface.prototype.updateSounds = function(userconf, _this){
    $('#sounds').html('');
    userconf.sounds.forEach( function(sound){
        console.log('displaying sounds');
        var button_id = _this.user+'-'+sound.file_hash;
        $('#sounds').append('<button id="'+button_id+'">'+sound.title+'</sound>');
        _this.setButtonListener($('#'+button_id), _this.socket);
        });
}


UserboardInterface.prototype.setButtonListener = function(button, socket){
    var data = {    'button_id' : button.attr('id'),
                    'socket'    : socket};

    // yeah i know, data.data ... I just really love star trek TNG
    button.click(data, function(data){
        console.log('sending play id = ['+data.data.button_id+']');
        data.data.socket.emit('play', {'sound' : data.data.button_id});
    });
}

UserboardInterface.prototype.socketListeners = function(){
    var _this = this;

    this.socket.on('lulz', function(msg){
        console.log('got lulz ['+msg.lulz+']');
    });

    this.socket.on('bootstrap', function(msg){
        console.log('got bootstrap: '+ msg.username); 
        _this.socket.emit('bootstrap', {user: _this.user});
    });

    this.socket.on('update config', function(config){
        _this.updateSounds(config, _this);
    });

    this.socket.on('user to player signup', function(player){
        console.log('got user to player signup from server: ['+player.player+']');
        _this.player = player.player;
        // if( window.location.hash.split('/').length < 2){
        //     window.location = window.location+'/'+_this.player;
        // }

        _this.updateState();
    });
}

UserboardInterface.prototype.selectPlayer  = function(){
    var player    = $('#input-playername').val().toLowerCase();
    $('#input-playername').value = $('#input-playername').defaultValue;

    
    if( this.player ){    //if we already have a user 
        console.log('We already have player ['+this.player+']. Should not be in selectPlayer()');

    }else if( this.validateUser(player) ){
        console.log('adding player ['+player+'] to URL hash');
        window.location.hash = window.location.hash + '/' + player;
    }else {
        alert('[ '+player +' ] is not a valid playername.');
    }
    this.updateState(); 

}

UserboardInterface.prototype.updateState = function(){
    var showGUI = false;
    var hash_user, hash_player, hash_split;
    hash_split = window.location.hash.substring(1).toLowerCase().split('/');
    hash_user = hash_split[0];
    hash_player = hash_split[1];

    if(hash_user && !this.user){
        console.log('found a user ['+hash_user+'] in hash, validating..');
        if(this.validateUser(hash_user)) {
            this.user = hash_user;
            this.socket.emit('bootstrap', {user: this.user});
            console.log('set user ['+this.user+']');
        }
    }

    if(!this.player && hash_player){
        if(this.validateUser(hash_player)){
            console.log('connecting to player ['+hash_player+']');
            this.socket.emit('user to player signup', {player : hash_player});
        }
    }

    if(this.user && !this.player){
        $('#input-playername-container').css('display', 'block');
        $('#input-username').css( 'display',  'none');  // hide user input box 
    }

    if(!this.user) {
        $('#input-username').css( 'display',  'block');  // show user input box 
        $('#input-playername-container').css('display', 'none');
    }

    if(this.player){
        $('#input-playername-container').css('display', 'none');
    }

    if(this.user){
        window.location.hash = '#' + this.user;
    }

    if(this.player && window.location.hash.split('/').length < 2){
        window.location.hash = window.location.hash + '/' + this.player;
    }
}

UserboardInterface.prototype.validateUser = function(username){
    return username.match(/^[a-z][a-z-_]+$/i);
}

UserboardInterface.prototype.inputUser = function(){

    var username    = this.usernameInputEl.val().toLowerCase();

    if( this.user ){    //if we already have a user 
        console.log('We already have user ['+this.user+']. Should not be in inputUser()');

    }else if( this.validateUser(username) ){
        console.log('setting username in hash, calling updateState()');
        window.location.hash = '#'+ username;
        this.updateState();
    }else {
        alert('[ '+username +' ] is not a valid username.');
    }

}

UserboardInterface.prototype.formHandler = function(){
    this.formEl  = $('#uploadform');
    console.log('formEl = ['+this.formEl+']');

    var _this = this; //seriously this is getting on my nerves
    this.formEl.submit(function (e) {       
        e.preventDefault();

        if(e.target.elements[3].value){ // if there's a file in the upload box
            var data  = new FormData($(this)[0]);
            $.ajax({
                url         : '/soundupload',
                data        : data,
                user        : this.user,
                processData : false,
                contentType : false,
                //contentType : 'multipart/form-data', //false,
                mimeType    : 'multipart/form-data',
                type        : 'POST',
                success     : function(data){
                    if(data === 'Server says: Upload Finished!'){
                        _this.socket.emit('update config','placeholder');
                    }
                }
            });
        }

    });

}

$(document).ready(function() {
    userboard   = new UserboardInterface();
        

});
