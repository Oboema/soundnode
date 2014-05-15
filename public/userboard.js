function UserboardInterface(){
    this.config  = new ClientConfig().config;
    this.host    = this.config.host;
    this.hash    = document.location.hash;
    this.player  = null;
    this.user    = null;
    this.socket  = io.connect(this.host);


    this.usernameInputEl  = $('#input-username');
    // fire our user check function when a username is put in the box
    var self    = this;
    this.usernameInputEl.change(function() { self.inputUser()}); //this.usernameInputEl) });
    $('#input-playername').change(function() { self.selectPlayer()});
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

        _this.updateState();
    });
}

UserboardInterface.prototype.selectPlayer  = function(){
    var player    = $('#input-playername').val().toLowerCase();
    $('#input-playername').value = $('#input-playername').defaultValue;

    if( this.player ){    //if we already have a user 
        console.log('We already have player ['+this.player+']. Should not be in selectPlayer()');

    }else if( this.validateUser(player) ){
            console.log('sending player ['+player+'] to server');
            this.socket.emit('user to player signup', {player : player});
    }else {
        alert('[ '+player +' ] is not a valid playername.');
    }
 

}
// maybe the next two function could be merged as toggleGuiVisibility or smt
UserboardInterface.prototype.showUserInput  = function(){
    this.usernameInputEl.css( 'display',  'block');  // show input box 
    $('#username').css( 'display', 'none'); // hide name div
    $('#upload').css(   'display', 'none'); // hide upload form
    $('#player-select').css('display', 'none');  // hide player input form

}

UserboardInterface.prototype.showUserBoardGui = function(){
    this.usernameInputEl.css( 'display',  'none');  // hide input box 
    $('#player-select').css('display', 'block');

    $('#username').html(this.user);          // update name div

    $("#hidden_username").attr("value", this.user); // dirty hack to pass the username to the form handler

    $('#username').css( 'display', 'block'); // show name div
    $('#upload').css(   'display', 'block'); // show upload form
    
    // this function gets called from updateState if a username was obtained from either
    // this.user or this.hash. I'm not sure if avoiding code duplication
    // by putting code in unrelated functions is too much of an "ends justify the means"
    // kind of thing though. I guess you can justify it as config updates (will) trigger
    // sound button updates (in the future), which are part of the GUI
    this.socket.emit('bootstrap', {user: this.user});

}

UserboardInterface.prototype.updateState = function(){

    if( this.hash ){
        console.log('got hash: ['+this.hash+']');
        var tmp_user    = this.hash.substring(1).toLowerCase();    //get user from hash
        if( this.validateUser(tmp_user) ){
            this.user   = tmp_user;
            this.showUserBoardGui();
        }
    } else if( this.user  ){
        console.log('got user: ['+this.user+']');
        this.hash   = '#' + this.user;
        document.location.hash  = this.hash;    // and the page URL
        this.showUserBoardGui();
    } else {
        this.showUserInput();
    }

    // Hide/show Player input field
    if(this.player){
        $('#player-select').css('display', 'none');
        $('#username').append(" @ "+this.player);   // update name div

    }else if (this.user){ // don't display player input box when you still need to input user
        $('#player-select').css('display', 'block');        
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
            this.user = username;
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
